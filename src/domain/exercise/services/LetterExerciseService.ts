import { EntityManager } from '@mikro-orm/core';
import { IExerciseTypeService } from './IExerciseTypeService.js';
import { Exercise, ExerciseDifficulty } from '../Entity.js';
import { LetterExercise, Letter } from '../letterExercise/Entity.js';
import { AgeRange } from '../ageRange/Entity.js';
import { NotFoundError } from '../../../exceptions/LexoError.js';
import { CreateExerciseDTO, CreateLetterExerciseDTO, ExerciseAnswerDTO, ExerciseValidationResponse, UpdateExerciseDTO } from '../index.js';

export class LetterExerciseService implements IExerciseTypeService {
  canHandle(exerciseType: string): boolean {
    return exerciseType === 'letter';
  }

  async create(em: EntityManager, data: CreateExerciseDTO, userId?: string): Promise<Exercise> {
    if (data.exerciseType !== 'letter') {
      throw new Error('Invalid exercise type for LetterExerciseService');
    }

    // Cast to the specific DTO type
    const letterData = data as CreateLetterExerciseDTO;
    
    // Create age range object
    const ageRange = new AgeRange(letterData.ageRange.min, letterData.ageRange.max);
    
    // Create letter exercise
    const exercise = new LetterExercise(
      letterData.title,
      letterData.description,
      letterData.durationMinutes,
      letterData.mainColor,
      letterData.thumbnailUrl,
      ageRange,
      letterData.difficulty,
      letterData.xp,
      letterData.letters
    );
    
    return exercise;
  }

  async update(em: EntityManager, exercise: Exercise, data: UpdateExerciseDTO): Promise<Exercise> {
    if (!(exercise instanceof LetterExercise)) {
      throw new Error('Exercise is not a LetterExercise');
    }

    // Update letter-specific fields
    if (data.exerciseType === 'letter' && data.letters && Array.isArray(data.letters)) {
      // Replace all letters
      exercise.letters = data.letters.map(letter => new Letter(letter));
    }

    return exercise;
  }

  async validateAnswer(em: EntityManager, exercise: Exercise, answer: ExerciseAnswerDTO): Promise<ExerciseValidationResponse> {
    if (!(exercise instanceof LetterExercise) || answer.exerciseType !== 'letter') {
      throw new Error('Exercise type mismatch');
    }
    
    // Find the letter to validate against
    let letterToCheck: Letter | undefined;
    const letterExerciseAnswer = answer as unknown as { letterIndex?: number, letterValue?: string };
    
    if (letterExerciseAnswer.letterIndex !== undefined) {
      // Use index to find letter
      letterToCheck = exercise.getLetterAt(letterExerciseAnswer.letterIndex);
    } else if (letterExerciseAnswer.letterValue) {
      // Use value to find letter
      letterToCheck = exercise.findLetterByValue(letterExerciseAnswer.letterValue);
    } else if (exercise.letters.length > 0) {
      // Default to first letter if no index or value provided
      letterToCheck = exercise.letters[0];
    }
    
    if (!letterToCheck) {
      throw new NotFoundError('Letter not found in this exercise');
    }
    
    const isCorrect = answer.answer.toLowerCase() === letterToCheck.value.toLowerCase();
    
    return {
      correct: isCorrect,
      expectedAnswer: isCorrect ? undefined : letterToCheck.value,
      gainedXp: isCorrect ? Math.round(exercise.xp / exercise.letters.length) : 0,
    };
  }
}
