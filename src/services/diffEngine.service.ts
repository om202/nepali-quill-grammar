import { SuggestionModel, DiffModel } from '../types/database.types';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import { diffChars, applyPatch, createPatch } from 'diff';

export const diffEngineService = {
  /**
   * Apply accepted suggestions to create an enhanced text version using jsdiff library
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
        suggestionId: suggestion.id,
        tokenId: suggestion.tokenId
      };
    });
    
    // Sort changes by start index in ascending order for proper patch application
    changes.sort((a, b) => a.startIndex - b.startIndex);
    
    // Apply changes using jsdiff library for proper Unicode handling
    let enhancedText = originalText;
    const appliedChanges: Array<{
      originalText: string;
      suggestedText: string;
      startIndex: number;
      endIndex: number;
    }> = [];
    
    // Apply changes one by one using patches
    for (const change of changes) {
      try {
        // Create a patch for this specific change
        const patch = createPatch(
          'original',
          change.originalText,
          change.suggestedText,
          'Original text',
          'Suggested text'
        );
        
        // Find the current position of the text in the enhanced text
        const currentPosition = this.findTextPosition(enhancedText, change.originalText, change.startIndex);
        
        if (currentPosition !== -1) {
          // Extract the part before, the target text, and the part after
          const beforeText = enhancedText.substring(0, currentPosition);
          const afterText = enhancedText.substring(currentPosition + change.originalText.length);
          
          // Apply the change
          enhancedText = beforeText + change.suggestedText + afterText;
          
          appliedChanges.push({
            originalText: change.originalText,
            suggestedText: change.suggestedText,
            startIndex: currentPosition,
            endIndex: currentPosition + change.originalText.length
          });
          
          logger.info(`Applied change: "${change.originalText}" → "${change.suggestedText}" at position ${currentPosition}`);
        } else {
          logger.warn(`Could not find text "${change.originalText}" in enhanced text for suggestion ${change.suggestionId}`);
        }
      } catch (error) {
        logger.error(`Error applying change for suggestion ${change.suggestionId}:`, error);
      }
    }
    
    // Update positions of pending suggestions based on applied changes
    const adjustedPendingSuggestions = await this.adjustPendingSuggestionsWithDiff(
      pendingSuggestions,
      tokenMap,
      originalText,
      enhancedText
    );
    
    return {
      originalText,
      enhancedText,
      appliedSuggestions: acceptedSuggestions,
      pendingSuggestions: adjustedPendingSuggestions
    };
  },

  /**
   * Find the position of text in the enhanced text, accounting for previous changes
   */
  findTextPosition(text: string, searchText: string, originalPosition: number): number {
    // First try the original position
    if (text.substring(originalPosition, originalPosition + searchText.length) === searchText) {
      return originalPosition;
    }
    
    // If not found at original position, search nearby (within reasonable range)
    const searchRange = 100; // Search within 100 characters
    const startSearch = Math.max(0, originalPosition - searchRange);
    const endSearch = Math.min(text.length, originalPosition + searchRange);
    
    for (let i = startSearch; i <= endSearch - searchText.length; i++) {
      if (text.substring(i, i + searchText.length) === searchText) {
        return i;
      }
    }
    
    // If still not found, do a global search
    return text.indexOf(searchText);
  },

  /**
   * Adjust positions of pending suggestions using diff analysis
   */
  async adjustPendingSuggestionsWithDiff(
    pendingSuggestions: SuggestionModel[],
    tokenMap: Map<string, { textSegment: string; startIndex: number; endIndex: number }>,
    originalText: string,
    enhancedText: string
  ): Promise<SuggestionModel[]> {
    if (pendingSuggestions.length === 0) {
      return pendingSuggestions;
    }

    // Use jsdiff to calculate the differences between original and enhanced text
    const diffs = diffChars(originalText, enhancedText);
    
    // Calculate position mappings from original to enhanced text
    const positionMap = this.createPositionMap(diffs);
    
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

      const adjustedStartIndex = this.mapPosition(positionMap, token.startIndex);
      const adjustedEndIndex = this.mapPosition(positionMap, token.endIndex);

      // Validate adjusted positions
      if (adjustedStartIndex >= adjustedEndIndex || adjustedStartIndex < 0) {
        logger.warn(`Invalid adjusted positions for token ${suggestion.tokenId}: start=${adjustedStartIndex}, end=${adjustedEndIndex}. Skipping adjustment.`);
        continue;
      }

      // Verify the text still matches at the new position
      const expectedText = enhancedText.substring(adjustedStartIndex, adjustedEndIndex);
      if (expectedText !== token.textSegment) {
        logger.warn(`Text mismatch after position adjustment for token ${suggestion.tokenId}. Expected: "${token.textSegment}", Found: "${expectedText}"`);
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
   * Create a position mapping from diff results
   */
  createPositionMap(diffs: Array<{ added?: boolean; removed?: boolean; value: string; count?: number }>): Map<number, number> {
    const positionMap = new Map<number, number>();
    let originalPos = 0;
    let enhancedPos = 0;

    for (const diff of diffs) {
      if (diff.removed) {
        // Text was removed, original position advances but enhanced doesn't
        for (let i = 0; i < diff.value.length; i++) {
          positionMap.set(originalPos + i, enhancedPos);
        }
        originalPos += diff.value.length;
      } else if (diff.added) {
        // Text was added, enhanced position advances but original doesn't
        enhancedPos += diff.value.length;
      } else {
        // Text is common, both positions advance
        for (let i = 0; i < diff.value.length; i++) {
          positionMap.set(originalPos + i, enhancedPos + i);
        }
        originalPos += diff.value.length;
        enhancedPos += diff.value.length;
      }
    }

    return positionMap;
  },

  /**
   * Map a position from original text to enhanced text
   */
  mapPosition(positionMap: Map<number, number>, originalPosition: number): number {
    // If we have an exact mapping, use it
    if (positionMap.has(originalPosition)) {
      return positionMap.get(originalPosition)!;
    }

    // Find the closest mapped position before this one
    let closestPos = 0;
    let closestMapped = 0;
    
    for (const [orig, mapped] of positionMap.entries()) {
      if (orig <= originalPosition && orig > closestPos) {
        closestPos = orig;
        closestMapped = mapped;
      }
    }

    // Calculate offset from closest position
    const offset = originalPosition - closestPos;
    return closestMapped + offset;
  }
};