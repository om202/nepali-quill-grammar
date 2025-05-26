import Anthropic from "@anthropic-ai/sdk";
import { logger } from "../utils/logger";
import { HttpError } from "../utils/httpError";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  logger.error("ANTHROPIC_API_KEY is not set in environment variables.");
  throw new Error(
    "ANTHROPIC_API_KEY is not set. Please check your .env file or environment configuration."
  );
}

const anthropic = new Anthropic({
  apiKey: apiKey,
});

// Enhanced system prompt with better instructions for chunked processing
const SYSTEM_PROMPT = `
You are an expert Nepali language editor. When given a block of Nepali text in Devnagari Script, you must find every error or weak phrasing related to:

Grammar, Spelling, Punctuation, Word choice, Style & clarity

Format your response strictly as a JSON array of objects:
[
  {
    "start": number,      // Starting character position (0-based)
    "end": number,        // Ending character position (exclusive)
    "originalText": "original text segment",
    "suggestion": "best_correction"  // Only provide the single best suggestion
  }
]
`;

interface TextSuggestion {
  tokenIndex: number;
  start: number;
  end: number;
  originalText: string;
  suggestion: string;
}

class NepaliTextProcessor {
  private static readonly MAX_CHUNK_SIZE = 1500;
  private static readonly OVERLAP_SIZE = 200;

