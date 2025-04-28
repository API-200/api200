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
          custom_headers: Json | null
          custom_headers_enabled: boolean | null
          data_mapping_enabled: boolean
          data_mapping_function: string | null
          description: string | null
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
          path: string | null
          regex_path: string | null
          retry_count: number
          retry_enabled: boolean
          retry_interval_s: number
          schema: Json | null
          service_id: number
          source: string | null
          updated_at: string | null
        }
        Insert: {
          cache_enabled?: boolean
          cache_ttl_s?: number | null
          created_at?: string | null
          custom_headers?: Json | null
          custom_headers_enabled?: boolean | null
          data_mapping_enabled?: boolean
          data_mapping_function?: string | null
          description?: string | null
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
          path?: string | null
          regex_path?: string | null
          retry_count?: number
          retry_enabled?: boolean
          retry_interval_s?: number
          schema?: Json | null
          service_id: number
          source?: string | null
          updated_at?: string | null
        }
        Update: {
          cache_enabled?: boolean
          cache_ttl_s?: number | null
          created_at?: string | null
          custom_headers?: Json | null
          custom_headers_enabled?: boolean | null
          data_mapping_enabled?: boolean
          data_mapping_function?: string | null
          description?: string | null
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
          path?: string | null
          regex_path?: string | null
          retry_count?: number
          retry_enabled?: boolean
          retry_interval_s?: number
          schema?: Json | null
          service_id?: number
          source?: string | null
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
      endpoints_response_schema_history: {
        Row: {
          created_at: string | null
          endpoint_id: number
          id: number
          schema: Json | null
        }
        Insert: {
          created_at?: string | null
          endpoint_id: number
          id?: number
          schema?: Json | null
        }
        Update: {
          created_at?: string | null
          endpoint_id?: number
          id?: number
          schema?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "endpoints_response_schema_history_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          created_at: string | null
          details: Json
          endpoint_id: number
          id: number
          resolved: boolean | null
          title: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          details: Json
          endpoint_id: number
          id?: never
          resolved?: boolean | null
          title: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json
          endpoint_id?: number
          id?: never
          resolved?: boolean | null
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incidents_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      logs: {
        Row: {
          cache_hit: boolean
          correlation_id: string
          created_at: string
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
          created_at?: string
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
          created_at?: string
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
          is_mcp_enabled: boolean
          name: string
          source: string | null
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
          is_mcp_enabled?: boolean
          name: string
          source?: string | null
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
          is_mcp_enabled?: boolean
          name?: string
          source?: string | null
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
          p_method: string
        }
        Returns: Json
      }
      increment_mcp_usage: {
        Args: { p_user_id: string; p_max_requests: number }
        Returns: {
          allowed: boolean
          c_count: number
        }[]
      }
      increment_usage: {
        Args: { p_user_id: string; p_max_requests: number }
        Returns: {
          allowed: boolean
          c_count: number
        }[]
      }
      update_full_url: {
        Args: { p_service_id: number }
        Returns: undefined
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
