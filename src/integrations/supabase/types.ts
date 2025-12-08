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
