import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(20, 'Password must be at most 20 characters')
  .refine((val) => /[a-z]/.test(val), 'Password must contain at least one lowercase letter')
  .refine((val) => /[A-Z]/.test(val), 'Password must contain at least one uppercase letter')
  .refine((val) => /\d/.test(val), 'Password must contain at least one digit')
  .refine((val) => /[@#$%^&+=!]/.test(val), 'Password must contain at least one special character (@#$%^&+=!)')
  .refine((val) => !/\s/.test(val), 'Password must not contain whitespace');

export const loginSchema = z.object({
  username: z.string().min(4, 'Username must be at least 4 characters').max(50, 'Username must be at most 50 characters'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    username: z.string().min(4, 'Username must be at least 4 characters').max(50, 'Username must be at most 50 characters'),
    email: z.string().email('Invalid email address'),
    password: passwordSchema,
    confirmPassword: z.string(),
    zoneInfo: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const deckSchema = z.object({
  name: z.string().min(1, 'Deck name is required').max(100, 'Deck name must be at most 100 characters'),
});

export const cardSchema = z.object({
  front: z.string().min(1, 'Front is required').max(255, 'Front must be at most 255 characters'),
  back: z.string().min(1, 'Back is required').max(5000, 'Back must be at most 5000 characters'),
});

export const profileSchema = z.object({
  username: z.string().min(4, 'Username must be at least 4 characters').max(20, 'Username must be at most 20 characters'),
  email: z.string().email('Invalid email address').max(100, 'Email must be at most 100 characters'),
  sessionThreshold: z.number().min(5).max(360),
  startOfDay: z.number().min(0).max(23),
  notificationsEnabled: z.boolean(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type DeckFormData = z.infer<typeof deckSchema>;
export type CardFormData = z.infer<typeof cardSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
