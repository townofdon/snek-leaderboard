export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      "snek-leaderboard": {
        Row: {
          created_at: string
          id: string
          name: string
          score: number
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          score?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          score?: number
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
