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
    
    // Get token IDs that have accepted suggestions
    const acceptedTokenIds = new Set(acceptedSuggestions.map(s => s.tokenId));
    
    // Filter pending suggestions: exclude rejected AND exclude any suggestions for tokens that already have accepted suggestions
    const pendingSuggestions = suggestions.filter(s => 
      s.action !== 'accept' && 
      s.action !== 'reject' && 
      !acceptedTokenIds.has(s.tokenId)
    );
    
    if (acceptedSuggestions.length === 0) {
      // No accepted suggestions, return original text
      return {
        originalText,
        enhancedText: originalText,
        appliedSuggestions: acceptedSuggestions,
        pendingSuggestions
      };
    }
    
    // Get token information for all suggestions (accepted and pending)
    const allTokenIds = suggestions.map(s => s.tokenId);
    const { data: tokens, error } = await supabase
      .from('tokens')
      .select('id, text_segment, start_index, end_index')
      .in('id', allTokenIds);

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
    
    // Create array of changes with position information for accepted suggestions
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
        suggestedText: suggestion.suggestedText,
        suggestionId: suggestion.id
      };
    });
    
    // Sort changes by start index in descending order to avoid index shifting during application
    changes.sort((a, b) => b.startIndex - a.startIndex);
    
    // Apply changes to create enhanced text and track position adjustments
    let enhancedText = originalText;
    const positionAdjustments: Array<{ position: number; offset: number }> = [];
    
    for (const change of changes) {
      // Verify that the original text matches what we expect
      const actualText = enhancedText.slice(change.startIndex, change.endIndex);
      if (actualText !== change.originalText) {
        logger.warn(`Text mismatch at position ${change.startIndex}-${change.endIndex}. Expected: "${change.originalText}", Found: "${actualText}"`);
        // Continue anyway, but log the issue
      }
      
      // Calculate the length difference
      const lengthDifference = change.suggestedText.length - change.originalText.length;
      
      // Replace the text
      enhancedText = enhancedText.slice(0, change.startIndex) + 
                   change.suggestedText + 
                   enhancedText.slice(change.endIndex);
      
      // Record position adjustment for positions after this change
      // We record at the start position because any position after this will be affected
      if (lengthDifference !== 0) {
        positionAdjustments.push({
          position: change.startIndex,
          offset: lengthDifference
        });
      }
    }
    
    // Sort position adjustments by position (ascending order for proper calculation)
    positionAdjustments.sort((a, b) => a.position - b.position);
    
    // Adjust positions of pending suggestions based on applied changes
    const adjustedPendingSuggestions = await this.adjustPendingSuggestionPositions(
      pendingSuggestions,
      tokenMap,
      positionAdjustments
    );
    
    return {
      originalText,
      enhancedText,
      appliedSuggestions: acceptedSuggestions,
      pendingSuggestions: adjustedPendingSuggestions
    };
  },

  /**
   * Adjust positions of pending suggestions based on applied changes
   * @param pendingSuggestions The pending suggestions to adjust
   * @param tokenMap Map of token information
   * @param positionAdjustments Array of position adjustments from applied changes
   * @returns Pending suggestions with adjusted positions
   */
  async adjustPendingSuggestionPositions(
    pendingSuggestions: SuggestionModel[],
    tokenMap: Map<string, { textSegment: string; startIndex: number; endIndex: number }>,
    positionAdjustments: Array<{ position: number; offset: number }>
  ): Promise<SuggestionModel[]> {
    if (pendingSuggestions.length === 0 || positionAdjustments.length === 0) {
      return pendingSuggestions;
    }

    // Calculate cumulative offset for each position
    const calculateAdjustedPosition = (originalPosition: number): number => {
      let totalOffset = 0;
      
      for (const adjustment of positionAdjustments) {
        // Only apply adjustments that occurred before this position
        // A change at position X affects all positions > X
        if (adjustment.position < originalPosition) {
          totalOffset += adjustment.offset;
        }
      }
      
      return Math.max(0, originalPosition + totalOffset); // Ensure position is never negative
    };

    // Update token positions in the database for pending suggestions
    const tokenUpdates: Array<{
      id: string;
      start_index: number;
      end_index: number;
    }> = [];

    for (const suggestion of pendingSuggestions) {
      const token = tokenMap.get(suggestion.tokenId);
      if (!token) {
        logger.warn(`Missing token data for pending suggestion ${suggestion.id}`);
        continue;
      }

      const adjustedStartIndex = calculateAdjustedPosition(token.startIndex);
      const adjustedEndIndex = calculateAdjustedPosition(token.endIndex);

      // Validate adjusted positions
      if (adjustedStartIndex >= adjustedEndIndex) {
        logger.warn(`Invalid adjusted positions for token ${suggestion.tokenId}: start=${adjustedStartIndex}, end=${adjustedEndIndex}. Skipping adjustment.`);
        continue;
      }

      // Only update if positions actually changed
      if (adjustedStartIndex !== token.startIndex || adjustedEndIndex !== token.endIndex) {
        tokenUpdates.push({
          id: suggestion.tokenId,
          start_index: adjustedStartIndex,
          end_index: adjustedEndIndex
        });

        // Update the token map for consistency
        tokenMap.set(suggestion.tokenId, {
          ...token,
          startIndex: adjustedStartIndex,
          endIndex: adjustedEndIndex
        });

        logger.info(`Adjusted token ${suggestion.tokenId} positions: ${token.startIndex}-${token.endIndex} → ${adjustedStartIndex}-${adjustedEndIndex}`);
      }
    }

    // Batch update token positions in the database
    if (tokenUpdates.length > 0) {
      try {
        for (const update of tokenUpdates) {
          const { error } = await supabase
            .from('tokens')
            .update({
              start_index: update.start_index,
              end_index: update.end_index
            })
            .eq('id', update.id);

          if (error) {
            logger.error(`Error updating token ${update.id} positions:`, error);
          }
        }
        
        logger.info(`Updated positions for ${tokenUpdates.length} tokens`);
      } catch (error) {
        logger.error('Error batch updating token positions:', error);
      }
    }

    return pendingSuggestions;
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