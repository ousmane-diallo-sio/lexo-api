import { EntityManager } from '@mikro-orm/core';
import { IExerciseTypeService } from '../services/IExerciseTypeService.js';
import { Exercise } from '../Entity.js';
import { CreateExerciseDTO, ExerciseAnswerDTO, ExerciseValidationResponse, UpdateExerciseDTO } from '../index.js';
import { ColorExercise, ColorChallenge, FruitType, ColorName } from './Entity.js';
import { AgeRange } from '../ageRange/Entity.js';
import { ChildUser } from '../../user/childUser/Entity.js';
import { NotFoundError } from '../../../exceptions/LexoError.js';

export class ColorExerciseService implements IExerciseTypeService {
  
  canHandle(exerciseType: string): boolean {
    return exerciseType === 'color';
  }

  async create(em: EntityManager, data: CreateExerciseDTO): Promise<Exercise> {
    if (data.exerciseType !== 'color' || !data.colorChallenges) {
      throw new Error('Invalid data for color exercise');
    }

    const ageRange = new AgeRange(data.ageRange.min, data.ageRange.max);
    
    const colorChallenges = data.colorChallenges.map(challenge => 
      new ColorChallenge(
        challenge.fruit,
        challenge.correctColor,
        challenge.wrongColors
      )
    );
    
    const exercise = new ColorExercise(
      data.title,
      data.description,
      data.durationMinutes,
      data.mainColor,
      data.thumbnailUrl,
      ageRange,
      data.difficulty,
      data.xp,
      colorChallenges
    );

    return exercise;
  }

  async update(em: EntityManager, exercise: Exercise, data: UpdateExerciseDTO): Promise<Exercise> {
    if (!(exercise instanceof ColorExercise)) {
      throw new Error('Exercise is not a color exercise');
    }

    if (data.exerciseType === 'color') {
      if (data.colorChallenges) {
        exercise.colorChallenges = data.colorChallenges.map(challenge => 
          new ColorChallenge(
            challenge.fruit,
            challenge.correctColor,
            challenge.wrongColors
          )
        );
      }

      // Update other properties
      if (data.title !== undefined) exercise.title = data.title;
      if (data.description !== undefined) exercise.description = data.description;
      if (data.durationMinutes !== undefined) exercise.durationMinutes = data.durationMinutes;
      if (data.mainColor !== undefined) exercise.mainColor = data.mainColor;
      if (data.thumbnailUrl !== undefined) exercise.thumbnailUrl = data.thumbnailUrl;
      if (data.xp !== undefined) exercise.xp = data.xp;
      if (data.difficulty !== undefined) exercise.difficulty = data.difficulty;
      if (data.ageRange !== undefined) {
        exercise.ageRange = new AgeRange(data.ageRange.min, data.ageRange.max);
      }
    }

    return exercise;
  }

  async validateAnswer(em: EntityManager, exercise: Exercise, answerData: ExerciseAnswerDTO): Promise<ExerciseValidationResponse> {
    if (answerData.exerciseType !== 'color') {
      throw new Error('Invalid answer data for color exercise');
    }

    if (!(exercise instanceof ColorExercise)) {
      throw new Error('Exercise is not a color exercise');
    }

    // Find the child user
    const childUser = await em.findOne(ChildUser, answerData.childId);
    if (!childUser) {
      throw new NotFoundError('Child user not found');
    }

    // Validate challenge index
    if (answerData.challengeIndex < 0 || answerData.challengeIndex >= exercise.colorChallenges.length) {
      throw new Error('Invalid challenge index');
    }

    const challenge = exercise.colorChallenges[answerData.challengeIndex];
    const isCorrect = answerData.answer === challenge.correctColor;

    let gainedXp = 0;
    if (isCorrect) {
      gainedXp = Math.floor((exercise.xp / exercise.colorChallenges.length) * 100) / 100;
      childUser.xp += gainedXp;
      await em.persistAndFlush(childUser);
    }

    return {
      correct: isCorrect,
      expectedAnswer: challenge.correctColor,
      feedback: isCorrect 
        ? `Correct! The ${challenge.fruit} is ${challenge.correctColor}.`
        : `Incorrect. The ${challenge.fruit} is ${challenge.correctColor}, not ${answerData.answer}.`,
      gainedXp: isCorrect ? gainedXp : 0,
    };
  }

  async delete(em: EntityManager, exercise: Exercise): Promise<void> {
    if (!(exercise instanceof ColorExercise)) {
      throw new Error('Exercise is not a color exercise');
    }
    
    await em.removeAndFlush(exercise);
  }
}
