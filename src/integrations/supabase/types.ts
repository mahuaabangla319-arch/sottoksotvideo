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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          id: string
          target: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          id?: string
          target?: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          id?: string
          target?: string
        }
        Relationships: []
      }
      app_filters: {
        Row: {
          created_at: string
          css: string
          enabled: boolean
          id: string
          name: string
          sort: number
        }
        Insert: {
          created_at?: string
          css?: string
          enabled?: boolean
          id?: string
          name: string
          sort?: number
        }
        Update: {
          created_at?: string
          css?: string
          enabled?: boolean
          id?: string
          name?: string
          sort?: number
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          announcement: string
          app_name: string
          id: number
          logo_url: string | null
          maintenance_mode: boolean
          theme_color: string
          updated_at: string
        }
        Insert: {
          announcement?: string
          app_name?: string
          id?: number
          logo_url?: string | null
          maintenance_mode?: boolean
          theme_color?: string
          updated_at?: string
        }
        Update: {
          announcement?: string
          app_name?: string
          id?: number
          logo_url?: string | null
          maintenance_mode?: boolean
          theme_color?: string
          updated_at?: string
        }
        Relationships: []
      }
      coin_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          reason: string
          user_id: string
          video_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          reason?: string
          user_id: string
          video_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          reason?: string
          user_id?: string
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coin_transactions_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
          video_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          video_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_id: string
          body: string
          created_at: string
          id: string
          read: boolean
          type: string
          user_id: string
          video_id: string | null
        }
        Insert: {
          actor_id: string
          body?: string
          created_at?: string
          id?: string
          read?: boolean
          type: string
          user_id: string
          video_id?: string | null
        }
        Update: {
          actor_id?: string
          body?: string
          created_at?: string
          id?: string
          read?: boolean
          type?: string
          user_id?: string
          video_id?: string | null
        }
        Relationships: []
      }
      profile_rings: {
        Row: {
          created_at: string
          ring_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ring_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ring_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string
          birth_date: string | null
          coins: number
          created_at: string
          crown_badge: boolean
          followers_count: number
          following_count: number
          full_name: string
          gender: string | null
          golden_frame: boolean
          id: string
          is_blocked: boolean
          is_hidden: boolean
          level: number
          level_badge: boolean
          likes_count: number
          location: string
          sottok_id: string
          updated_at: string
          username: string
          verified: boolean
        }
        Insert: {
          avatar_url?: string | null
          bio?: string
          birth_date?: string | null
          coins?: number
          created_at?: string
          crown_badge?: boolean
          followers_count?: number
          following_count?: number
          full_name?: string
          gender?: string | null
          golden_frame?: boolean
          id: string
          is_blocked?: boolean
          is_hidden?: boolean
          level?: number
          level_badge?: boolean
          likes_count?: number
          location?: string
          sottok_id?: string
          updated_at?: string
          username?: string
          verified?: boolean
        }
        Update: {
          avatar_url?: string | null
          bio?: string
          birth_date?: string | null
          coins?: number
          created_at?: string
          crown_badge?: boolean
          followers_count?: number
          following_count?: number
          full_name?: string
          gender?: string | null
          golden_frame?: boolean
          id?: string
          is_blocked?: boolean
          is_hidden?: boolean
          level?: number
          level_badge?: boolean
          likes_count?: number
          location?: string
          sottok_id?: string
          updated_at?: string
          username?: string
          verified?: boolean
        }
        Relationships: []
      }
      songs: {
        Row: {
          artist: string
          audio_url: string
          category: string
          cover_url: string | null
          created_at: string
          id: string
          is_hidden: boolean
          plays: number
          title: string
          uploaded_by: string | null
        }
        Insert: {
          artist?: string
          audio_url: string
          category?: string
          cover_url?: string | null
          created_at?: string
          id?: string
          is_hidden?: boolean
          plays?: number
          title: string
          uploaded_by?: string | null
        }
        Update: {
          artist?: string
          audio_url?: string
          category?: string
          cover_url?: string | null
          created_at?: string
          id?: string
          is_hidden?: boolean
          plays?: number
          title?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      user_coins: {
        Row: {
          balance: number
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_rings: {
        Row: {
          created_at: string
          id: string
          price: number
          ring_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          price?: number
          ring_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          price?: number
          ring_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      video_likes: {
        Row: {
          created_at: string
          id: string
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_likes_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_reports: {
        Row: {
          created_at: string
          details: string
          id: string
          reason: string
          reporter_id: string
          status: string
          updated_at: string
          video_id: string
        }
        Insert: {
          created_at?: string
          details?: string
          id?: string
          reason?: string
          reporter_id: string
          status?: string
          updated_at?: string
          video_id: string
        }
        Update: {
          created_at?: string
          details?: string
          id?: string
          reason?: string
          reporter_id?: string
          status?: string
          updated_at?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_reports_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          admin_hidden: boolean
          caption: string
          comments_count: number
          created_at: string
          id: string
          is_deleted: boolean
          is_pinned: boolean
          likes: number
          sound_name: string
          thumbnail_url: string | null
          user_id: string
          video_url: string
          views: number
          visibility: string
        }
        Insert: {
          admin_hidden?: boolean
          caption?: string
          comments_count?: number
          created_at?: string
          id?: string
          is_deleted?: boolean
          is_pinned?: boolean
          likes?: number
          sound_name?: string
          thumbnail_url?: string | null
          user_id: string
          video_url: string
          views?: number
          visibility?: string
        }
        Update: {
          admin_hidden?: boolean
          caption?: string
          comments_count?: number
          created_at?: string
          id?: string
          is_deleted?: boolean
          is_pinned?: boolean
          likes?: number
          sound_name?: string
          thumbnail_url?: string | null
          user_id?: string
          video_url?: string
          views?: number
          visibility?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_video_coins: { Args: { _video_id: string }; Returns: number }
      generate_sot_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_video_view: { Args: { _video_id: string }; Returns: undefined }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      purchase_ring: {
        Args: { _price: number; _ring_key: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "super_admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "super_admin"],
    },
  },
} as const
