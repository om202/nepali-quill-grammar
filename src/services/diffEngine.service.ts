import { SuggestionModel, DiffModel } from '../types/database.types';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

export const diffEngineService = {
  /**
   * Apply accepted suggestions to create an enhanced text version
   * @param originalText The original text
   * @param suggestions All available suggestions
   * @returns A diff model with original and enhanced text
   */
  async createDiffModel(originalText: string, suggestions: SuggestionModel[]): Promise<DiffModel> {
    // Separate accepted and pending suggestions
    const acceptedSuggestions = suggestions.filter(s => s.action === 'accept');
    const pendingSuggestions = suggestions.filter(s => s.action !== 'accept' && s.action !== 'reject');
    
    if (acceptedSuggestions.length === 0) {
      // No accepted suggestions, return original text
      return {
        originalText,
        enhancedText: originalText,
        appliedSuggestions: acceptedSuggestions,
        pendingSuggestions
      };
    }
    
    // Get token information for accepted suggestions
    const tokenIds = acceptedSuggestions.map(s => s.tokenId);
    const { data: tokens, error } = await supabase
      .from('tokens')
      .select('id, text_segment, start_index, end_index')
      .in('id', tokenIds);

    if (error) {
      logger.error('Error fetching token positions for diff:', error);
      throw error;
    }

    // Create a map of token information
    const tokenMap = new Map(
      tokens.map(t => [t.id, {
        textSegment: t.text_segment,
        startIndex: t.start_index,
        endIndex: t.end_index
      }])
    );
    
    // Create array of changes with position information
    const changes = acceptedSuggestions.map(suggestion => {
      const token = tokenMap.get(suggestion.tokenId);
      if (!token) {
        logger.error(`Missing token data for suggestion ${suggestion.id}`);
        throw new Error(`Missing token data for suggestion ${suggestion.id}`);
      }
      
      return {
        startIndex: token.startIndex,
        endIndex: token.endIndex,
        originalText: token.textSegment,
        suggestedText: suggestion.suggestedText
      };
    });
    
    // Sort changes by start index in descending order to avoid index shifting
    changes.sort((a, b) => b.startIndex - a.startIndex);
    
    // Apply changes to create enhanced text
    let enhancedText = originalText;
    
    for (const change of changes) {
      // Verify that the original text matches what we expect
      const actualText = enhancedText.slice(change.startIndex, change.endIndex);
      if (actualText !== change.originalText) {
        logger.warn(`Text mismatch at position ${change.startIndex}-${change.endIndex}. Expected: "${change.originalText}", Found: "${actualText}"`);
        // Continue anyway, but log the issue
      }
      
      // Replace the text
      enhancedText = enhancedText.slice(0, change.startIndex) + 
                   change.suggestedText + 
                   enhancedText.slice(change.endIndex);
    }
    
    return {
      originalText,
      enhancedText,
      appliedSuggestions: acceptedSuggestions,
      pendingSuggestions
    };
  },
  
  /**
   * Handle overlapping suggestions to prevent conflicts
   * @param suggestions Array of suggestions that might overlap
   * @returns Filtered array with no overlapping suggestions
   */
  async resolveOverlappingSuggestions(suggestions: SuggestionModel[]): Promise<SuggestionModel[]> {
    try {
      // Get token information for all suggestions
      const tokenIds = suggestions.map(s => s.tokenId);
      const { data: tokens, error } = await supabase
        .from('tokens')
        .select('id, start_index, end_index')
        .in('id', tokenIds);

      if (error) {
        logger.error('Error fetching token positions:', error);
        throw error;
      }

      // Create a map of token positions
      const tokenPositions = new Map(
        tokens.map(t => [t.id, [t.start_index, t.end_index]])
      );

      // Sort suggestions by priority (e.g., quality score or timestamp)
      const sortedSuggestions = [...suggestions].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      const appliedRanges: Array<[number, number]> = [];
      const resolvedSuggestions: SuggestionModel[] = [];
      
      for (const suggestion of sortedSuggestions) {
        const range = tokenPositions.get(suggestion.tokenId);
        if (!range) {
          logger.warn(`Missing token position for suggestion ${suggestion.id}`);
          continue;
        }
        
        // Check for overlap with already applied ranges
        const hasOverlap = appliedRanges.some(([start, end]) => {
          return (range[0] >= start && range[0] < end) || // Start overlaps
                 (range[1] > start && range[1] <= end) || // End overlaps
                 (range[0] <= start && range[1] >= end);  // Encompasses
        });
        
        if (!hasOverlap) {
          appliedRanges.push([range[0], range[1]] as [number, number]);
          resolvedSuggestions.push(suggestion);
        }
      }
      
      return resolvedSuggestions;
    } catch (error) {
      logger.error('Error resolving overlapping suggestions:', error);
      // In case of error, return all suggestions
      return suggestions;
    }
  }
};