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
  createDiffModel(originalText: string, suggestions: SuggestionModel[]): DiffModel {
    // Separate accepted and pending suggestions
    const acceptedSuggestions = suggestions.filter(s => s.action === 'accept');
    const pendingSuggestions = suggestions.filter(s => s.action !== 'accept' && s.action !== 'reject');
    
    // Sort accepted suggestions by start index in descending order
    // to avoid index shifting when applying changes
    const sortedAccepted = [...acceptedSuggestions].sort((a, b) => {
      const tokenIdA = a.tokenId;
      const tokenIdB = b.tokenId;
      
      // Get start index from token IDs (assuming we've stored this information)
      // In a real implementation, we'd look up the token information
      return tokenIdB.localeCompare(tokenIdA);
    });
    
    // Apply changes to create enhanced text
    let enhancedText = originalText;
    
    for (const suggestion of sortedAccepted) {
      // In a real implementation, we'd use the token's start and end indices
      // For this example, we'll just replace the first occurrence
      enhancedText = enhancedText.replace(
        originalText.substring(0, 10), // Placeholder for actual token text
        suggestion.suggestedText
      );
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
          appliedRanges.push(range);
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