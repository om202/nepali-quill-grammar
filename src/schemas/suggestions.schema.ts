import { z } from 'zod';

export const updateSuggestionSchema = z.object({
  body: z.object({
    suggestionId: z.string().uuid('Invalid suggestion ID'),
    action: z.enum(['accept', 'reject'], {
      errorMap: () => ({ message: 'Action must be either "accept" or "reject"' })
    })
  }),
  params: z.object({
    sessionId: z.string().uuid('Invalid session ID')
  })
});

export type UpdateSuggestionRequestBody = z.infer<typeof updateSuggestionSchema>['body'];