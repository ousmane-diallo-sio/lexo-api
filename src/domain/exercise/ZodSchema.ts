import { z } from 'zod';
import { ExerciseDifficulty } from './Entity.js';
import { NumberImageType } from './numberExercise/Entity.js';
import { FruitType, ColorName } from './colorExercise/Entity.js';

export const ExerciseTypeSchema = z.enum(['letter', 'number', 'color', 'animal', 'reading']);

export const AgeRangeSchema = z.object({
  min: z.number().min(0).max(18),
  max: z.number().min(0).max(18),
}).refine(data => data.min <= data.max, {
  message: "Minimum age must be less than or equal to maximum age",
  path: ["minAge"]
});

export const BaseExerciseSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long" }).max(100),
  description: z.string().min(10, { message: "Description must be at least 10 characters long" }).max(1000),
  durationMinutes: z.number().positive({ message: "Duration must be a positive number" }),
  mainColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { 
    message: "Main color must be a valid hex color code (e.g., #FF0000)" 
  }),
  thumbnailUrl: z.string().url({ message: "Thumbnail URL must be a valid URL" }),
  xp: z.number().nonnegative({ message: "XP must be a non-negative number" }),
  ageRange: AgeRangeSchema,
  difficulty: z.nativeEnum(ExerciseDifficulty),
  availableToChildren: z.array(z.string().uuid({ message: "Child ID must be a valid UUID" })).optional(),
});

export const CreateLetterExerciseSchema = BaseExerciseSchema.extend({
  exerciseType: z.literal('letter'),
  letters: z.array(z.string().min(1).max(1, { message: "Each letter must be a single character" }))
    .min(1, { message: "At least one letter is required" })
});

export const CreateAnimalExerciseSchema = BaseExerciseSchema.extend({
  exerciseType: z.literal('animal'),
  animals: z.array(z.string().min(1, { message: "Animal name cannot be empty" }))
    .min(1, { message: "At least one animal is required" })
});

export const CreateNumberExerciseSchema = BaseExerciseSchema.extend({
  exerciseType: z.literal('number'),
  numbers: z.array(z.number().int().min(0).max(10, { message: "Numbers must be between 0 and 10" }))
    .min(1, { message: "At least one number is required" }),
  imageType: z.nativeEnum(NumberImageType).default(NumberImageType.REGULAR)
});

export const CreateColorExerciseSchema = BaseExerciseSchema.extend({
  exerciseType: z.literal('color'),
  colorChallenges: z.array(z.object({
    fruit: z.nativeEnum(FruitType),
    correctColor: z.nativeEnum(ColorName),
    wrongColors: z.array(z.nativeEnum(ColorName)).min(1, { message: "At least one wrong color is required" })
  })).min(1, { message: "At least one color challenge is required" })
});

// Union type for all exercise types
export const CreateExerciseSchema = z.discriminatedUnion('exerciseType', [
  CreateLetterExerciseSchema,
  CreateAnimalExerciseSchema,
  CreateNumberExerciseSchema,
  CreateColorExerciseSchema,
  // Add other exercise types here as they are implemented
]);

export const UpdateLetterExerciseSchema = CreateLetterExerciseSchema.partial().extend({
  exerciseType: z.literal('letter'), // Keep exerciseType required for discriminated union
});

export const UpdateAnimalExerciseSchema = CreateAnimalExerciseSchema.partial().extend({
  exerciseType: z.literal('animal'), // Keep exerciseType required for discriminated union
});

export const UpdateNumberExerciseSchema = CreateNumberExerciseSchema.partial().extend({
  exerciseType: z.literal('number'), // Keep exerciseType required for discriminated union
});

export const UpdateColorExerciseSchema = CreateColorExerciseSchema.partial().extend({
  exerciseType: z.literal('color'), // Keep exerciseType required for discriminated union
});

// Update schema using discriminated union
export const UpdateExerciseSchema = z.discriminatedUnion('exerciseType', [
  UpdateLetterExerciseSchema,
  UpdateAnimalExerciseSchema,
  UpdateNumberExerciseSchema,
  UpdateColorExerciseSchema,
  // Add other exercise types here as they are implemented
]);

// Base answer schema
export const BaseAnswerSchema = z.object({
  exerciseId: z.string().uuid({ message: "Invalid exercise ID format" }),
  childId: z.string().uuid({ message: "Invalid child ID format" }),
});

// Letter exercise answer schema
export const LetterExerciseAnswerSchema = BaseAnswerSchema.extend({
  exerciseType: z.literal('letter'),
  answer: z.string().min(1, { message: "Answer cannot be empty" }).max(1, { message: "Answer must be a single character" }),
  letterIndex: z.number().int().nonnegative({ message: "Letter index must be a non-negative integer" }),
});

// Animal exercise answer schema
export const AnimalExerciseAnswerSchema = BaseAnswerSchema.extend({
  exerciseType: z.literal('animal'),
  answer: z.string().min(1, { message: "Answer cannot be empty" }),
  animalIndex: z.number().int().nonnegative({ message: "Animal index must be a non-negative integer" }),
});

// Number exercise answer schema
export const NumberExerciseAnswerSchema = BaseAnswerSchema.extend({
  exerciseType: z.literal('number'),
  answer: z.number().int().min(0).max(10, { message: "Answer must be a number between 0 and 10" }),
  numberIndex: z.number().int().nonnegative({ message: "Number index must be a non-negative integer" }),
});

// Color exercise answer schema
export const ColorExerciseAnswerSchema = BaseAnswerSchema.extend({
  exerciseType: z.literal('color'),
  answer: z.nativeEnum(ColorName),
  challengeIndex: z.number().int().nonnegative({ message: "Challenge index must be a non-negative integer" }),
});

// Union type for all exercise answer types
export const ExerciseAnswerSchema = z.discriminatedUnion('exerciseType', [
  LetterExerciseAnswerSchema,
  AnimalExerciseAnswerSchema,
  NumberExerciseAnswerSchema,
  ColorExerciseAnswerSchema,
  // Add other exercise answer types here as they are implemented
]);

// Exercise validation response schema
export const ExerciseValidationResponseSchema = z.object({
  correct: z.boolean(),
  expectedAnswer: z.string().optional(),
  feedback: z.string().optional(),
  gainedXp: z.number().nonnegative().optional(),
});

// Filter params for searching exercises
export const FilterQuerySchema = z.object({
  difficulty: z.nativeEnum(ExerciseDifficulty).optional(),
  minAge: z.coerce.number().min(0).max(18).optional(),
  maxAge: z.coerce.number().min(0).max(18).optional(),
  limit: z.coerce.number().positive().optional(),
  offset: z.coerce.number().nonnegative().optional(),
});

