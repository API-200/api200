export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string | null
          id: number
          key: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          key: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          key?: string
          user_id?: string
        }
        Relationships: []
      }
      endpoints: {
        Row: {
          cache_enabled: boolean
          cache_ttl_s: number | null
          created_at: string | null
          data_mapping_enabled: boolean
          data_mapping_function: string | null
          fallback_response: Json | null
          fallback_response_enabled: boolean
          fallback_status_code: number | null
          full_url: string
          id: number
          method: string
          mock_enabled: boolean
          mock_response: Json | null
          mock_status_code: number | null
          name: string
          regex_path: string | null
          retry_count: number
          retry_enabled: boolean
          retry_interval_s: number
          service_id: number
          updated_at: string | null
        }
        Insert: {
          cache_enabled?: boolean
          cache_ttl_s?: number | null
          created_at?: string | null
          data_mapping_enabled?: boolean
          data_mapping_function?: string | null
          fallback_response?: Json | null
          fallback_response_enabled?: boolean
          fallback_status_code?: number | null
          full_url: string
          id?: number
          method: string
          mock_enabled?: boolean
          mock_response?: Json | null
          mock_status_code?: number | null
          name: string
          regex_path?: string | null
          retry_count?: number
          retry_enabled?: boolean
          retry_interval_s?: number
          service_id: number
          updated_at?: string | null
        }
        Update: {
          cache_enabled?: boolean
          cache_ttl_s?: number | null
          created_at?: string | null
          data_mapping_enabled?: boolean
          data_mapping_function?: string | null
          fallback_response?: Json | null
          fallback_response_enabled?: boolean
          fallback_status_code?: number | null
          full_url?: string
          id?: number
          method?: string
          mock_enabled?: boolean
          mock_response?: Json | null
          mock_status_code?: number | null
          name?: string
          regex_path?: string | null
          retry_count?: number
          retry_enabled?: boolean
          retry_interval_s?: number
          service_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "endpoints_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      logs: {
        Row: {
          cache_hit: boolean
          correlation_id: string
          endpoint_id: number
          error: Json | null
          finished_at: string
          id: number
          ip: string
          is_fallback_response: boolean
          is_mock_response: boolean
          req_body: Json | null
          req_headers: Json
          req_url: string
          res_body: Json | null
          res_code: number | null
          res_headers: Json | null
          retry_number: number | null
          started_at: string
          took_ms: number | null
        }
        Insert: {
          cache_hit?: boolean
          correlation_id: string
          endpoint_id: number
          error?: Json | null
          finished_at: string
          id?: number
          ip?: string
          is_fallback_response?: boolean
          is_mock_response?: boolean
          req_body?: Json | null
          req_headers?: Json
          req_url: string
          res_body?: Json | null
          res_code?: number | null
          res_headers?: Json | null
          retry_number?: number | null
          started_at: string
          took_ms?: number | null
        }
        Update: {
          cache_hit?: boolean
          correlation_id?: string
          endpoint_id?: number
          error?: Json | null
          finished_at?: string
          id?: number
          ip?: string
          is_fallback_response?: boolean
          is_mock_response?: boolean
          req_body?: Json | null
          req_headers?: Json
          req_url?: string
          res_body?: Json | null
          res_code?: number | null
          res_headers?: Json | null
          retry_number?: number | null
          started_at?: string
          took_ms?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "logs_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          auth_config: Json | null
          auth_enabled: boolean
          auth_type: string | null
          base_url: string
          created_at: string | null
          description: string | null
          id: number
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auth_config?: Json | null
          auth_enabled?: boolean
          auth_type?: string | null
          base_url: string
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          auth_config?: Json | null
          auth_enabled?: boolean
          auth_type?: string | null
          base_url?: string
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      usages: {
        Row: {
          billing_started_at: string
          calls_count: number
          id: number
          user_id: string
        }
        Insert: {
          billing_started_at?: string
          calls_count?: number
          id?: number
          user_id: string
        }
        Update: {
          billing_started_at?: string
          calls_count?: number
          id?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_route_data: {
        Args: {
          p_service_name: string
          p_user_id: string
          p_endpoint_name: string
        }
        Returns: Json
      }
      increment_usage: {
        Args: {
          p_user_id: string
          p_max_requests: number
        }
        Returns: {
          allowed: boolean
          c_count: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
