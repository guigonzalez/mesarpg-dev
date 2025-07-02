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
      campaign_players: {
        Row: {
          campaign_id: string
          id: string
          joined_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          campaign_id: string
          id?: string
          joined_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          campaign_id?: string
          id?: string
          joined_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_players_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_players_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      campaigns: {
        Row: {
          active_map_id: string | null
          created_at: string | null
          description: string | null
          id: string
          master_id: string
          name: string
          sheet_template: Json
          status: Database["public"]["Enums"]["campaign_status"]
          system: Database["public"]["Enums"]["campaign_system"]
          updated_at: string | null
        }
        Insert: {
          active_map_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          master_id: string
          name: string
          sheet_template?: Json
          status?: Database["public"]["Enums"]["campaign_status"]
          system?: Database["public"]["Enums"]["campaign_system"]
          updated_at?: string | null
        }
        Update: {
          active_map_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          master_id?: string
          name?: string
          sheet_template?: Json
          status?: Database["public"]["Enums"]["campaign_status"]
          system?: Database["public"]["Enums"]["campaign_system"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_campaigns_active_map"
            columns: ["active_map_id"]
            isOneToOne: false
            referencedRelation: "maps"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_messages: {
        Row: {
          author: string
          campaign_id: string
          content: string
          created_at: string | null
          id: string
          type: Database["public"]["Enums"]["message_type"]
        }
        Insert: {
          author: string
          campaign_id: string
          content: string
          created_at?: string | null
          id?: string
          type?: Database["public"]["Enums"]["message_type"]
        }
        Update: {
          author?: string
          campaign_id?: string
          content?: string
          created_at?: string | null
          id?: string
          type?: Database["public"]["Enums"]["message_type"]
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          }
        ]
      }
      drawing_lines: {
        Row: {
          campaign_id: string
          color: string
          created_at: string | null
          id: string
          points: Json
        }
        Insert: {
          campaign_id: string
          color?: string
          created_at?: string | null
          id?: string
          points?: Json
        }
        Update: {
          campaign_id?: string
          color?: string
          created_at?: string | null
          id?: string
          points?: Json
        }
        Relationships: [
          {
            foreignKeyName: "drawing_lines_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          }
        ]
      }
      fog_of_war: {
        Row: {
          campaign_id: string
          created_at: string | null
          id: string
          position_x: number
          position_y: number
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          id?: string
          position_x: number
          position_y: number
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          id?: string
          position_x?: number
          position_y?: number
        }
        Relationships: [
          {
            foreignKeyName: "fog_of_war_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          }
        ]
      }
      handouts: {
        Row: {
          campaign_id: string
          content: string
          created_at: string | null
          id: string
          shared_with_players: boolean | null
          title: string
          type: Database["public"]["Enums"]["handout_type"]
          updated_at: string | null
        }
        Insert: {
          campaign_id: string
          content: string
          created_at?: string | null
          id?: string
          shared_with_players?: boolean | null
          title: string
          type?: Database["public"]["Enums"]["handout_type"]
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string
          content?: string
          created_at?: string | null
          id?: string
          shared_with_players?: boolean | null
          title?: string
          type?: Database["public"]["Enums"]["handout_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "handouts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          }
        ]
      }
      invites: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          invited_by: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      maps: {
        Row: {
          background_url: string
          campaign_id: string
          created_at: string | null
          grid_size: number | null
          id: string
          name: string
          scale: number | null
          updated_at: string | null
        }
        Insert: {
          background_url: string
          campaign_id: string
          created_at?: string | null
          grid_size?: number | null
          id?: string
          name: string
          scale?: number | null
          updated_at?: string | null
        }
        Update: {
          background_url?: string
          campaign_id?: string
          created_at?: string | null
          grid_size?: number | null
          id?: string
          name?: string
          scale?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maps_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          }
        ]
      }
      markers: {
        Row: {
          campaign_id: string
          color: string
          created_at: string | null
          id: string
          label: string | null
          position_x: number
          position_y: number
        }
        Insert: {
          campaign_id: string
          color?: string
          created_at?: string | null
          id?: string
          label?: string | null
          position_x: number
          position_y: number
        }
        Update: {
          campaign_id?: string
          color?: string
          created_at?: string | null
          id?: string
          label?: string | null
          position_x?: number
          position_y?: number
        }
        Relationships: [
          {
            foreignKeyName: "markers_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          }
        ]
      }
      npcs: {
        Row: {
          avatar_url: string | null
          campaign_id: string
          created_at: string | null
          id: string
          name: string
          sheet: Json | null
          token_image: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          campaign_id: string
          created_at?: string | null
          id?: string
          name: string
          sheet?: Json | null
          token_image?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          campaign_id?: string
          created_at?: string | null
          id?: string
          name?: string
          sheet?: Json | null
          token_image?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "npcs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          }
        ]
      }
      tokens: {
        Row: {
          campaign_id: string
          created_at: string | null
          id: string
          image: string
          name: string
          owner_id: string
          position_x: number | null
          position_y: number | null
          type: Database["public"]["Enums"]["token_type"]
          updated_at: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          id?: string
          image: string
          name: string
          owner_id: string
          position_x?: number | null
          position_y?: number | null
          type: Database["public"]["Enums"]["token_type"]
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          id?: string
          image?: string
          name?: string
          owner_id?: string
          position_x?: number | null
          position_y?: number | null
          type?: Database["public"]["Enums"]["token_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tokens_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          campaigns_as_master: number | null
          campaigns_as_player: number | null
          created_at: string | null
          email: string
          id: string
          invited_by: string | null
          name: string
          role: Database["public"]["Enums"]["user_role"] | null
          sheet_data: Json | null
          token_image: string | null
          updated_at: string | null
        }
        Insert: {
          campaigns_as_master?: number | null
          campaigns_as_player?: number | null
          created_at?: string | null
          email: string
          id: string
          invited_by?: string | null
          name: string
          role?: Database["public"]["Enums"]["user_role"] | null
          sheet_data?: Json | null
          token_image?: string | null
          updated_at?: string | null
        }
        Update: {
          campaigns_as_master?: number | null
          campaigns_as_player?: number | null
          created_at?: string | null
          email?: string
          id?: string
          invited_by?: string | null
          name?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          sheet_data?: Json | null
          token_image?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      campaign_status: "active" | "archived" | "deleted"
      campaign_system: "D&D 5e" | "Vampiro: A Máscara" | "Livre"
      field_type: "text" | "number" | "boolean" | "textarea" | "image"
      handout_type: "text" | "image" | "pdf"
      message_type: "player" | "master" | "system" | "dice"
      token_type: "player" | "npc"
      user_role: "master" | "player"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Application-specific types that extend the database types
export type User = Database['public']['Tables']['users']['Row'] & {
  sheetData?: SheetField[]
}

export type Campaign = Database['public']['Tables']['campaigns']['Row'] & {
  players?: User[]
  pendingPlayerIds?: string[]
  tokens?: Token[]
  chat?: ChatMessage[]
  maps?: MapData[]
  npcs?: Npc[]
  handouts?: Handout[]
  markers?: Marker[]
  drawing?: DrawnLine[]
  fogOfWar?: { x: number; y: number }[]
  sheetTemplate: SheetTemplate
}

export type Token = Database['public']['Tables']['tokens']['Row'] & {
  position: { x: number; y: number }
}

export type ChatMessage = Database['public']['Tables']['chat_messages']['Row'] & {
  timestamp: Date
}

export type MapData = Database['public']['Tables']['maps']['Row'] & {
  gridSize: number
}

export type Npc = Database['public']['Tables']['npcs']['Row'] & {
  avatarUrl?: string
  sheet: SheetField[]
  tokenImage?: string
}

export type Handout = Database['public']['Tables']['handouts']['Row'] & {
  sharedWithPlayers: boolean
}

export type Marker = Database['public']['Tables']['markers']['Row'] & {
  position: { x: number; y: number }
}

export type DrawnLine = Database['public']['Tables']['drawing_lines']['Row'] & {
  points: { x: number; y: number }[]
}

export interface SheetField {
  id: string
  name: string
  type: "text" | "number" | "boolean" | "textarea" | "image"
  value: string | number | boolean
  required?: boolean
}

export interface SheetTemplate {
  name: string
  fields: SheetField[]
}

export interface SheetCollection {
  [systemName: string]: SheetTemplate
}

// Helper types for Supabase operations
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
