import { EntityManager } from '@mikro-orm/core';
import { IExerciseTypeService } from '../services/IExerciseTypeService.js';
import { Exercise } from '../Entity.js';
import { CreateExerciseDTO, ExerciseAnswerDTO, ExerciseValidationResponse, UpdateExerciseDTO } from '../index.js';
import { LetterExercise, Letter } from './Entity.js';
import { AgeRange } from '../ageRange/Entity.js';

export class LetterExerciseService implements IExerciseTypeService {
  
  canHandle(exerciseType: string): boolean {
    return exerciseType === 'letter';
  }

  async create(em: EntityManager, data: CreateExerciseDTO): Promise<Exercise> {
    if (data.exerciseType !== 'letter' || !data.letters) {
      throw new Error('Invalid data for letter exercise');
    }

    const ageRange = new AgeRange(data.ageRange.min, data.ageRange.max);
    
    const exercise = new LetterExercise(
      data.title,
      data.description,
      data.durationMinutes,
      data.mainColor,
      data.thumbnailUrl,
      ageRange,
      data.difficulty,
      data.xp,
      data.letters
    );

    return exercise;
  }

  async update(em: EntityManager, exercise: Exercise, data: UpdateExerciseDTO): Promise<Exercise> {
    if (!(exercise instanceof LetterExercise)) {
      throw new Error('Exercise is not a letter exercise');
    }

    // Update letters if provided
    if (data.letters) {
      exercise.letters = data.letters.map(letter => new Letter(letter));
    }

    return exercise;
  }

  async validateAnswer(em: EntityManager, exercise: Exercise, answer: ExerciseAnswerDTO): Promise<ExerciseValidationResponse> {
    if (!(exercise instanceof LetterExercise)) {
      throw new Error('Exercise is not a letter exercise');
    }

    // Validate specific letter at index
    let isCorrect = false;
    let expectedAnswer = '';
    let feedback = '';

    if ('letterIndex' in answer && answer.letterIndex !== undefined) {
      const letterIndex = answer.letterIndex as number;
      if (letterIndex >= 0 && letterIndex < exercise.letters.length) {
        const expectedLetter = exercise.letters[letterIndex].letter;
        // Case insensitive comparison
        isCorrect = answer.answer.toUpperCase() === expectedLetter.toUpperCase();
        expectedAnswer = expectedLetter;
        feedback = isCorrect 
          ? `Correct! The letter at position ${letterIndex + 1} is ${expectedLetter}` 
          : `Try again! The letter at position ${letterIndex + 1} should be ${expectedLetter}`;
      } else {
        feedback = 'Invalid letter position';
        expectedAnswer = 'N/A';
      }
    } else {
      feedback = 'Letter index is required for validation';
      expectedAnswer = 'N/A';
    }
    
    return {
      correct: isCorrect,
      expectedAnswer,
      feedback,
      gainedXp: isCorrect ? exercise.xp : 0
    };
  }
}
