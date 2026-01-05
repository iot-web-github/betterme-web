export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_chat_history: {
        Row: {
          created_at: string
          id: string
          message: string
          metadata: Json | null
          role: Database["public"]["Enums"]["chat_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          role: Database["public"]["Enums"]["chat_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          role?: Database["public"]["Enums"]["chat_role"]
          user_id?: string
        }
        Relationships: []
      }
      ai_insights: {
        Row: {
          content: string
          created_at: string | null
          date: string
          id: string
          insight_type: string
          metadata: Json | null
          title: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          date: string
          id?: string
          insight_type: string
          metadata?: Json | null
          title: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          date?: string
          id?: string
          insight_type?: string
          metadata?: Json | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_analytics: {
        Row: {
          break_minutes: number | null
          created_at: string
          date: string
          id: string
          productivity_score: number | null
          study_minutes: number | null
          tasks_completed: number | null
          tasks_total: number | null
          user_id: string
        }
        Insert: {
          break_minutes?: number | null
          created_at?: string
          date: string
          id?: string
          productivity_score?: number | null
          study_minutes?: number | null
          tasks_completed?: number | null
          tasks_total?: number | null
          user_id: string
        }
        Update: {
          break_minutes?: number | null
          created_at?: string
          date?: string
          id?: string
          productivity_score?: number | null
          study_minutes?: number | null
          tasks_completed?: number | null
          tasks_total?: number | null
          user_id?: string
        }
        Relationships: []
      }
      daily_checkins: {
        Row: {
          created_at: string
          date: string
          energy: number | null
          exercise: boolean | null
          exercise_duration: number | null
          id: string
          mood: number | null
          notes: string | null
          phone_usage: number | null
          sleep_time: string | null
          stress: number | null
          updated_at: string
          user_id: string
          wake_up_time: string | null
          water_intake: number | null
        }
        Insert: {
          created_at?: string
          date: string
          energy?: number | null
          exercise?: boolean | null
          exercise_duration?: number | null
          id?: string
          mood?: number | null
          notes?: string | null
          phone_usage?: number | null
          sleep_time?: string | null
          stress?: number | null
          updated_at?: string
          user_id: string
          wake_up_time?: string | null
          water_intake?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          energy?: number | null
          exercise?: boolean | null
          exercise_duration?: number | null
          id?: string
          mood?: number | null
          notes?: string | null
          phone_usage?: number | null
          sleep_time?: string | null
          stress?: number | null
          updated_at?: string
          user_id?: string
          wake_up_time?: string | null
          water_intake?: number | null
        }
        Relationships: []
      }
      daily_reflections: {
        Row: {
          completed_tasks: string[] | null
          consistency_level: string | null
          created_at: string | null
          current_mood: string | null
          current_worries: string | null
          daily_intention: string | null
          date: string
          day_rating: number | null
          distractions: string | null
          evening_gratitude: string | null
          exercised_today: boolean | null
          felt_overwhelmed: boolean | null
          habits_followed: string | null
          happy_moments: string | null
          hours_slept: number | null
          id: string
          improvements: string | null
          learnings: string | null
          main_focus: string | null
          morning_energy_level: number | null
          morning_feeling: string | null
          morning_gratitude: string | null
          overall_mood: string | null
          phone_overuse: boolean | null
          physical_energy: number | null
          planned_habits: string[] | null
          planned_health_activity: string[] | null
          productivity_rating: number | null
          project_next_steps: string | null
          project_problems: string | null
          projects_worked_on: string[] | null
          proud_moment: string | null
          reflection_type: string
          social_interaction: boolean | null
          stress_factors: string | null
          study_hours: number | null
          study_subject: string | null
          success_criteria: string | null
          top_tasks_completed: string | null
          top_three_tasks: string[] | null
          updated_at: string | null
          user_id: string
          woke_on_time: boolean | null
        }
        Insert: {
          completed_tasks?: string[] | null
          consistency_level?: string | null
          created_at?: string | null
          current_mood?: string | null
          current_worries?: string | null
          daily_intention?: string | null
          date: string
          day_rating?: number | null
          distractions?: string | null
          evening_gratitude?: string | null
          exercised_today?: boolean | null
          felt_overwhelmed?: boolean | null
          habits_followed?: string | null
          happy_moments?: string | null
          hours_slept?: number | null
          id?: string
          improvements?: string | null
          learnings?: string | null
          main_focus?: string | null
          morning_energy_level?: number | null
          morning_feeling?: string | null
          morning_gratitude?: string | null
          overall_mood?: string | null
          phone_overuse?: boolean | null
          physical_energy?: number | null
          planned_habits?: string[] | null
          planned_health_activity?: string[] | null
          productivity_rating?: number | null
          project_next_steps?: string | null
          project_problems?: string | null
          projects_worked_on?: string[] | null
          proud_moment?: string | null
          reflection_type: string
          social_interaction?: boolean | null
          stress_factors?: string | null
          study_hours?: number | null
          study_subject?: string | null
          success_criteria?: string | null
          top_tasks_completed?: string | null
          top_three_tasks?: string[] | null
          updated_at?: string | null
          user_id: string
          woke_on_time?: boolean | null
        }
        Update: {
          completed_tasks?: string[] | null
          consistency_level?: string | null
          created_at?: string | null
          current_mood?: string | null
          current_worries?: string | null
          daily_intention?: string | null
          date?: string
          day_rating?: number | null
          distractions?: string | null
          evening_gratitude?: string | null
          exercised_today?: boolean | null
          felt_overwhelmed?: boolean | null
          habits_followed?: string | null
          happy_moments?: string | null
          hours_slept?: number | null
          id?: string
          improvements?: string | null
          learnings?: string | null
          main_focus?: string | null
          morning_energy_level?: number | null
          morning_feeling?: string | null
          morning_gratitude?: string | null
          overall_mood?: string | null
          phone_overuse?: boolean | null
          physical_energy?: number | null
          planned_habits?: string[] | null
          planned_health_activity?: string[] | null
          productivity_rating?: number | null
          project_next_steps?: string | null
          project_problems?: string | null
          projects_worked_on?: string[] | null
          proud_moment?: string | null
          reflection_type?: string
          social_interaction?: boolean | null
          stress_factors?: string | null
          study_hours?: number | null
          study_subject?: string | null
          success_criteria?: string | null
          top_tasks_completed?: string | null
          top_three_tasks?: string[] | null
          updated_at?: string | null
          user_id?: string
          woke_on_time?: boolean | null
        }
        Relationships: []
      }
      energy_logs: {
        Row: {
          created_at: string
          date: string
          id: string
          level: number
          note: string | null
          time: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          level: number
          note?: string | null
          time: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          level?: number
          note?: string | null
          time?: string
          user_id?: string
        }
        Relationships: []
      }
      focus_sessions: {
        Row: {
          created_at: string | null
          duration_minutes: number
          ended_at: string | null
          id: string
          notes: string | null
          session_type: string
          started_at: string
          task_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration_minutes: number
          ended_at?: string | null
          id?: string
          notes?: string | null
          session_type: string
          started_at: string
          task_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number
          ended_at?: string | null
          id?: string
          notes?: string | null
          session_type?: string
          started_at?: string
          task_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "focus_sessions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_progress: {
        Row: {
          created_at: string
          date: string
          goal_id: string
          id: string
          notes: string | null
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string
          date: string
          goal_id: string
          id?: string
          notes?: string | null
          user_id: string
          value?: number
        }
        Update: {
          created_at?: string
          date?: string
          goal_id?: string
          id?: string
          notes?: string | null
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_goal_progress_goal"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "user_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_progress_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "user_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string
          description: string | null
          goal_type: Database["public"]["Enums"]["goal_type"]
          id: string
          priority: Database["public"]["Enums"]["priority_level"]
          status: Database["public"]["Enums"]["goal_status"]
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          goal_type: Database["public"]["Enums"]["goal_type"]
          id?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          status?: Database["public"]["Enums"]["goal_status"]
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          goal_type?: Database["public"]["Enums"]["goal_type"]
          id?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          status?: Database["public"]["Enums"]["goal_status"]
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      habit_logs: {
        Row: {
          completed: boolean
          created_at: string
          date: string
          habit_id: string
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          date: string
          habit_id: string
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          date?: string
          habit_id?: string
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_habit_logs_habit"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          color: string
          created_at: string
          frequency: string
          icon: string
          id: string
          name: string
          target_days: number[] | null
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          frequency?: string
          icon?: string
          id?: string
          name: string
          target_days?: number[] | null
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          frequency?: string
          icon?: string
          id?: string
          name?: string
          target_days?: number[] | null
          user_id?: string
        }
        Relationships: []
      }
      health_logs: {
        Row: {
          calories: number | null
          created_at: string
          date: string
          exercise_minutes: number | null
          id: string
          steps: number | null
          updated_at: string
          user_id: string
          water_intake: number | null
        }
        Insert: {
          calories?: number | null
          created_at?: string
          date: string
          exercise_minutes?: number | null
          id?: string
          steps?: number | null
          updated_at?: string
          user_id: string
          water_intake?: number | null
        }
        Update: {
          calories?: number | null
          created_at?: string
          date?: string
          exercise_minutes?: number | null
          id?: string
          steps?: number | null
          updated_at?: string
          user_id?: string
          water_intake?: number | null
        }
        Relationships: []
      }
      mood_entries: {
        Row: {
          created_at: string
          date: string
          id: string
          level: number
          reasons: string | null
          time: string
          triggers: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          level: number
          reasons?: string | null
          time: string
          triggers?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          level?: number
          reasons?: string | null
          time?: string
          triggers?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      motivational_quotes: {
        Row: {
          author: string | null
          category: string | null
          created_at: string
          id: string
          quote: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          created_at?: string
          id?: string
          quote: string
        }
        Update: {
          author?: string | null
          category?: string | null
          created_at?: string
          id?: string
          quote?: string
        }
        Relationships: []
      }
      note_entries: {
        Row: {
          content: string
          created_at: string
          id: string
          note_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          note_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          note_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_note_entries_note"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "note_entries_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          color: string | null
          content: string | null
          created_at: string
          folder: string | null
          id: string
          is_pinned: boolean | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          content?: string | null
          created_at?: string
          folder?: string | null
          id?: string
          is_pinned?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          content?: string | null
          created_at?: string
          folder?: string | null
          id?: string
          is_pinned?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      schedule_blocks: {
        Row: {
          block_type: Database["public"]["Enums"]["block_type"]
          created_at: string
          description: string | null
          end_time: string
          id: string
          is_completed: boolean | null
          scheduled_date: string
          start_time: string
          title: string
          user_id: string
        }
        Insert: {
          block_type: Database["public"]["Enums"]["block_type"]
          created_at?: string
          description?: string | null
          end_time: string
          id?: string
          is_completed?: boolean | null
          scheduled_date: string
          start_time: string
          title: string
          user_id: string
        }
        Update: {
          block_type?: Database["public"]["Enums"]["block_type"]
          created_at?: string
          description?: string | null
          end_time?: string
          id?: string
          is_completed?: boolean | null
          scheduled_date?: string
          start_time?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      schedule_templates: {
        Row: {
          category: string | null
          created_at: string | null
          days_of_week: number[] | null
          description: string | null
          end_time: string
          id: string
          is_active: boolean | null
          priority: string | null
          start_time: string
          title: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          days_of_week?: number[] | null
          description?: string | null
          end_time: string
          id?: string
          is_active?: boolean | null
          priority?: string | null
          start_time: string
          title: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          days_of_week?: number[] | null
          description?: string | null
          end_time?: string
          id?: string
          is_active?: boolean | null
          priority?: string | null
          start_time?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          category: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          goal_id: string | null
          id: string
          priority: Database["public"]["Enums"]["priority_level"]
          scheduled_date: string | null
          scheduled_time: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          user_id: string
        }
        Insert: {
          category?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          goal_id?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          user_id: string
        }
        Update: {
          category?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          goal_id?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      timetable_entries: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          instructor: string | null
          is_recurring: boolean | null
          room_number: string | null
          start_time: string
          subject: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          instructor?: string | null
          is_recurring?: boolean | null
          room_number?: string | null
          start_time: string
          subject: string
          user_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          instructor?: string | null
          is_recurring?: boolean | null
          room_number?: string | null
          start_time?: string
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          created_at: string
          current_value: number | null
          description: string | null
          end_date: string | null
          frequency: string
          goal_type: string
          id: string
          is_active: boolean | null
          is_completed: boolean | null
          start_date: string
          target_value: number | null
          title: string
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_value?: number | null
          description?: string | null
          end_date?: string | null
          frequency: string
          goal_type: string
          id?: string
          is_active?: boolean | null
          is_completed?: boolean | null
          start_date?: string
          target_value?: number | null
          title: string
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_value?: number | null
          description?: string | null
          end_date?: string | null
          frequency?: string
          goal_type?: string
          id?: string
          is_active?: boolean | null
          is_completed?: boolean | null
          start_date?: string
          target_value?: number | null
          title?: string
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          current_schedule: Json | null
          id: string
          initial_setup_completed: boolean | null
          preferred_break_duration: number | null
          productivity_peak:
            | Database["public"]["Enums"]["productivity_peak"]
            | null
          sleep_time: string | null
          study_style: Database["public"]["Enums"]["study_style"] | null
          updated_at: string
          user_id: string
          wake_time: string | null
          work_end_time: string | null
          work_start_time: string | null
        }
        Insert: {
          created_at?: string
          current_schedule?: Json | null
          id?: string
          initial_setup_completed?: boolean | null
          preferred_break_duration?: number | null
          productivity_peak?:
            | Database["public"]["Enums"]["productivity_peak"]
            | null
          sleep_time?: string | null
          study_style?: Database["public"]["Enums"]["study_style"] | null
          updated_at?: string
          user_id: string
          wake_time?: string | null
          work_end_time?: string | null
          work_start_time?: string | null
        }
        Update: {
          created_at?: string
          current_schedule?: Json | null
          id?: string
          initial_setup_completed?: boolean | null
          preferred_break_duration?: number | null
          productivity_peak?:
            | Database["public"]["Enums"]["productivity_peak"]
            | null
          sleep_time?: string | null
          study_style?: Database["public"]["Enums"]["study_style"] | null
          updated_at?: string
          user_id?: string
          wake_time?: string | null
          work_end_time?: string | null
          work_start_time?: string | null
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          created_at: string
          current_streak: number | null
          id: string
          last_active_date: string | null
          longest_streak: number | null
          perfect_days: number | null
          total_tasks_completed: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number | null
          id?: string
          last_active_date?: string | null
          longest_streak?: number | null
          perfect_days?: number | null
          total_tasks_completed?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number | null
          id?: string
          last_active_date?: string | null
          longest_streak?: number | null
          perfect_days?: number | null
          total_tasks_completed?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "user" | "admin"
      block_type:
        | "work"
        | "study"
        | "exercise"
        | "break"
        | "sleep"
        | "personal"
        | "project"
        | "class"
      chat_role: "user" | "assistant" | "system"
      goal_status: "active" | "completed" | "paused" | "archived"
      goal_type: "learning" | "habit" | "project" | "health" | "personal"
      priority_level: "low" | "medium" | "high"
      productivity_peak: "morning" | "afternoon" | "evening" | "night"
      study_style: "visual" | "auditory" | "kinesthetic" | "reading_writing"
      task_status: "pending" | "in_progress" | "completed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "admin"],
      block_type: [
        "work",
        "study",
        "exercise",
        "break",
        "sleep",
        "personal",
        "project",
        "class",
      ],
      chat_role: ["user", "assistant", "system"],
      goal_status: ["active", "completed", "paused", "archived"],
      goal_type: ["learning", "habit", "project", "health", "personal"],
      priority_level: ["low", "medium", "high"],
      productivity_peak: ["morning", "afternoon", "evening", "night"],
      study_style: ["visual", "auditory", "kinesthetic", "reading_writing"],
      task_status: ["pending", "in_progress", "completed", "cancelled"],
    },
  },
} as const
