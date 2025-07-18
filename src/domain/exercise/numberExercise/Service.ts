import { EntityManager } from '@mikro-orm/core';
import { IExerciseTypeService } from '../services/IExerciseTypeService.js';
import { Exercise } from '../Entity.js';
import { CreateExerciseDTO, ExerciseAnswerDTO, ExerciseValidationResponse, UpdateExerciseDTO } from '../index.js';
import { NumberExercise, Number, NumberImageType } from './Entity.js';
import { AgeRange } from '../ageRange/Entity.js';
import { ChildUser } from '../../user/childUser/Entity.js';
import { NotFoundError } from '../../../exceptions/LexoError.js';

export class NumberExerciseService implements IExerciseTypeService {
  
  canHandle(exerciseType: string): boolean {
    return exerciseType === 'number';
  }

  async create(em: EntityManager, data: CreateExerciseDTO): Promise<Exercise> {
    if (data.exerciseType !== 'number' || !data.numbers) {
      throw new Error('Invalid data for number exercise');
    }

    const ageRange = new AgeRange(data.ageRange.min, data.ageRange.max);
    
    const exercise = new NumberExercise(
      data.title,
      data.description,
      data.durationMinutes,
      data.mainColor,
      data.thumbnailUrl,
      ageRange,
      data.difficulty,
      data.xp,
      data.numbers,
      data.imageType || NumberImageType.REGULAR
    );

    return exercise;
  }

  async update(em: EntityManager, exercise: Exercise, data: UpdateExerciseDTO): Promise<Exercise> {
    if (!(exercise instanceof NumberExercise)) {
      throw new Error('Exercise is not a number exercise');
    }

    if (data.exerciseType === 'number') {
      if (data.numbers) {
        exercise.numbers = data.numbers.map((number: number) => new Number(number, exercise.imageType));
      }

      if (data.imageType) {
        exercise.imageType = data.imageType;
        // Regenerate numbers with new image type
        if (exercise.numbers) {
          exercise.numbers = exercise.numbers.map(numberObj => new Number(numberObj.number, data.imageType!));
        }
      }
    }

    return exercise;
  }

  async validateAnswer(em: EntityManager, exercise: Exercise, answer: ExerciseAnswerDTO): Promise<ExerciseValidationResponse> {
    if (!(exercise instanceof NumberExercise)) {
      throw new Error('Exercise is not a number exercise');
    }

    if (answer.exerciseType !== 'number') {
      throw new Error('Answer is not for a number exercise');
    }

    const child = await em.findOne(ChildUser, answer.childId);
    if (!child) {
      throw new NotFoundError('Child user not found');
    }
    
    if (answer.numberIndex < 0 || answer.numberIndex >= exercise.numbers.length) {
      return {
        correct: false,
        expectedAnswer: 'N/A',
        feedback: 'Invalid number index',
        gainedXp: 0
      };
    }

    const expectedNumber = exercise.numbers[answer.numberIndex].number;
    const isCorrect = answer.answer === expectedNumber;
    const feedback = isCorrect 
      ? `Correct! This number is ${expectedNumber}` 
      : `Try again! This number is ${expectedNumber}`;
    
    let gainedXp = 0;
    if (isCorrect) {
      gainedXp = Math.round((exercise.xp / exercise.numbers.length) * 100) / 100;
      child.xp += gainedXp;
      await em.flush();
    }
    
    return {
      correct: isCorrect,
      expectedAnswer: expectedNumber.toString(),
      feedback,
      gainedXp
    };
  }
}

export const numberExerciseService = new NumberExerciseService();
