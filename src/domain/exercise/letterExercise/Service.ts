import { EntityManager } from '@mikro-orm/core';
import { IExerciseTypeService } from '../services/IExerciseTypeService.js';
import { Exercise } from '../Entity.js';
import { CreateExerciseDTO, ExerciseAnswerDTO, ExerciseValidationResponse, UpdateExerciseDTO } from '../index.js';
import { LetterExercise, Letter } from './Entity.js';
import { AgeRange } from '../ageRange/Entity.js';
import { ChildUser } from '../../user/childUser/Entity.js';
import { NotFoundError } from '../../../exceptions/LexoError.js';

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

    if (data.letters) {
      exercise.letters = data.letters.map(letter => new Letter(letter));
    }

    return exercise;
  }

  async validateAnswer(em: EntityManager, exercise: Exercise, answer: ExerciseAnswerDTO): Promise<ExerciseValidationResponse> {
    if (!(exercise instanceof LetterExercise)) {
      throw new Error('Exercise is not a letter exercise');
    }

    const child = await em.findOne(ChildUser, answer.childId);
    if (!child) {
      throw new NotFoundError('Child user not found');
    }
    
    if (answer.letterIndex < 0 || answer.letterIndex >= exercise.letters.length) {
      return {
        correct: false,
        expectedAnswer: 'N/A',
        feedback: 'Invalid letter position',
        gainedXp: 0
      };
    }

    const expectedLetter = exercise.letters[answer.letterIndex].letter;
    const isCorrect = answer.answer.toUpperCase() === expectedLetter.toUpperCase();
    const feedback = isCorrect 
      ? `Correct! The letter at position ${answer.letterIndex + 1} is ${expectedLetter}` 
      : `Try again! The letter at position ${answer.letterIndex + 1} should be ${expectedLetter}`;
    
    let gainedXp = 0;
    if (isCorrect) {
      gainedXp = exercise.xp / exercise.letters.length;
      child.xp += gainedXp;
      await em.flush();
    }
    
    return {
      correct: isCorrect,
      expectedAnswer: expectedLetter,
      feedback,
      gainedXp
    };
  }
}
