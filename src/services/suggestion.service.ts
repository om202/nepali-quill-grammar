import { supabase } from '../config/supabase';
import { diffEngineService } from './diffEngine.service';
import { HttpError } from '../utils/httpError';
import { DiffModel, SuggestionModel } from '../types/database.types';
import { logger } from '../utils/logger';

export const suggestionService = {
  async recordAction(suggestionId: string, action: 'accept' | 'reject'): Promise<void> {
    try {
      // Record the action
      const { error } = await supabase
        .from('actions')
        .insert({
          suggestion_id: suggestionId,
          action
        });

      if (error) {
        logger.error('Error recording action:', error);
        throw new HttpError(500, 'Failed to record action');
      }
    } catch (error) {
      logger.error('Error in recordAction:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, 'Failed to record action');
    }
  },

  async getUpdatedDiffModel(sessionId: string): Promise<DiffModel> {
    try {
      // Get session details
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('original_text')
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        logger.error('Error fetching session:', sessionError);
        throw new HttpError(404, 'Session not found');
      }

      // Get all suggestions with actions
      const { data: tokens, error: tokensError } = await supabase
        .from('tokens')
        .select(`
          id, 
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
              action, 
              performed_at
            )
          )
        `)
        .eq('session_id', sessionId);

      if (tokensError) {
        logger.error('Error fetching tokens with suggestions:', tokensError);
        throw new HttpError(500, 'Failed to fetch suggestions');
      }

      // Flatten suggestions and add action information
      const allSuggestions: SuggestionModel[] = [];
      const tokenMap = new Map<string, { textSegment: string; startIndex: number; endIndex: number }>();
      
      tokens.forEach(token => {
        // Store token information for later use
        tokenMap.set(token.id, {
          textSegment: token.text_segment,
          startIndex: token.start_index,
          endIndex: token.end_index
        });
        
        token.suggestions.forEach(suggestion => {
          const action = suggestion.actions.length > 0 
            ? suggestion.actions[0].action as 'accept' | 'reject'
            : undefined;
            
          allSuggestions.push({
            id: suggestion.id,
            tokenId: suggestion.token_id,
            suggestedText: suggestion.suggested_text,
            createdAt: suggestion.created_at,
            action
          });
        });
      });

      // Create diff model (this will update token positions in the database)
      const diffModel = await diffEngineService.createDiffModel(
        session.original_text,
        allSuggestions
      );

      // Refresh token information after diff model creation to get updated positions
      const tokenIds = Array.from(tokenMap.keys());
      const { data: updatedTokens, error: updatedTokensError } = await supabase
        .from('tokens')
        .select('id, text_segment, start_index, end_index')
        .in('id', tokenIds);

      if (updatedTokensError) {
        logger.error('Error fetching updated token positions:', updatedTokensError);
        throw new HttpError(500, 'Failed to fetch updated token positions');
      }

      // Update the token map with fresh data
      const updatedTokenMap = new Map<string, { textSegment: string; startIndex: number; endIndex: number }>();
      updatedTokens.forEach(token => {
        updatedTokenMap.set(token.id, {
          textSegment: token.text_segment,
          startIndex: token.start_index,
          endIndex: token.end_index
        });
      });

      // Add token information to both applied and pending suggestions for frontend
      const enhancedAppliedSuggestions = diffModel.appliedSuggestions.map(suggestion => {
        const tokenInfo = updatedTokenMap.get(suggestion.tokenId);
        if (!tokenInfo) {
          logger.error(`Missing token info for applied suggestion ${suggestion.id}`);
          throw new HttpError(500, 'Missing token information');
        }
        
        return {
          ...suggestion,
          originalText: tokenInfo.textSegment,
          startIndex: tokenInfo.startIndex,
          endIndex: tokenInfo.endIndex
        };
      });

      const enhancedPendingSuggestions = diffModel.pendingSuggestions.map(suggestion => {
        const tokenInfo = updatedTokenMap.get(suggestion.tokenId);
        if (!tokenInfo) {
          logger.error(`Missing token info for pending suggestion ${suggestion.id}`);
          throw new HttpError(500, 'Missing token information');
        }
        
        return {
          ...suggestion,
          originalText: tokenInfo.textSegment,
          startIndex: tokenInfo.startIndex,
          endIndex: tokenInfo.endIndex
        };
      });

      return {
        ...diffModel,
        appliedSuggestions: enhancedAppliedSuggestions,
        pendingSuggestions: enhancedPendingSuggestions
      };
    } catch (error) {
      logger.error('Error in getUpdatedDiffModel:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, 'Failed to get updated text model');
    }
  }
};