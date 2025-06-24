import { z } from "zod";
import { ExerciseDifficulty } from "./Entity.js";
import {
  CreateLetterExerciseSchema,
  BaseExerciseSchema,
  CreateExerciseSchema,
  UpdateLetterExerciseSchema,
  UpdateExerciseSchema,
  BaseAnswerSchema,
  LetterExerciseAnswerSchema,
  ExerciseAnswerSchema,
  ExerciseValidationResponseSchema,
  FilterQuerySchema
} from "./ZodSchema.js";

// Re-export types from ZodSchema for backward compatibility
export type BaseExerciseDTO = z.infer<typeof BaseExerciseSchema>;
export type CreateLetterExerciseDTO = z.infer<typeof CreateLetterExerciseSchema>;
export type UpdateLetterExerciseDTO = z.infer<typeof UpdateLetterExerciseSchema>;
export type CreateExerciseDTO = z.infer<typeof CreateExerciseSchema>;
export type UpdateExerciseDTO = z.infer<typeof UpdateExerciseSchema>;
export type BaseAnswerDTO = z.infer<typeof BaseAnswerSchema>;
export type LetterExerciseAnswerDTO = z.infer<typeof LetterExerciseAnswerSchema>;
export type ExerciseAnswerDTO = z.infer<typeof ExerciseAnswerSchema>;
export type ExerciseValidationResponse = z.infer<typeof ExerciseValidationResponseSchema>;
export type FilterQuery = z.infer<typeof FilterQuerySchema>;



