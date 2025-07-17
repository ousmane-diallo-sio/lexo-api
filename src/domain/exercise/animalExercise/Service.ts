import { EntityManager } from '@mikro-orm/core';
import { IExerciseTypeService } from '../services/IExerciseTypeService.js';
import { Exercise } from '../Entity.js';
import { CreateExerciseDTO, ExerciseAnswerDTO, ExerciseValidationResponse, UpdateExerciseDTO } from '../index.js';
import { AnimalExercise, Animal } from './Entity.js';
import { AgeRange } from '../ageRange/Entity.js';
import { ChildUser } from '../../user/childUser/Entity.js';
import { NotFoundError } from '../../../exceptions/LexoError.js';

export class AnimalExerciseService implements IExerciseTypeService {
  
  canHandle(exerciseType: string): boolean {
    return exerciseType === 'animal';
  }

  async create(em: EntityManager, data: CreateExerciseDTO): Promise<Exercise> {
    if (data.exerciseType !== 'animal' || !data.animals) {
      throw new Error('Invalid data for animal exercise');
    }

    const ageRange = new AgeRange(data.ageRange.min, data.ageRange.max);
    
    const exercise = new AnimalExercise(
      data.title,
      data.description,
      data.durationMinutes,
      data.mainColor,
      data.thumbnailUrl,
      ageRange,
      data.difficulty,
      data.xp,
      data.animals
    );

    return exercise;
  }

  async update(em: EntityManager, exercise: Exercise, data: UpdateExerciseDTO): Promise<Exercise> {
    if (!(exercise instanceof AnimalExercise)) {
      throw new Error('Exercise is not an animal exercise');
    }

    if (data.exerciseType === 'animal' && data.animals) {
      exercise.animals = data.animals.map((animal: string) => new Animal(animal));
    }

    return exercise;
  }

  async validateAnswer(em: EntityManager, exercise: Exercise, answer: ExerciseAnswerDTO): Promise<ExerciseValidationResponse> {
    if (!(exercise instanceof AnimalExercise)) {
      throw new Error('Exercise is not an animal exercise');
    }

    if (answer.exerciseType !== 'animal') {
      throw new Error('Answer is not for an animal exercise');
    }

    const child = await em.findOne(ChildUser, answer.childId);
    if (!child) {
      throw new NotFoundError('Child user not found');
    }
    
    if (answer.animalIndex < 0 || answer.animalIndex >= exercise.animals.length) {
      return {
        correct: false,
        expectedAnswer: 'N/A',
        feedback: 'Invalid animal index',
        gainedXp: 0
      };
    }

    const expectedAnimal = exercise.animals[answer.animalIndex].animal;
    const isCorrect = answer.answer.toLowerCase() === expectedAnimal.toLowerCase();
    const feedback = isCorrect 
      ? `Correct! This animal is a ${expectedAnimal}` 
      : `Try again! This animal is a ${expectedAnimal}`;
    
    let gainedXp = 0;
    if (isCorrect) {
      gainedXp = Math.round((exercise.xp / exercise.animals.length) * 100) / 100;
      child.xp += gainedXp;
      await em.flush();
    }
    
    return {
      correct: isCorrect,
      expectedAnswer: expectedAnimal,
      feedback,
      gainedXp
    };
  }
}
