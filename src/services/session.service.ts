import { supabase } from '../config/supabase';
import { HttpError } from '../utils/httpError';
import { SessionModel, TokenModel } from '../types/database.types';
import { logger } from '../utils/logger';

export const sessionService = {
  async createSession(text: string, userId?: string): Promise<SessionModel> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          user_id: userId || null,
          original_text: text
        })
        .select('id, original_text, created_at')
        .single();

      if (error) {
        logger.error('Error creating session:', error);
        throw new HttpError(500, 'Failed to create session', error);
      }

      return {
        id: data.id,
        originalText: data.original_text,
        createdAt: data.created_at
      };
    } catch (error) {
      logger.error('Error in createSession:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, 'Failed to create session');
    }
  },

  async getSessionWithDetails(sessionId: string): Promise<SessionModel> {
    try {
      // Get session details
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('id, original_text, created_at')
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        logger.error('Error fetching session:', sessionError);
        throw new HttpError(404, 'Session not found');
      }

      // Get tokens with suggestions
      const { data: tokens, error: tokensError } = await supabase
        .from('tokens')
        .select(`
          id, 
          session_id, 
          text_segment, 
          start_index, 
          end_index,
          suggestions:suggestions(
            id, 
            token_id, 
            suggested_text, 
            created_at,
            actions:actions(
              id, 
              suggestion_id, 
              action, 
              performed_at
            )
          )
        `)
        .eq('session_id', sessionId);

      if (tokensError) {
        logger.error('Error fetching tokens:', tokensError);
        throw new HttpError(500, 'Failed to fetch session tokens');
      }

      // Transform tokens data
      const transformedTokens: TokenModel[] = tokens.map(token => ({
        id: token.id,
        sessionId: token.session_id,
        textSegment: token.text_segment,
        startIndex: token.start_index,
        endIndex: token.end_index,
        suggestions: token.suggestions.map(suggestion => ({
          id: suggestion.id,
          tokenId: suggestion.token_id,
          suggestedText: suggestion.suggested_text,
          createdAt: suggestion.created_at,
          action: suggestion.actions[0]?.action
        }))
      }));

      // Return session with tokens
      return {
        id: session.id,
        originalText: session.original_text,
        createdAt: session.created_at,
        tokens: transformedTokens
      };
    } catch (error) {
      logger.error('Error in getSessionWithDetails:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, 'Failed to get session details');
    }
  }
};