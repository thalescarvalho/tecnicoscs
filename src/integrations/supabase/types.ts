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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          acao: string
          created_at: string
          id: string
          payload: Json | null
          trabalho_id: string | null
          user_id: string
        }
        Insert: {
          acao: string
          created_at?: string
          id?: string
          payload?: Json | null
          trabalho_id?: string | null
          user_id: string
        }
        Update: {
          acao?: string
          created_at?: string
          id?: string
          payload?: Json | null
          trabalho_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_trabalho_id_fkey"
            columns: ["trabalho_id"]
            isOneToOne: false
            referencedRelation: "trabalhos"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes: {
        Row: {
          cliente_nome: string | null
          comentario: string | null
          created_at: string
          id: string
          nota: number
          trabalho_id: string
        }
        Insert: {
          cliente_nome?: string | null
          comentario?: string | null
          created_at?: string
          id?: string
          nota: number
          trabalho_id: string
        }
        Update: {
          cliente_nome?: string | null
          comentario?: string | null
          created_at?: string
          id?: string
          nota?: number
          trabalho_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_trabalho_id_fkey"
            columns: ["trabalho_id"]
            isOneToOne: false
            referencedRelation: "trabalhos"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          created_at: string
          email: string | null
          endereco: string
          id: string
          nome: string
          referencia: string | null
          telefone: string
          vendedor: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          endereco: string
          id?: string
          nome: string
          referencia?: string | null
          telefone: string
          vendedor?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          endereco?: string
          id?: string
          nome?: string
          referencia?: string | null
          telefone?: string
          vendedor?: string | null
        }
        Relationships: []
      }
      fotos: {
        Row: {
          created_at: string
          id: string
          legenda: string | null
          trabalho_id: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          legenda?: string | null
          trabalho_id: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          legenda?: string | null
          trabalho_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "fotos_trabalho_id_fkey"
            columns: ["trabalho_id"]
            isOneToOne: false
            referencedRelation: "trabalhos"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_produzidos: {
        Row: {
          created_at: string
          id: string
          nome_produto: string
          observacao: string | null
          peso_unidade: string
          peso_valor: number
          quantidade: number | null
          trabalho_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome_produto: string
          observacao?: string | null
          peso_unidade?: string
          peso_valor: number
          quantidade?: number | null
          trabalho_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nome_produto?: string
          observacao?: string | null
          peso_unidade?: string
          peso_valor?: number
          quantidade?: number | null
          trabalho_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "itens_produzidos_trabalho_id_fkey"
            columns: ["trabalho_id"]
            isOneToOne: false
            referencedRelation: "trabalhos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ativo: boolean
          avatar_url: string | null
          created_at: string
          id: string
          nome: string
          telefone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          avatar_url?: string | null
          created_at?: string
          id?: string
          nome: string
          telefone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          avatar_url?: string | null
          created_at?: string
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trabalhos: {
        Row: {
          cliente_id: string
          created_at: string
          data_prevista: string
          descricao: string
          end_at: string | null
          end_lat: number | null
          end_lng: number | null
          gestor_id: string
          id: string
          observacoes_gestor: string | null
          observacoes_tecnico: string | null
          prioridade: Database["public"]["Enums"]["prioridade"]
          start_accuracy: number | null
          start_at: string | null
          start_lat: number | null
          start_lng: number | null
          status: Database["public"]["Enums"]["trabalho_status"]
          tecnico_id: string
          tipo_servico: string
          titulo: string
          updated_at: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data_prevista: string
          descricao: string
          end_at?: string | null
          end_lat?: number | null
          end_lng?: number | null
          gestor_id: string
          id?: string
          observacoes_gestor?: string | null
          observacoes_tecnico?: string | null
          prioridade?: Database["public"]["Enums"]["prioridade"]
          start_accuracy?: number | null
          start_at?: string | null
          start_lat?: number | null
          start_lng?: number | null
          status?: Database["public"]["Enums"]["trabalho_status"]
          tecnico_id: string
          tipo_servico: string
          titulo: string
          updated_at?: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data_prevista?: string
          descricao?: string
          end_at?: string | null
          end_lat?: number | null
          end_lng?: number | null
          gestor_id?: string
          id?: string
          observacoes_gestor?: string | null
          observacoes_tecnico?: string | null
          prioridade?: Database["public"]["Enums"]["prioridade"]
          start_accuracy?: number | null
          start_at?: string | null
          start_lat?: number | null
          start_lng?: number | null
          status?: Database["public"]["Enums"]["trabalho_status"]
          tecnico_id?: string
          tipo_servico?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trabalhos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_or_gestor: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "gestor" | "tecnico" | "admin"
      prioridade: "BAIXA" | "MEDIA" | "ALTA" | "URGENTE"
      trabalho_status: "PENDENTE" | "ANDAMENTO" | "CONCLUIDO" | "CANCELADO"
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
      app_role: ["gestor", "tecnico", "admin"],
      prioridade: ["BAIXA", "MEDIA", "ALTA", "URGENTE"],
      trabalho_status: ["PENDENTE", "ANDAMENTO", "CONCLUIDO", "CANCELADO"],
    },
  },
} as const
