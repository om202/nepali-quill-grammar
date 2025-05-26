import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../utils/logger';
import { HttpError } from '../utils/httpError';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  logger.error('ANTHROPIC_API_KEY is not set in environment variables.');
  throw new Error('ANTHROPIC_API_KEY is not set. Please check your .env file or environment configuration.');
}

const anthropic = new Anthropic({
  apiKey: apiKey,
});

// Enhanced system prompt with better instructions for chunked processing
const SYSTEM_PROMPT = `
You are an expert Nepali language editor and text enhancement system.
Your task is to analyze Nepali text and provide suggestions for improvements in:
1. Grammar
2. Spelling
3. Punctuation
4. Word choice
5. Style and clarity

IMPORTANT GUIDELINES:
- Focus on clear, actionable improvements
- Prioritize grammatical errors and spelling mistakes
- Be conservative with style suggestions to avoid overwhelming the user
- Ensure suggestions maintain the original meaning and tone

Format your response strictly as a JSON array of objects:
[
  {
    "start": number,      // Starting character position (0-based)
    "end": number,        // Ending character position (exclusive)
    "originalText": "original text segment",
    "suggestions": ["suggestion1", "suggestion2"]
  }
]

Handle Devanagari script carefully and ensure accurate character positioning.
`;

interface TextSuggestion {
  tokenIndex: number;
  start: number;
  end: number;
  originalText: string;
  suggestions: string[];
}

class NepaliTextProcessor {
  private static readonly MAX_CHUNK_SIZE = 1500; // Conservative chunk size
  private static readonly OVERLAP_SIZE = 200;    // Overlap to maintain context

  /**
   * Split text into chunks while trying to preserve sentence boundaries
   */
  private static chunkText(text: string): Array<{ chunk: string; offset: number }> {
    logger.info(`🔍 CHUNKING STRATEGY: Starting text analysis`);
    logger.info(`📝 Original text length: ${text.length} characters`);
    logger.info(`⚙️ Max chunk size: ${this.MAX_CHUNK_SIZE}, Overlap size: ${this.OVERLAP_SIZE}`);
    
    if (text.length <= this.MAX_CHUNK_SIZE) {
      logger.info(`✨ Text is small enough - no chunking needed`);
      return [{ chunk: text, offset: 0 }];
    }

    logger.info(`📦 Text is large - starting chunking process...`);
    const chunks: Array<{ chunk: string; offset: number }> = [];
    let currentOffset = 0;
    let chunkNumber = 1;

    while (currentOffset < text.length) {
      let chunkEnd = Math.min(currentOffset + this.MAX_CHUNK_SIZE, text.length);
      logger.debug(`🔧 Chunk ${chunkNumber}: Initial range ${currentOffset}-${chunkEnd}`);
      
      // Try to find a good breaking point (sentence end or paragraph break)
      if (chunkEnd < text.length) {
        const searchStart = Math.max(currentOffset + this.MAX_CHUNK_SIZE - 200, currentOffset);
        logger.debug(`🔍 Looking for sentence break between positions ${searchStart}-${chunkEnd}`);
        
        // Look for sentence endings (।, ?, !, or double newlines)
        const sentenceEndRegex = /[।?!][\s\n]*|[\n]{2,}/g;
        let lastGoodBreak = -1;
        
        let match;
        sentenceEndRegex.lastIndex = searchStart;
        while ((match = sentenceEndRegex.exec(text.slice(0, chunkEnd + 100))) !== null) {
          if (match.index > searchStart && match.index <= chunkEnd) {
            lastGoodBreak = match.index + match[0].length;
          }
        }
        
        if (lastGoodBreak > searchStart) {
          logger.debug(`✂️ Found good break point at position ${lastGoodBreak}`);
          chunkEnd = lastGoodBreak;
        } else {
          logger.debug(`⚠️ No good break point found, using hard cut at ${chunkEnd}`);
        }
      }

      const chunk = text.slice(currentOffset, chunkEnd).trim();
      if (chunk.length > 0) {
        chunks.push({ chunk, offset: currentOffset });
        logger.info(`📦 Chunk ${chunkNumber}: ${currentOffset}-${chunkEnd} (${chunk.length} chars)`);
        logger.debug(`📖 Chunk ${chunkNumber} preview: "${chunk.slice(0, 50)}${chunk.length > 50 ? '...' : ''}"`);
        chunkNumber++;
      }

      // Move forward with overlap if not at the end
      if (chunkEnd >= text.length) {
        logger.info(`🏁 Reached end of text`);
        break;
      }
      
      const nextOffset = Math.max(chunkEnd - this.OVERLAP_SIZE, currentOffset + 1);
      logger.debug(`🔄 Next chunk will start at ${nextOffset} (overlap: ${chunkEnd - nextOffset} chars)`);
      currentOffset = nextOffset;
    }

    logger.info(`✅ CHUNKING COMPLETE: Created ${chunks.length} chunks from ${text.length} characters`);
    return chunks;
  }

