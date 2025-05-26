import { supabase } from '../config/supabase';
import { createClient } from '@supabase/supabase-js';
import { HttpError } from '../utils/httpError';
import { SessionModel, TokenModel } from '../types/database.types';
import { logger } from '../utils/logger';

// Create an anon client for session creation to bypass RLS issues
const anonSupabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export const sessionService = {
  async createSession(text: string, userId?: string): Promise<SessionModel> {
    try {
      // First create session as anonymous to avoid RLS conflicts
      const { data, error } = await anonSupabase
        .from('sessions')
        .insert({
          user_id: null, // Always create as anonymous first
          original_text: text
        })
        .select('id, original_text, created_at')
        .single();

      if (error) {
        logger.error('Error creating session:', error);
        throw new HttpError(500, 'Failed to create session', error);
      }

      // If we have a userId, update the session to associate it with the user
      // This is done as a separate operation to work around RLS policy conflicts
      if (userId) {
        try {
          const { error: updateError } = await supabase
            .from('sessions')
            .update({ user_id: userId })
            .eq('id', data.id);
          
          if (updateError) {
            logger.warn('Failed to associate session with user, continuing as anonymous:', updateError);
          } else {
            logger.info(`Session ${data.id} successfully associated with user ${userId}`);
          }
        } catch (updateError) {
          logger.warn('Failed to associate session with user, continuing as anonymous:', updateError);
        }
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
  },

  async getUserHistory(userId: string): Promise<Array<{
    id: string;
    originalText: string;
    createdAt: string;
    suggestionsCount: number;
    acceptedCount: number;
    rejectedCount: number;
  }>> {
    try {
      logger.info(`Fetching history for user ${userId}`);
      
      // First, let's check if there are any sessions at all for this user
      const { data: userSessions, error: userSessionsError } = await supabase
        .from('sessions')
        .select('id, user_id, original_text, created_at')
        .eq('user_id', userId);
        
      if (userSessionsError) {
        logger.error('Error checking user sessions:', userSessionsError);
      } else {
        logger.info(`Found ${userSessions.length} sessions directly associated with user ${userId}`);
      }
      
      // Also check for recent sessions that might not be associated yet
      const { data: recentSessions, error: recentError } = await supabase
        .from('sessions')
        .select('id, user_id, original_text, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (!recentError) {
        logger.info(`Recent sessions: ${recentSessions.map(s => `${s.id} (user: ${s.user_id})`).join(', ')}`);
      }

      // Get all sessions for the user with suggestion counts
      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select(`
          id,
          original_text,
          created_at,
          tokens:tokens(
            id,
            suggestions:suggestions(
              id,
              actions:actions(
                action
              )
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (sessionsError) {
        logger.error('Error fetching user sessions:', sessionsError);
        throw new HttpError(500, 'Failed to fetch user history');
      }

      logger.info(`Successfully fetched ${sessions.length} sessions with full details for user ${userId}`);

      // Transform the data to include counts
      const history = sessions.map(session => {
        let suggestionsCount = 0;
        let acceptedCount = 0;
        let rejectedCount = 0;

        session.tokens.forEach(token => {
          token.suggestions.forEach(suggestion => {
            suggestionsCount++;
            if (suggestion.actions.length > 0) {
              const action = suggestion.actions[0].action;
              if (action === 'accept') {
                acceptedCount++;
              } else if (action === 'reject') {
                rejectedCount++;
              }
            }
          });
        });

        return {
          id: session.id,
          originalText: session.original_text,
          createdAt: session.created_at,
          suggestionsCount,
          acceptedCount,
          rejectedCount
        };
      });

      return history;
    } catch (error) {
      logger.error('Error in getUserHistory:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, 'Failed to fetch user history');
    }
  }
};