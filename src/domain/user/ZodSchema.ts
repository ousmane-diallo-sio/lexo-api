import { z } from 'zod';

export const PasswordValidatior = z.string()
  .min(8, { message: "Le mot de passe doit contenir au moins {#limit} caractères" })
  .max(20, { message: "Le mot de passe ne doit pas dépasser {#limit} caractères" });

export const CreateUserSchema = z.object({
  email: z.string()
    .email({ message: "L'adresse email est invalide" })
    .min(1, { message: "L'adresse email doit contenir au moins {#limit} caractères" }),
  username: z.string()
    .min(2, { message: "Le nom d'utilisateur doit contenir au moins {#limit} caractères" })
    .max(50, { message: "Le nom d'utilisateur ne doit pas dépasser {#limit} caractères" }),
  birthdate: z
    .coerce
    .date({ message: "The age must be a valid date" })
    .optional(),
  password: PasswordValidatior,
});

export const UpdateUserSchema = CreateUserSchema.partial();

export const UserLoginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Vous n'avez pas renseigné votre mot de passe")
});

export const CreateUserGoogleSchema = z.object({
  googleId: z.string(),
  email: z.string().email("Adresse email invalide"),
  username: z.string().min(2, "Le nom d'utilisateur doit contenir au moins {#limit} caractères"),
  birthdate: z
    .coerce
    .date({ message: "The age must be a valid date" })
});