  /**
   * Extract JSON from markdown code blocks or return the text as-is
   */
  public static extractJsonFromResponse(responseText: string): string {
    // Remove markdown code blocks if present
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return jsonMatch[1].trim();
    }
    return responseText;
  }

  /**
   * Split text into chunks while trying to preserve sentence boundaries
   */
  private static chunkText(
    text: string
  ): Array<{ chunk: string; offset: number }> {
    logger.info(
      `Chunking text: ${text.length} characters into chunks of max ${this.MAX_CHUNK_SIZE}`
    );

    if (text.length <= this.MAX_CHUNK_SIZE) {
      return [{ chunk: text, offset: 0 }];
    }

    const chunks: Array<{ chunk: string; offset: number }> = [];
    let currentOffset = 0;

    while (currentOffset < text.length) {
      let chunkEnd = Math.min(currentOffset + this.MAX_CHUNK_SIZE, text.length);

      // Try to find a good breaking point (sentence end or paragraph break)
      if (chunkEnd < text.length) {
        const searchStart = Math.max(
          currentOffset + this.MAX_CHUNK_SIZE - 200,
          currentOffset
        );

        // Look for sentence endings (।, ?, !, or double newlines)
        const sentenceEndRegex = /[।?!][\s\n]*|[\n]{2,}/g;
        let lastGoodBreak = -1;

        let match;
        sentenceEndRegex.lastIndex = searchStart;
        while (
          (match = sentenceEndRegex.exec(text.slice(0, chunkEnd + 100))) !==
          null
        ) {
          if (match.index > searchStart && match.index <= chunkEnd) {
            lastGoodBreak = match.index + match[0].length;
          }
        }

        if (lastGoodBreak > searchStart) {
          chunkEnd = lastGoodBreak;
        }
      }

      const chunk = text.slice(currentOffset, chunkEnd).trim();
      if (chunk.length > 0) {
        chunks.push({ chunk, offset: currentOffset });
      }

      if (chunkEnd >= text.length) break;

      currentOffset = Math.max(chunkEnd - this.OVERLAP_SIZE, currentOffset + 1);
    }

    logger.info(`Created ${chunks.length} chunks for processing`);
    return chunks;
  }

  /**
   * Merge suggestions from multiple chunks, handling overlaps
   */
  private static mergeSuggestions(
    allSuggestions: Array<{ suggestions: any[]; offset: number }>
  ): TextSuggestion[] {
    const mergedSuggestions: TextSuggestion[] = [];
    const processedRanges = new Set<string>();
    let duplicatesRemoved = 0;

    for (const { suggestions, offset } of allSuggestions) {
      for (const suggestion of suggestions) {
        const adjustedStart = suggestion.start + offset;
        const adjustedEnd = suggestion.end + offset;
        const rangeKey = `${adjustedStart}-${adjustedEnd}`;

        if (processedRanges.has(rangeKey)) {
          duplicatesRemoved++;
          continue;
        }

        processedRanges.add(rangeKey);
        mergedSuggestions.push({
          tokenIndex: 0,
          start: adjustedStart,
          end: adjustedEnd,
          originalText: suggestion.originalText,
          suggestion: suggestion.suggestion,
        });
      }
    }

    const sortedSuggestions = mergedSuggestions.sort(
      (a, b) => a.start - b.start
    );

    logger.info(
      `Merged suggestions: ${sortedSuggestions.length} final suggestions (removed ${duplicatesRemoved} duplicates)`
    );

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
      const messageRequest = {
        model: "claude-sonnet-4-20250514",
        max_tokens: 3000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user" as const,
            content: `Analyze and suggest improvements for this Nepali text (chunk ${chunkIndex + 1}/${totalChunks}): ${chunk}`,
          },
        ],
      };

      const message = await anthropic.messages.create(messageRequest);

      if (!message.content || message.content.length === 0) {
        logger.warn(`Empty response from API for chunk ${chunkIndex + 1}`);
        return [];
      }

      const contentBlock = message.content[0];

      if (contentBlock.type !== "text") {
        logger.warn(`Unexpected content type for chunk ${chunkIndex + 1}`);
        return [];
      }

      const responseText = contentBlock.text.trim();

      try {
        const cleanedResponse = this.extractJsonFromResponse(responseText);
        const suggestions = JSON.parse(cleanedResponse);

        if (!Array.isArray(suggestions)) {
          logger.warn(`Response is not an array for chunk ${chunkIndex + 1}`);
          return [];
        }

        // Validate suggestions
        const validSuggestions = suggestions.filter((suggestion) => {
          return (
            suggestion.originalText &&
            typeof suggestion.suggestion === "string" &&
            typeof suggestion.start === "number" &&
            typeof suggestion.end === "number"
          );
        });

        logger.info(
          `Chunk ${chunkIndex + 1}/${totalChunks} processed: ${validSuggestions.length} suggestions`
        );
        return validSuggestions;
      } catch (parseError) {
        logger.warn(
          `JSON parsing failed for chunk ${chunkIndex + 1}:`,
          parseError
        );
        logger.warn(`Raw response: ${responseText.substring(0, 200)}...`);
        return [];
      }
    } catch (error) {
      logger.error(`Error processing chunk ${chunkIndex + 1}:`, error);
      return [];
    }
  }

  /**
   * Process large Nepali text by chunking
   */
  static async processLargeText(text: string): Promise<TextSuggestion[]> {
    logger.info(`Processing large text: ${text.length} characters`);

    const chunks = this.chunkText(text);
    const allSuggestions: Array<{ suggestions: any[]; offset: number }> = [];

    // Process chunks with delay to avoid rate limiting
    for (let i = 0; i < chunks.length; i++) {
      const { chunk, offset } = chunks[i];

      try {
        const suggestions = await this.processChunk(chunk, i, chunks.length);
        allSuggestions.push({ suggestions, offset });

        // Add small delay between chunks
        if (i < chunks.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (error) {
        logger.error(`Failed to process chunk ${i + 1}:`, error);
        continue;
      }
    }

    const mergedSuggestions = this.mergeSuggestions(allSuggestions);

    logger.info(
      `Large text processing complete: ${mergedSuggestions.length} total suggestions from ${allSuggestions.length}/${chunks.length} chunks`
    );

    return mergedSuggestions;
  }
}

export const anthropicService = {
  async getTextSuggestions(text: string): Promise<TextSuggestion[]> {
    try {
      logger.info(`Requesting text suggestions: ${text.length} characters`);

      // Use chunking for large texts
      if (text.length > 1500) {
        logger.info("Using chunking strategy for large text");
        return await NepaliTextProcessor.processLargeText(text);
      }

      logger.info("Using direct processing for small text");

      // Process small texts directly
      const messageRequest = {
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user" as const,
            content: `Analyze and suggest improvements for this Nepali text: ${text}`,
          },
        ],
      };

      const message = await anthropic.messages.create(messageRequest);

      if (!message.content || message.content.length === 0) {
        logger.error("Anthropic response content is empty");
        throw new HttpError(500, "Received an empty response from AI");
      }

      const contentBlock = message.content[0];

      if (contentBlock.type !== "text") {
        logger.error(`Unexpected content block type: ${contentBlock.type}`);
        throw new HttpError(500, "Invalid response format from Anthropic");
      }

      const responseText = contentBlock.text.trim();

      try {
        const cleanedResponse =
          NepaliTextProcessor.extractJsonFromResponse(responseText);
        const suggestions = JSON.parse(cleanedResponse);

        if (!Array.isArray(suggestions)) {
          logger.error("Parsed response is not an array");
          throw new HttpError(
            500,
            "AI response was not in the expected array format"
          );
        }

        // Validate and return suggestions
        const validSuggestions = suggestions.filter((suggestion) => {
          const isValid =
            suggestion.originalText &&
            typeof suggestion.suggestion === "string" &&
            typeof suggestion.start === "number" &&
            typeof suggestion.end === "number";

          if (!isValid) {
            logger.warn("Invalid suggestion filtered out");
          }

          return isValid;
        });

        logger.info(
          `Successfully parsed ${validSuggestions.length} suggestions`
        );
        return validSuggestions;
      } catch (parseError) {
        logger.error(
          "Failed to parse JSON from Anthropic response:",
          parseError
        );
        logger.error(`Raw response: ${responseText.substring(0, 200)}...`);
        throw new HttpError(
          500,
          "Failed to parse suggestions from AI response"
        );
      }
    } catch (error) {
      logger.error("Error in Anthropic service:", error);

      if (error instanceof Anthropic.APIError) {
        throw new HttpError(
          error.status || 500,
          `Anthropic API Error: ${error.message}`,
          error.error
        );
      }

      if (error instanceof HttpError) {
        throw error;
      }

      throw new HttpError(500, "Failed to get suggestions from AI");
    }
  },
};
