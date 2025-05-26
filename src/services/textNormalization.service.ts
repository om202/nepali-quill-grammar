export const textNormalizationService = {
  /**
   * Normalize Nepali text by handling zero-width joiners and Unicode normalization
   * @param text Input Nepali text
   * @returns Normalized text
   */
  normalizeText(text: string): string {
    // Step 1: Strip zero-width joiners (U+200D)
    const withoutZWJ = text.replace(/\u200D/g, '');
    
    // Step 2: Apply Unicode normalization (NFC form)
    // NFC: Canonical Decomposition, followed by Canonical Composition
    const normalizedText = withoutZWJ.normalize('NFC');
    
    return normalizedText;
  },
  
  /**
   * Pre-tokenize Nepali text for analysis
   * @param text Normalized Nepali text
   * @returns Array of tokens with position information
   */
  preTokenizeText(text: string): Array<{
    text: string;
    start: number;
    end: number;
  }> {
    // Basic tokenization by word boundaries and punctuation
    // This is a simplified approach and might need refinement for Nepali
    
    const tokens: Array<{ text: string; start: number; end: number }> = [];
    
    // Regex pattern for Devanagari word boundaries and punctuation
    // Matches Devanagari characters, punctuation, and whitespace
    const pattern = /[\u0900-\u097F\u0981-\u09FC]+|[।॥,?!;:।\.'"()[\]{}-]+|\s+/g;
    
    let match;
    while ((match = pattern.exec(text)) !== null) {
      tokens.push({
        text: match[0],
        start: match.index,
        end: match.index + match[0].length
      });
    }
    
    return tokens;
  }
};