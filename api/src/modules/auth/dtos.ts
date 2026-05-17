import { z } from 'zod';

const emailSchema = z.string().trim().email().max(254).toLowerCase();
const passwordSchema = z.string().min(8).max(128);

export const registerBodySchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().trim().min(1).max(100),
  lastName:  z.string().trim().min(1).max(100),
  phone:     z.string().trim().max(32).optional(),
}).strict();

export const loginBodySchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
}).strict();

export const refreshBodySchema = z.object({
  refreshToken: z.string().min(1).max(512),
}).strict();

export const logoutBodySchema = refreshBodySchema;

export type RegisterBody = z.infer<typeof registerBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
export type RefreshBody = z.infer<typeof refreshBodySchema>;
export type LogoutBody = z.infer<typeof logoutBodySchema>;
