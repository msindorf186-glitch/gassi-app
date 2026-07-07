export type UserRole = "luca" | "mutter";
export type PushStage = "first" | "second" | "urgent";

export interface Database {
  public: {
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      push_stage: PushStage;
    };
    CompositeTypes: Record<string, never>;
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          role: UserRole;
          display_name: string;
          avatar_url: string | null;
          email: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          role: UserRole;
          display_name: string;
          avatar_url?: string | null;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      walks: {
        Row: {
          id: string;
          user_id: string;
          walked_at: string;
          duration_min: number | null;
          notes: string | null;
          peed: boolean;
          pooped: boolean;
          drank: boolean;
          has_route: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          walked_at?: string;
          duration_min?: number | null;
          notes?: string | null;
          peed?: boolean;
          pooped?: boolean;
          drank?: boolean;
          has_route?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["walks"]["Insert"]>;
        Relationships: [];
      };
      walk_photos: {
        Row: {
          id: string;
          walk_id: string;
          storage_path: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          walk_id: string;
          storage_path: string;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["walk_photos"]["Insert"]>;
        Relationships: [];
      };
      walk_routes: {
        Row: {
          id: string;
          walk_id: string;
          path: string; // WKT/GeoJSON je nach Query
          distance_m: number | null;
          recorded_from: string | null;
          recorded_to: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          walk_id: string;
          path: string;
          distance_m?: number | null;
          recorded_from?: string | null;
          recorded_to?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["walk_routes"]["Insert"]>;
        Relationships: [];
      };
      reminder_settings: {
        Row: {
          id: boolean;
          start_time: string;
          interval_min: number;
          escalation_min: number;
          day_end_time: string;
          walks_per_day_target: number;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["reminder_settings"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["reminder_settings"]["Row"]>;
        Relationships: [];
      };
      push_texts: {
        Row: { stage: PushStage; message: string };
        Insert: { stage: PushStage; message: string };
        Update: { message?: string };
        Relationships: [];
      };
      reminder_cycles: {
        Row: {
          id: string;
          cycle_start_at: string;
          stage_sent: PushStage | null;
          walk_id: string | null;
          resolved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          cycle_start_at: string;
          stage_sent?: PushStage | null;
          walk_id?: string | null;
          resolved_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["reminder_cycles"]["Insert"]>;
        Relationships: [];
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth_key: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth_key: string;
        };
        Update: Partial<Database["public"]["Tables"]["push_subscriptions"]["Insert"]>;
        Relationships: [];
      };
    };
  };
}
