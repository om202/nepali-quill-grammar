export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string;
          user_id: string | null;
          original_text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          original_text: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          original_text?: string;
          created_at?: string;
        };
      };
      tokens: {
        Row: {
          id: string;
          session_id: string;
          text_segment: string;
          start_index: number;
          end_index: number;
        };
        Insert: {
          id?: string;
          session_id: string;
          text_segment: string;
          start_index: number;
          end_index: number;
        };
        Update: {
          id?: string;
          session_id?: string;
          text_segment?: string;
          start_index?: number;
          end_index?: number;
        };
      };
      suggestions: {
        Row: {
          id: string;
          token_id: string;
          suggested_text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          token_id: string;
          suggested_text: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          token_id?: string;
          suggested_text?: string;
          created_at?: string;
        };
      };
      actions: {
        Row: {
          id: string;
          suggestion_id: string;
          action: 'accept' | 'reject';
          performed_at: string;
        };
        Insert: {
          id?: string;
          suggestion_id: string;
          action: 'accept' | 'reject';
          performed_at?: string;
        };
        Update: {
          id?: string;
          suggestion_id?: string;
          action?: 'accept' | 'reject';
          performed_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
  };
}

export interface SessionModel {
  id: string;
  originalText: string;
  createdAt: string;
  tokens?: TokenModel[];
  actions?: ActionModel[];
}

export interface TokenModel {
  id: string;
  sessionId: string;
  textSegment: string;
  startIndex: number;
  endIndex: number;
  suggestions?: SuggestionModel[];
}

export interface SuggestionModel {
  id: string;
  tokenId: string;
  suggestedText: string;
  createdAt: string;
  action?: 'accept' | 'reject';
}

export interface ActionModel {
  id: string;
  suggestionId: string;
  action: 'accept' | 'reject';
  performedAt: string;
}

export interface DiffModel {
  originalText: string;
  enhancedText: string;
  appliedSuggestions: SuggestionModel[];
  pendingSuggestions: SuggestionModel[];
}