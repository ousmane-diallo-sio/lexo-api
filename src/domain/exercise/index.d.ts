import { z } from "zod";
import { ExerciseDifficulty } from "./Entity.js";
import {
  CreateLetterExerciseSchema,
  CreateAnimalExerciseSchema,
  CreateNumberExerciseSchema,
  CreateColorExerciseSchema,
  BaseExerciseSchema,
  CreateExerciseSchema,
  UpdateLetterExerciseSchema,
  UpdateAnimalExerciseSchema,
  UpdateNumberExerciseSchema,
  UpdateColorExerciseSchema,
  UpdateExerciseSchema,
  BaseAnswerSchema,
  LetterExerciseAnswerSchema,
  AnimalExerciseAnswerSchema,
  NumberExerciseAnswerSchema,
  ColorExerciseAnswerSchema,
  ExerciseAnswerSchema,
  ExerciseValidationResponseSchema,
  FilterQuerySchema
} from "./ZodSchema.js";

export type BaseExerciseDTO = z.infer<typeof BaseExerciseSchema>;
export type CreateLetterExerciseDTO = z.infer<typeof CreateLetterExerciseSchema>;
export type CreateAnimalExerciseDTO = z.infer<typeof CreateAnimalExerciseSchema>;
export type CreateNumberExerciseDTO = z.infer<typeof CreateNumberExerciseSchema>;
export type CreateColorExerciseDTO = z.infer<typeof CreateColorExerciseSchema>;
export type UpdateLetterExerciseDTO = z.infer<typeof UpdateLetterExerciseSchema>;
export type UpdateAnimalExerciseDTO = z.infer<typeof UpdateAnimalExerciseSchema>;
export type UpdateNumberExerciseDTO = z.infer<typeof UpdateNumberExerciseSchema>;
export type UpdateColorExerciseDTO = z.infer<typeof UpdateColorExerciseSchema>;
export type CreateExerciseDTO = z.infer<typeof CreateExerciseSchema>;
export type UpdateExerciseDTO = z.infer<typeof UpdateExerciseSchema>;
export type BaseAnswerDTO = z.infer<typeof BaseAnswerSchema>;
export type LetterExerciseAnswerDTO = z.infer<typeof LetterExerciseAnswerSchema>;
export type AnimalExerciseAnswerDTO = z.infer<typeof AnimalExerciseAnswerSchema>;
export type NumberExerciseAnswerDTO = z.infer<typeof NumberExerciseAnswerSchema>;
export type ColorExerciseAnswerDTO = z.infer<typeof ColorExerciseAnswerSchema>;
export type ExerciseAnswerDTO = z.infer<typeof ExerciseAnswerSchema>;
export type ExerciseValidationResponse = z.infer<typeof ExerciseValidationResponseSchema>;
export type LexoFilterQuery = z.infer<typeof FilterQuerySchema>;



