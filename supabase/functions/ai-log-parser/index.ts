import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const userId = claimsData.claims.sub;

    const { text } = await req.json();
    if (!text || typeof text !== "string" || text.length > 5000) {
      return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400, headers: corsHeaders });
    }

    const systemPrompt = `You are an AI assistant for a life-tracking app called BetterMe. The user will describe their day in natural language. You must extract structured data from their description AND identify any tasks/to-dos they mention.

Extract the following check-in fields (return null for any you can't determine):
- wakeUpTime: string in "HH:MM" 24h format
- sleepTime: string in "HH:MM" 24h format (when they went to bed last night)
- phoneUsage: number in minutes
- mood: number 1-5 (1=terrible, 5=great)
- energy: number 1-5 (1=exhausted, 5=energetic)
- stress: number 1-5 (1=relaxed, 5=very stressed)
- waterIntake: number of glasses
- exercise: boolean
- exerciseDuration: number in minutes (if exercise is true)
- notes: string summary of their reflections

Also extract tasks they mentioned or implied:
- tasks: array of objects with { title: string, priority: "low"|"medium"|"high", category: string|null, scheduled_date: string|null (YYYY-MM-DD), duration_minutes: number|null }

Also extract any tool-related data updates:
- moodEntry: { level: number 1-5, reasons: string } or null
- energyEntry: { level: number 1-5, note: string } or null

Respond ONLY with valid JSON matching this schema. No markdown, no explanation.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content;
    if (!content) throw new Error("No AI response");

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error("Failed to parse AI response");
    }

    // Create tasks in the database if any were extracted
    const createdTasks = [];
    if (parsed.tasks && Array.isArray(parsed.tasks) && parsed.tasks.length > 0) {
      const today = new Date().toISOString().split("T")[0];
      for (const task of parsed.tasks.slice(0, 10)) {
        const { data: taskData, error: taskError } = await supabase.from("tasks").insert({
          user_id: userId,
          title: String(task.title || "").slice(0, 255),
          priority: ["low", "medium", "high"].includes(task.priority) ? task.priority : "medium",
          category: task.category || null,
          scheduled_date: task.scheduled_date || today,
          duration_minutes: task.duration_minutes || null,
          status: "pending",
        }).select().single();

        if (!taskError && taskData) createdTasks.push(taskData);
      }
    }

    // Save mood entry if extracted
    if (parsed.moodEntry && parsed.moodEntry.level) {
      const now = new Date();
      await supabase.from("mood_entries").insert({
        user_id: userId,
        date: now.toISOString().split("T")[0],
        time: now.toTimeString().split(" ")[0].slice(0, 5),
        level: Math.max(1, Math.min(5, Number(parsed.moodEntry.level))),
        reasons: parsed.moodEntry.reasons || null,
      });
    }

    // Save energy entry if extracted
    if (parsed.energyEntry && parsed.energyEntry.level) {
      const now = new Date();
      await supabase.from("energy_logs").insert({
        user_id: userId,
        date: now.toISOString().split("T")[0],
        time: now.toTimeString().split(" ")[0].slice(0, 5),
        level: Math.max(1, Math.min(5, Number(parsed.energyEntry.level))),
        note: parsed.energyEntry.note || null,
      });
    }

    return new Response(JSON.stringify({
      ...parsed,
      createdTasks,
      tasksCreated: createdTasks.length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-log-parser error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