  /**
   * Merge suggestions from multiple chunks, handling overlaps
   */
  private static mergeSuggestions(
    allSuggestions: Array<{ suggestions: any[]; offset: number }>
  ): TextSuggestion[] {
    logger.info(`🔗 MERGING STRATEGY: Starting to merge suggestions from ${allSuggestions.length} chunks`);
    
    const mergedSuggestions: TextSuggestion[] = [];
    const processedRanges = new Set<string>();
    let totalSuggestionsBeforeMerge = 0;
    let duplicatesRemoved = 0;

    for (let i = 0; i < allSuggestions.length; i++) {
      const { suggestions, offset } = allSuggestions[i];
      totalSuggestionsBeforeMerge += suggestions.length;
      
      logger.info(`🔄 Processing chunk ${i + 1} suggestions: ${suggestions.length} items (offset: ${offset})`);
      
      for (const suggestion of suggestions) {
        // Adjust positions based on chunk offset
        const adjustedStart = suggestion.start + offset;
        const adjustedEnd = suggestion.end + offset;
        const rangeKey = `${adjustedStart}-${adjustedEnd}`;

        // Skip if we've already processed this range (from overlap)
        if (processedRanges.has(rangeKey)) {
          logger.debug(`🚫 Skipping duplicate suggestion at ${rangeKey}: "${suggestion.originalText}"`);
          duplicatesRemoved++;
          continue;
        }

        processedRanges.add(rangeKey);
        logger.debug(`✅ Adding suggestion at ${adjustedStart}-${adjustedEnd}: "${suggestion.originalText}"`);

        mergedSuggestions.push({
          tokenIndex: 0, // Will be set later if needed
          start: adjustedStart,
          end: adjustedEnd,
          originalText: suggestion.originalText,
          suggestions: suggestion.suggestions
        });
      }
    }

    // Sort by start position
    const sortedSuggestions = mergedSuggestions.sort((a, b) => a.start - b.start);
    
    logger.info(`✅ MERGING COMPLETE:`);
    logger.info(`   📊 Total suggestions before merge: ${totalSuggestionsBeforeMerge}`);
    logger.info(`   🚫 Duplicates removed: ${duplicatesRemoved}`);
    logger.info(`   ✨ Final suggestions: ${sortedSuggestions.length}`);
    
    // Log first few merged suggestions for verification
    if (sortedSuggestions.length > 0) {
      logger.info(`📋 First few merged suggestions:`);
      sortedSuggestions.slice(0, 3).forEach((suggestion, index) => {
        logger.info(`   ${index + 1}. Position ${suggestion.start}-${suggestion.end}: "${suggestion.originalText}" → "${suggestion.suggestions[0]}"`);
      });
    }
    
    return sortedSuggestions;
  }

  /**
   * Process a single chunk of text
   */
  private static async processChunk(
    chunk: string,
    chunkIndex: number,
    totalChunks: number
  ): Promise<any[]> {
    try {
      logger.info(`🚀 PROCESSING CHUNK ${chunkIndex + 1}/${totalChunks}:`);
      logger.info(`   📏 Chunk size: ${chunk.length} characters`);
      logger.info(`   📖 Chunk preview: "${chunk.slice(0, 100)}${chunk.length > 100 ? '...' : ''}"`);
      logger.info(`   ⏱️ Sending to Anthropic Claude...`);

      const messageRequest = {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user' as const,
            content: `Analyze and suggest improvements for this Nepali text (chunk ${chunkIndex + 1}/${totalChunks}): ${chunk}`
          }
        ]
      };

