import { z } from 'zod';
import { RoleName } from '../../store/auth-store';

export const emailSchema = z.string().trim().email('Invalid email address').max(254);
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters').max(128);

export const registerBaseSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName:  z.string().trim().min(1, 'Last name is required').max(100),
  phone:     z.string().trim().max(32).optional(),
});

export const registerFormSchema = registerBaseSchema
  .extend({ confirmPassword: z.string().min(1, 'Please confirm your password') })
  .refine(d => d.password === d.confirmPassword, {
    message: 'Passwords do not match', path: ['confirmPassword'],
  });

export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required').max(128),
});

export const publicUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().nullable().optional(),
  isActive: z.boolean(),
  roles: z.array(z.custom<RoleName>()),
});

export const tokenPairSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  refreshTokenId: z.string(),
  tokenType: z.literal('Bearer'),
  expiresIn: z.number().int().positive(),
  user: publicUserSchema,
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;
export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type PublicUser = z.infer<typeof publicUserSchema>;
export type TokenPair = z.infer<typeof tokenPairSchema>;
