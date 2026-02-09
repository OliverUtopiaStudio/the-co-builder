import { z } from "zod";

export const signUpSchema = z
  .object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const ventureSchema = z.object({
  name: z.string().min(2, "Venture name must be at least 2 characters"),
  description: z.string().optional(),
  industry: z.string().optional(),
});

export const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(500, "Bio must be under 500 characters").optional(),
  linkedinUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VentureInput = z.infer<typeof ventureSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
