import { z } from 'zod';

export const signupSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Invalid email format')
      .min(1, 'Email is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .max(128, 'Password is too long (max 128 characters)')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one lowercase letter, one uppercase letter, and one number'
      ),
    name: z
      .string()
      .min(1, 'Name is required')
      .max(100, 'Name is too long (max 100 characters)')
      .optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Invalid email format')
      .min(1, 'Email is required'),
    password: z
      .string()
      .min(1, 'Password is required')
  })
});

export type SignupRequestBody = z.infer<typeof signupSchema>['body'];
export type LoginRequestBody = z.infer<typeof loginSchema>['body']; 