      const startTime = Date.now();
      const message = await anthropic.messages.create(messageRequest);
      const processingTime = Date.now() - startTime;
      
      logger.info(`   ⚡ API Response received in ${processingTime}ms`);

      if (!message.content || message.content.length === 0) {
        logger.warn(`   ⚠️ Empty response from API for chunk ${chunkIndex + 1}`);
        return [];
      }

      const contentBlock = message.content[0];
      
      if (contentBlock.type !== 'text') {
        logger.warn(`   ⚠️ Unexpected content type: ${contentBlock.type} for chunk ${chunkIndex + 1}`);
        return [];
      }
      
      const responseText = contentBlock.text.trim();
      logger.debug(`   📄 Raw response length: ${responseText.length} characters`);
      
      try {
        const suggestions = JSON.parse(responseText);
        
        if (!Array.isArray(suggestions)) {
          logger.warn(`   ⚠️ Response is not an array for chunk ${chunkIndex + 1}`);
          return [];
        }

        // Validate suggestions
        const validSuggestions = suggestions.filter((suggestion, index) => {
          const isValid = suggestion.originalText && 
                         Array.isArray(suggestion.suggestions) &&
                         typeof suggestion.start === 'number' &&
                         typeof suggestion.end === 'number' &&
                         suggestion.suggestions.length > 0;
          
          if (!isValid) {
            logger.warn(`   🚫 Invalid suggestion ${index + 1} in chunk ${chunkIndex + 1}:`, suggestion);
          }
          
          return isValid;
        });

        logger.info(`   ✅ CHUNK ${chunkIndex + 1} COMPLETE:`);
        logger.info(`      📊 Raw suggestions: ${suggestions.length}`);
        logger.info(`      ✨ Valid suggestions: ${validSuggestions.length}`);
        
        if (validSuggestions.length > 0) {
          logger.info(`      📋 Sample suggestions:`);
          validSuggestions.slice(0, 2).forEach((suggestion, index) => {
            logger.info(`         ${index + 1}. "${suggestion.originalText}" → "${suggestion.suggestions[0]}"`);
          });
        }
        
        return validSuggestions;

      } catch (parseError) {
        logger.warn(`   ❌ JSON parsing failed for chunk ${chunkIndex + 1}:`, parseError);
        logger.debug(`   📄 Failed response text: ${responseText.slice(0, 200)}...`);
        return [];
      }

    } catch (error) {
      logger.warn(`   ❌ Error processing chunk ${chunkIndex + 1}:`, error);
      return [];
    }
  }

  /**
   * Process large Nepali text by chunking
   */
  static async processLargeText(text: string): Promise<TextSuggestion[]> {
    logger.info(`🎯 LARGE TEXT PROCESSING STARTED`);
    logger.info(`📊 Input: ${text.length} characters, ${text.split('\n').length} lines`);
    
    const chunks = this.chunkText(text);
    
    logger.info(`📦 Created ${chunks.length} chunks for processing`);
    logger.info(`🚀 Starting sequential processing with 500ms delays...`);

    const allSuggestions: Array<{ suggestions: any[]; offset: number }> = [];
    const startTime = Date.now();

    // Process chunks with some delay to avoid rate limiting
    for (let i = 0; i < chunks.length; i++) {
      const { chunk, offset } = chunks[i];
      
      logger.info(`\n🔄 === PROCESSING CHUNK ${i + 1}/${chunks.length} ===`);
      
      try {
        const suggestions = await this.processChunk(chunk, i, chunks.length);
        allSuggestions.push({ suggestions, offset });
        
        logger.info(`✅ Chunk ${i + 1} completed successfully with ${suggestions.length} suggestions`);
        
        // Add small delay between chunks to be respectful to the API
        if (i < chunks.length - 1) {
          logger.info(`⏸️ Waiting 500ms before next chunk...`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
      } catch (error) {
        logger.error(`❌ Failed to process chunk ${i + 1}:`, error);
        logger.info(`🔄 Continuing with remaining chunks...`);
        // Continue with other chunks even if one fails
        continue;
      }
    }

    const processingTime = Date.now() - startTime;
    logger.info(`\n⏱️ All chunks processed in ${processingTime}ms`);
    logger.info(`📊 Successfully processed ${allSuggestions.length}/${chunks.length} chunks`);

    const mergedSuggestions = this.mergeSuggestions(allSuggestions);
    
    logger.info(`\n🎉 LARGE TEXT PROCESSING COMPLETE!`);
    logger.info(`📈 FINAL RESULTS:`);
    logger.info(`   📝 Original text: ${text.length} characters`);
    logger.info(`   📦 Chunks created: ${chunks.length}`);
    logger.info(`   ✅ Chunks processed: ${allSuggestions.length}`);
    logger.info(`   🎯 Total suggestions: ${mergedSuggestions.length}`);
    logger.info(`   ⏱️ Total time: ${processingTime}ms`);
    
    return mergedSuggestions;
  }
}

export const anthropicService = {
  async getTextSuggestions(text: string): Promise<TextSuggestion[]> {
    try {
      logger.info('Requesting text suggestions from Anthropic Claude');
      logger.debug(`Input text length: ${text.length} characters`);

      // Use chunking for large texts
      if (text.length > 1500) {
        logger.info(`\n🎯 TEXT SIZE CHECK: ${text.length} characters > 1500 threshold`);
        logger.info(`🔀 SWITCHING TO CHUNKING STRATEGY...`);
        return await NepaliTextProcessor.processLargeText(text);
      }

      logger.info(`✨ TEXT SIZE CHECK: ${text.length} characters ≤ 1500 threshold`);
      logger.info(`⚡ USING DIRECT PROCESSING (original strategy)...`);

      // Process small texts directly (original logic)
      const messageRequest = {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user' as const,
            content: `Analyze and suggest improvements for this Nepali text: ${text}`
          }
        ]
      };

      const message = await anthropic.messages.create(messageRequest);

      if (!message.content || message.content.length === 0) {
        logger.error('Anthropic response content is empty.');
        throw new HttpError(500, 'Received an empty response from AI');
      }

      const contentBlock = message.content[0];
      
      if (contentBlock.type !== 'text') {
        logger.error(`Unexpected content block type: ${contentBlock.type}`);
        throw new HttpError(500, 'Invalid response format from Anthropic');
      }
      
      const responseText = contentBlock.text.trim();
      
      try {
        const suggestions = JSON.parse(responseText);
        
        if (!Array.isArray(suggestions)) {
          logger.error('Parsed response is not an array:', responseText);
          throw new HttpError(500, 'AI response was not in the expected array format');
        }

        // Validate and return suggestions
        const validSuggestions = suggestions.filter(suggestion => {
          const isValid = suggestion.originalText && 
                         Array.isArray(suggestion.suggestions) &&
                         typeof suggestion.start === 'number' &&
                         typeof suggestion.end === 'number' &&
                         suggestion.suggestions.length > 0 &&
                         suggestion.suggestions.every((s: any) => typeof s === 'string');
          
          if (!isValid) {
            logger.warn('Invalid suggestion filtered out:', suggestion);
          }
          
          return isValid;
        });

        logger.info(`Successfully parsed ${validSuggestions.length} suggestions`);
        return validSuggestions;

      } catch (parseError) {
        logger.error('Failed to parse JSON from Anthropic response:', parseError);
        throw new HttpError(500, 'Failed to parse suggestions from AI response');
      }

    } catch (error) {
      logger.error('Error in Anthropic service:', error);
      
      if (error instanceof Anthropic.APIError) {
        logger.error('Anthropic API Error details:', {
          status: error.status,
          name: error.name,
          error: error.error,
          message: error.message
        });
        throw new HttpError(
          error.status || 500,
          `Anthropic API Error: ${error.message}`,
          error.error
        );
      }
      
      if (error instanceof HttpError) {
        throw error;
      }
      
      throw new HttpError(500, 'Failed to get suggestions from AI');
    }
  }
};