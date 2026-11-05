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
    PostgrestVersion: "14.17"
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
      contest_hashtags: {
        Row: {
          contest_name: string | null
          created_at: string | null
          id: string
          name: string | null
        }
        Insert: {
          contest_name?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
        }
        Update: {
          contest_name?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
        }
        Relationships: []
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
      gifts: {
        Row: {
          created_at: string
          from_user: string
          gift_type: string
          gift_value: number
          id: string
          to_user: string
          video_id: string | null
        }
        Insert: {
          created_at?: string
          from_user: string
          gift_type: string
          gift_value: number
          id?: string
          to_user: string
          video_id?: string | null
        }
        Update: {
          created_at?: string
          from_user?: string
          gift_type?: string
          gift_value?: number
          id?: string
          to_user?: string
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gifts_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      live_room_gifts: {
        Row: {
          coin_amount: number
          created_at: string | null
          gift_icon: string | null
          gift_name: string | null
          id: string
          receiver_id: string | null
          receiver_username: string | null
          room_id: string | null
          sender_id: string | null
          sender_username: string | null
        }
        Insert: {
          coin_amount: number
          created_at?: string | null
          gift_icon?: string | null
          gift_name?: string | null
          id?: string
          receiver_id?: string | null
          receiver_username?: string | null
          room_id?: string | null
          sender_id?: string | null
          sender_username?: string | null
        }
        Update: {
          coin_amount?: number
          created_at?: string | null
          gift_icon?: string | null
          gift_name?: string | null
          id?: string
          receiver_id?: string | null
          receiver_username?: string | null
          room_id?: string | null
          sender_id?: string | null
          sender_username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_room_gifts_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "live_rooms"
            referencedColumns: ["room_id"]
          },
        ]
      }
      live_room_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          room_id: string | null
          type: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          room_id?: string | null
          type?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          room_id?: string | null
          type?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_room_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "live_rooms"
            referencedColumns: ["room_id"]
          },
        ]
      }
      live_room_moderators: {
        Row: {
          added_by: string | null
          id: string
          room_id: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          added_by?: string | null
          id?: string
          room_id?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          added_by?: string | null
          id?: string
          room_id?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_room_moderators_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "live_rooms"
            referencedColumns: ["room_id"]
          },
        ]
      }
      live_room_participants: {
        Row: {
          avatar_url: string | null
          id: string
          is_camera_off: boolean | null
          is_muted: boolean | null
          joined_at: string | null
          role: string | null
          room_id: string | null
          seat_number: number | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          id?: string
          is_camera_off?: boolean | null
          is_muted?: boolean | null
          joined_at?: string | null
          role?: string | null
          room_id?: string | null
          seat_number?: number | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          id?: string
          is_camera_off?: boolean | null
          is_muted?: boolean | null
          joined_at?: string | null
          role?: string | null
          room_id?: string | null
          seat_number?: number | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_room_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "live_rooms"
            referencedColumns: ["room_id"]
          },
        ]
      }
      live_room_requests: {
        Row: {
          created_at: string | null
          id: string
          room_id: string | null
          status: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          room_id?: string | null
          status?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          room_id?: string | null
          status?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_room_requests_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "live_rooms"
            referencedColumns: ["room_id"]
          },
        ]
      }
      live_rooms: {
        Row: {
          cover_url: string | null
          created_at: string | null
          description: string | null
          ended_at: string | null
          host_id: string | null
          host_username: string | null
          id: string
          name: string
          room_id: string
          status: string | null
          type: string
          viewer_count: number | null
          visibility: string | null
        }
        Insert: {
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          host_id?: string | null
          host_username?: string | null
          id?: string
          name: string
          room_id: string
          status?: string | null
          type: string
          viewer_count?: number | null
          visibility?: string | null
        }
        Update: {
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          host_id?: string | null
          host_username?: string | null
          id?: string
          name?: string
          room_id?: string
          status?: string | null
          type?: string
          viewer_count?: number | null
          visibility?: string | null
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
          referred_by: string | null
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
          referred_by?: string | null
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
          referred_by?: string | null
          sottok_id?: string
          updated_at?: string
          username?: string
          verified?: boolean
        }
        Relationships: []
      }
      room_members: {
        Row: {
          banned: boolean
          force_muted: boolean
          joined_at: string
          muted: boolean
          role: string
          room_id: string
          seat: number | null
          user_id: string
        }
        Insert: {
          banned?: boolean
          force_muted?: boolean
          joined_at?: string
          muted?: boolean
          role?: string
          room_id: string
          seat?: number | null
          user_id: string
        }
        Update: {
          banned?: boolean
          force_muted?: boolean
          joined_at?: string
          muted?: boolean
          role?: string
          room_id?: string
          seat?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      room_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          kind: string
          room_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          kind?: string
          room_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          kind?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          code: string
          cover_url: string | null
          created_at: string
          description: string
          id: string
          is_active: boolean
          kind: string
          member_count: number
          owner_id: string
          title: string
        }
        Insert: {
          code?: string
          cover_url?: string | null
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          kind: string
          member_count?: number
          owner_id: string
          title: string
        }
        Update: {
          code?: string
          cover_url?: string | null
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          kind?: string
          member_count?: number
          owner_id?: string
          title?: string
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
          category: string
          comments_count: number
          created_at: string
          gifts_count: number
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
          category?: string
          comments_count?: number
          created_at?: string
          gifts_count?: number
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
          category?: string
          comments_count?: number
          created_at?: string
          gifts_count?: number
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
      can_read_song_object: { Args: { object_name: string }; Returns: boolean }
      claim_referral: { Args: { _sot_id: string }; Returns: string }
      daily_creator_ranking: {
        Args: never
        Returns: {
          sottok_id: string
          total_likes: number
          total_views: number
          username: string
          video_count: number
        }[]
      }
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
      join_room: { Args: { _room: string }; Returns: string }
      leave_room: { Args: { _room: string }; Returns: undefined }
      leave_seat: { Args: { _room: string }; Returns: undefined }
      moderate_room: {
        Args: { _action: string; _room: string; _target: string }
        Returns: string
      }
      purchase_ring: {
        Args: { _price: number; _ring_key: string }
        Returns: string
      }
      room_role: { Args: { _room: string; _uid: string }; Returns: string }
      send_gift: {
        Args: { _gift_type: string; _video_id: string }
        Returns: string
      }
      send_room_gift: {
        Args: { _gift: string; _room: string; _to: string }
        Returns: string
      }
      set_my_mute: { Args: { _muted: boolean; _room: string }; Returns: string }
      take_seat: { Args: { _room: string; _seat: number }; Returns: string }
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
