import { textNormalizationService } from '../services/textNormalization.service';

describe('Text Normalization Service', () => {
  describe('normalizeText', () => {
    it('should remove zero-width joiners', () => {
      const input = 'न\u200Dेपाली';
      const expected = 'नेपाली';
      const result = textNormalizationService.normalizeText(input);
      expect(result).toBe(expected);
    });

    it('should normalize Unicode correctly', () => {
      // Combining characters in Nepali
      const decomposed = 'नेपा\u0932\u0940'; // Decomposed form
      const composed = 'नेपाली'; // Composed form (NFC)
      
      const result = textNormalizationService.normalizeText(decomposed);
      expect(result).toBe(composed);
    });

    it('should handle text with no special characters correctly', () => {
      const input = 'नेपाली भाषा';
      const result = textNormalizationService.normalizeText(input);
      expect(result).toBe(input);
    });
  });

  describe('preTokenizeText', () => {
    it('should tokenize Nepali text correctly', () => {
      const input = 'नेपाली भाषा राम्रो छ।';
      const tokens = textNormalizationService.preTokenizeText(input);
      
      // Check if we have correct number of tokens (words + punctuation + spaces)
      expect(tokens.length).toBeGreaterThan(3);
      
      // Validate token properties
      tokens.forEach(token => {
        expect(token).toHaveProperty('text');
        expect(token).toHaveProperty('start');
        expect(token).toHaveProperty('end');
        expect(token.start).toBeLessThan(token.end);
        expect(input.substring(token.start, token.end)).toBe(token.text);
      });
    });

    it('should handle empty input', () => {
      const tokens = textNormalizationService.preTokenizeText('');
      expect(tokens).toEqual([]);
    });
  });
});