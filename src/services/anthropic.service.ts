import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../utils/logger';
import { HttpError } from '../utils/httpError';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Initialize Anthropic client with API key from environment variables
const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  logger.error('ANTHROPIC_API_KEY is not set in environment variables.');
  throw new Error('ANTHROPIC_API_KEY is not set. Please check your .env file or environment configuration.');
}

const anthropic = new Anthropic({
  apiKey: apiKey,
});

// System prompt for Nepali text enhancement
const SYSTEM_PROMPT = `
You are an expert Nepali language editor and text enhancement system.
Your task is to analyze Nepali text and provide suggestions for improvements in:
1. Grammar
2. Spelling
3. Punctuation
4. Word choice
5. Style and clarity

For each improvement you suggest:
- Identify the exact text segment to be replaced
- Provide the suggested replacement
- Include the character position (start and end index)

Format your response strictly as a JSON array of objects. Do not include any explanatory text before or after the JSON array.
The JSON array should follow this structure:
[
  {
    "start": number,      // Starting character position (0-based)
    "end": number,        // Ending character position (exclusive)
    "originalText": "original text segment",
    "suggestions": ["suggestion1", "suggestion2"]
  }
]

Important:
- Handle Devanagari script and diacritics properly
- Be aware of zero-width joiners (ZWJ) and other special characters in Nepali text
- Ensure the output is only the JSON array
- Make sure start and end indices are accurate
- Provide at least one suggestion for each identified issue
`;

export const anthropicService = {
  async getTextSuggestions(text: string): Promise<Array<{
    tokenIndex: number;
    start: number;
    end: number;
    originalText: string;
    suggestions: string[];
  }>> {
    try {
      logger.info('Requesting text suggestions from Anthropic Claude');
      logger.debug('Input text:', text);

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

      logger.debug('Anthropic request:', JSON.stringify(messageRequest, null, 2));

      const message = await anthropic.messages.create(messageRequest);

      logger.debug('Raw Anthropic response:', JSON.stringify(message, null, 2));

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
      logger.debug('Trimmed response text:', responseText);
      
      try {
        const suggestions = JSON.parse(responseText);
        
        if (!Array.isArray(suggestions)) {
          logger.error('Parsed response is not an array:', responseText);
          throw new HttpError(500, 'AI response was not in the expected array format');
        }

        // Validate suggestion structure
        for (const [index, suggestion] of suggestions.entries()) {
          // Check if all required fields are present
          if (!suggestion.originalText || !Array.isArray(suggestion.suggestions)) {
            logger.error(`Invalid suggestion object at index ${index}:`, suggestion);
            throw new HttpError(500, 'AI response contains invalid suggestion format');
          }

          // Ensure start and end indices are numbers
          if (typeof suggestion.start !== 'number' || typeof suggestion.end !== 'number') {
            logger.error(`Invalid indices in suggestion at index ${index}:`, suggestion);
            throw new HttpError(500, 'AI response contains invalid indices');
          }

          // Ensure suggestions array is not empty
          if (suggestion.suggestions.length === 0) {
            logger.error(`Empty suggestions array at index ${index}:`, suggestion);
            throw new HttpError(500, 'AI response contains empty suggestions');
          }

          // Ensure all suggestions are strings
          if (!suggestion.suggestions.every((s: string) => typeof s === 'string')) {
            logger.error(`Invalid suggestion text at index ${index}:`, suggestion);
            throw new HttpError(500, 'AI response contains invalid suggestion text');
          }
        }

        logger.info(`Successfully parsed ${suggestions.length} suggestions`);
        return suggestions;
      } catch (parseError) {
        logger.error('Failed to parse JSON from Anthropic response:', parseError);
        logger.error('Response text that failed to parse:', responseText);
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