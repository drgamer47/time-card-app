// This file represents the Supabase database types
// Generated from your schema

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
      shifts: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          scheduled_start: string | null;
          scheduled_end: string | null;
          actual_start: string;
          actual_end: string;
          lunch_start: string | null;
          lunch_end: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          scheduled_start?: string | null;
          scheduled_end?: string | null;
          actual_start: string;
          actual_end: string;
          lunch_start?: string | null;
          lunch_end?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          scheduled_start?: string | null;
          scheduled_end?: string | null;
          actual_start?: string;
          actual_end?: string;
          lunch_start?: string | null;
          lunch_end?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

