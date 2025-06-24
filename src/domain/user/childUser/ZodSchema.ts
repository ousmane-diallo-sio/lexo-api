import { z } from 'zod';

export const ChildUserSchema = z.object({
  firstName: z.string()
    .min(2, { message: "Le prénom doit contenir au moins {#limit} caractères" })
    .max(50, { message: "Le prénom ne doit pas dépasser {#limit} caractères" }),
  username: z.string()
    .min(2, { message: "Le nom d'utilisateur doit contenir au moins {#limit} caractères" })
    .max(50, { message: "Le nom d'utilisateur ne doit pas dépasser {#limit} caractères" }),
  birthdate: z.coerce.date({ message: "La date de naissance doit être une date valide" }),
  avatarUrl: z.string().optional(),
});

export const CreateUserChildSchema = ChildUserSchema;

export const UpdateUserChildSchema = ChildUserSchema.partial();