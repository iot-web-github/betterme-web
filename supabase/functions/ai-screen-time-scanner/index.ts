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

    // Parse the uploaded image from FormData
    const contentType = req.headers.get("content-type") || "";
    let imageBase64: string;
    let imageMimeType: string;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("image") as File | null;
      if (!file) {
        return new Response(JSON.stringify({ error: "No image provided" }), { status: 400, headers: corsHeaders });
      }
      if (file.size > 10 * 1024 * 1024) {
        return new Response(JSON.stringify({ error: "Image too large (max 10MB)" }), { status: 400, headers: corsHeaders });
      }
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      imageBase64 = btoa(String.fromCharCode(...bytes));
      imageMimeType = file.type || "image/png";
    } else {
      // JSON body with base64
      const body = await req.json();
      if (!body.image) {
        return new Response(JSON.stringify({ error: "No image provided" }), { status: 400, headers: corsHeaders });
      }
      imageBase64 = body.image;
      imageMimeType = body.mimeType || "image/png";
    }

    const systemPrompt = `You are an AI that analyzes screenshots of phone screen time reports. Extract the total screen time in minutes from the image. Common screen time interfaces include iOS Screen Time, Android Digital Wellbeing, and third-party apps.

Look for:
- Total daily screen time (e.g., "3h 42m", "5 hours 12 minutes")
- Individual app usage times
- If you see a daily total, use that
- If you only see individual apps, sum them up

Respond ONLY with valid JSON:
{
  "screenTime": <number in minutes>,
  "confidence": <number 0-1>,
  "breakdown": [{"app": "<name>", "minutes": <number>}],
  "rawText": "<the text you read from the image>"
}

If you cannot detect screen time data, return:
{"screenTime": null, "confidence": 0, "breakdown": [], "rawText": ""}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this screen time screenshot and extract the total screen time in minutes." },
              { type: "image_url", image_url: { url: `data:${imageMimeType};base64,${imageBase64}` } },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
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

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-screen-time-scanner error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
