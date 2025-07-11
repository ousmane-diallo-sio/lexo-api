import { z } from "zod";
import { CreateAdminUserSchema, CreateUserGoogleSchema, CreateUserSchema, UpdateUserSchema } from "./ZodSchema.js";
import { CreateUserChildSchema, UpdateUserChildSchema } from "./childUser/ZodSchema.ts";

export type CreateUserDTO = z.infer<typeof CreateUserSchema>;

export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>;

export type CreateUserGoogleDTO = z.infer<typeof CreateUserGoogleSchema>;

export type CreateAdminUserDTO = z.infer<typeof CreateAdminUserSchema>;

export type CreateChildUserDTO = z.infer<typeof CreateUserChildSchema>;
export type UpdateChildUserDTO = z.infer<typeof UpdateUserChildSchema>;