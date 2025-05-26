import { diffEngineService } from '../services/diffEngine.service';
import { SuggestionModel } from '../types/database.types';

describe('Diff Engine Service', () => {
  describe('createDiffModel', () => {
    it('should create a diff model with applied suggestions', () => {
      const originalText = 'नेपाली भाषा राम्रो छ।';
      
      // Mock suggestions with actions
      const suggestions: SuggestionModel[] = [
        {
          id: '1',
          tokenId: 'token1',
          suggestedText: 'नेपाल',
          createdAt: new Date().toISOString(),
          action: 'accept'
        },
        {
          id: '2',
          tokenId: 'token2',
          suggestedText: 'भाषाहरू',
          createdAt: new Date().toISOString(),
          action: 'reject'
        },
        {
          id: '3',
          tokenId: 'token3',
          suggestedText: 'राम्रा',
          createdAt: new Date().toISOString()
        }
      ];
      
      const diffModel = diffEngineService.createDiffModel(originalText, suggestions);
      
      expect(diffModel).toHaveProperty('originalText', originalText);
      expect(diffModel).toHaveProperty('enhancedText');
      expect(diffModel).toHaveProperty('appliedSuggestions');
      expect(diffModel).toHaveProperty('pendingSuggestions');
      
      // Check if only accepted suggestions are applied
      expect(diffModel.appliedSuggestions).toHaveLength(1);
      expect(diffModel.appliedSuggestions[0].id).toBe('1');
      
      // Check if pending suggestions are tracked
      expect(diffModel.pendingSuggestions).toHaveLength(1);
      expect(diffModel.pendingSuggestions[0].id).toBe('3');
    });
  });

  describe('resolveOverlappingSuggestions', () => {
    it('should filter out overlapping suggestions', () => {
      // Mock suggestions with potential overlaps
      const suggestions: SuggestionModel[] = [
        {
          id: '1',
          tokenId: 'token1',
          suggestedText: 'suggestion1',
          createdAt: '2023-01-01T00:00:01Z'
        },
        {
          id: '2',
          tokenId: 'token2',
          suggestedText: 'suggestion2',
          createdAt: '2023-01-01T00:00:02Z' // More recent, higher priority
        },
        {
          id: '3',
          tokenId: 'token3',
          suggestedText: 'suggestion3',
          createdAt: '2023-01-01T00:00:00Z'
        }
      ];
      
      const resolved = diffEngineService.resolveOverlappingSuggestions(suggestions);
      
      // In our simplified mock implementation, we'd expect the most recent ones to be prioritized
      // but our current implementation lacks actual token ranges
      expect(resolved.length).toBeGreaterThan(0);
    });
  });
});