import { z } from "zod";
import { CreateUserChildSchema, UpdateUserChildSchema } from "./ZodSchema.ts";

export type CreateChildUserDTO = z.infer<typeof CreateUserChildSchema>;
export type UpdateChildUserDTO = z.infer<typeof UpdateUserChildSchema>;