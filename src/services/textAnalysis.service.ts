import { anthropicService } from './anthropic.service';
import { textNormalizationService } from './textNormalization.service';
import { diffEngineService } from './diffEngine.service';
import { supabase } from '../config/supabase';
import { SuggestionModel } from '../types/database.types';
import { HttpError } from '../utils/httpError';
import { logger } from '../utils/logger';

// Extended suggestion model for API response
interface ExtendedSuggestionModel extends SuggestionModel {
  originalText: string;
  startIndex: number;
  endIndex: number;
}

export const textAnalysisService = {
  async analyzeText(text: string, sessionId: string): Promise<{
    suggestions: ExtendedSuggestionModel[];
  }> {
    try {
      // Step 1: Normalize text
      const normalizedText = textNormalizationService.normalizeText(text);
      logger.info('Text normalized');
      
      // Step 2: Get AI suggestions
      const aiSuggestions = await anthropicService.getTextSuggestions(normalizedText);
      logger.info(`Received ${aiSuggestions.length} suggestions from AI`);
      
      // Step 2.5: Verify and correct AI-provided positions
      const correctedSuggestions = aiSuggestions.map((suggestion, index) => {
        const { originalText, start, end } = suggestion;
        
        // Find the actual position of the original text in the normalized text
        const actualStart = normalizedText.indexOf(originalText);
        
        if (actualStart === -1) {
          logger.warn(`Could not find original text "${originalText}" in normalized text at suggestion ${index}`);
          // Try to find a close match or use AI positions as fallback
          return suggestion;
        }
        
        const actualEnd = actualStart + originalText.length;
        
        // Check if AI positions are correct
        if (start !== actualStart || end !== actualEnd) {
          logger.info(`Correcting positions for "${originalText}": AI said ${start}-${end}, actual is ${actualStart}-${actualEnd}`);
          return {
            ...suggestion,
            start: actualStart,
            end: actualEnd
          };
        }
        
        return suggestion;
      });
      
      logger.info(`Position verification complete, ${correctedSuggestions.length} suggestions processed`);

      // Step 3: Store tokens and suggestions in database
      const tokens: Array<{
        id?: string;
        session_id: string;
        text_segment: string;
        start_index: number;
        end_index: number;
      }> = [];
      
      // Map of token indices to their generated IDs
      const tokenIdMap = new Map<number, string>();
      
      // Prepare tokens for insertion
      for (const suggestion of correctedSuggestions) {
        tokens.push({
          session_id: sessionId,
          text_segment: suggestion.originalText,
          start_index: suggestion.start,
          end_index: suggestion.end
        });
      }
      
      // Insert tokens
      const { data: insertedTokens, error: tokensError } = await supabase
        .from('tokens')
        .insert(tokens)
        .select('id, text_segment, start_index, end_index');
      
      if (tokensError) {
        logger.error('Error inserting tokens:', tokensError);
        throw new HttpError(500, 'Failed to save text tokens');
      }
      
      // Map token indices to their generated IDs and store token data
      const tokenDataMap = new Map<string, { textSegment: string; startIndex: number; endIndex: number }>();
      insertedTokens.forEach((token, index) => {
        tokenIdMap.set(index, token.id);
        tokenDataMap.set(token.id, {
          textSegment: token.text_segment,
          startIndex: token.start_index,
          endIndex: token.end_index
        });
      });
      
      // Prepare suggestions for insertion
      const suggestionRecords: Array<{
        token_id: string;
        suggested_text: string;
      }> = [];
      
      correctedSuggestions.forEach((suggestion, index) => {
        const tokenId = tokenIdMap.get(index);
        if (!tokenId) {
          logger.error(`Missing token ID for suggestion at index ${index}`);
          return;
        }
        
        // Use the single suggestion from the AI
        if (suggestion.suggestion) {
          // Filter out suggestions where the suggested text is identical to the original text
          if (suggestion.suggestion.trim() === suggestion.originalText.trim()) {
            logger.info(`Skipping identical suggestion: "${suggestion.originalText}" → "${suggestion.suggestion}"`);
            return;
          }
          
          suggestionRecords.push({
            token_id: tokenId,
            suggested_text: suggestion.suggestion // Use the single suggestion
          });
        }
      });
      
      // Insert suggestions
      const { data: insertedSuggestions, error: suggestionsError } = await supabase
        .from('suggestions')
        .insert(suggestionRecords)
        .select('id, token_id, suggested_text, created_at');
      
      if (suggestionsError) {
        logger.error('Error inserting suggestions:', suggestionsError);
        throw new HttpError(500, 'Failed to save suggestions');
      }
      
      // Transform to API response format with token information
      const suggestions: ExtendedSuggestionModel[] = insertedSuggestions.map(suggestion => {
        const tokenData = tokenDataMap.get(suggestion.token_id);
        if (!tokenData) {
          logger.error(`Missing token data for suggestion ${suggestion.id}`);
          throw new HttpError(500, 'Missing token data for suggestion');
        }
        
        return {
          id: suggestion.id,
          tokenId: suggestion.token_id,
          suggestedText: suggestion.suggested_text,
          createdAt: suggestion.created_at,
          originalText: tokenData.textSegment,
          startIndex: tokenData.startIndex,
          endIndex: tokenData.endIndex
        };
      });
      
      return {
        suggestions
      };
    } catch (error) {
      logger.error('Error in textAnalysis service:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, 'Text analysis failed');
    }
  }
};