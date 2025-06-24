import { EntityManager } from '@mikro-orm/core';
import { Exercise } from '../Entity.js';
import { CreateExerciseDTO, ExerciseAnswerDTO, ExerciseValidationResponse, UpdateExerciseDTO } from '../index.js';

/**
 * Interface for exercise type-specific services
 */
export interface IExerciseTypeService {
  /**
   * Create a new exercise of this specific type
   */
  create(em: EntityManager, data: CreateExerciseDTO, userId?: string): Promise<Exercise>;
  
  /**
   * Update an existing exercise of this specific type
   */
  update(em: EntityManager, exercise: Exercise, data: UpdateExerciseDTO): Promise<Exercise>;
  
  /**
   * Validate a user answer for this exercise type
   */
  validateAnswer(em: EntityManager, exercise: Exercise, answer: ExerciseAnswerDTO): Promise<ExerciseValidationResponse>;
  
  /**
   * Check if this service can handle the given exercise type
   */
  canHandle(exerciseType: string): boolean;
}
