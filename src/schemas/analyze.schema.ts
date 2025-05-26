import { z } from 'zod';

export const analyzeSchema = z.object({
  body: z.object({
    text: z
      .string()
      .min(1, 'Text cannot be empty')
      .max(10000, 'Text is too long (max 10000 characters)')
  })
});

export type AnalyzeRequestBody = z.infer<typeof analyzeSchema>['body'];