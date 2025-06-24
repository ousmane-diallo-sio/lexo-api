import { z } from 'zod';
import { ChildUserSchema } from './childUser/ZodSchema.js';

export const PasswordValidatior = z.string()
  .min(8, { message: "Le mot de passe doit contenir au moins {#limit} caractères" })
  .max(20, { message: "Le mot de passe ne doit pas dépasser {#limit} caractères" });

export const BaseUserSchema = z.object({
  email: z.string()
    .email({ message: "L'adresse email est invalide" })
    .min(1, { message: "L'adresse email doit contenir au moins {#limit} caractères" }),
  firstName: z.string()
    .min(2, { message: "The first name must contain at least {#limit} characters" })
    .max(50, { message: "The first name must not exceed {#limit} characters" }),
  lastName: z.string()
    .min(2, { message: "The last name must contain at least {#limit} characters" })
    .max(50, { message: "The last name must not exceed {#limit} characters" }),
});

export const CreateUserSchema = BaseUserSchema.extend({
  children: z.array(ChildUserSchema).optional(),
  password: PasswordValidatior,
});

export const UpdateUserSchema = CreateUserSchema.partial();

export const UserLoginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Vous n'avez pas renseigné votre mot de passe")
});

export const CreateUserGoogleSchema = BaseUserSchema.extend({
  googleId: z.string(),
});

export const CreateAdminUserSchema = CreateUserSchema.extend({
  isAdmin: z.boolean(),
  adminCreationKey: z.string(),
});