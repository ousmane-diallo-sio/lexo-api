import { FilterQuery, QueryOrder, wrap } from '@mikro-orm/core';
import { NotFoundError } from '../../exceptions/LexoError.js';
import { Exercise, ExerciseDifficulty } from './Entity.js';
import orm from '../../db/orm.js';
import { AgeRange } from './ageRange/Entity.js';
import { User } from '../user/Entity.js';
import { exerciseServiceRegistry } from './services/ExerciseServiceRegistry.js';
import { CreateExerciseDTO, ExerciseAnswerDTO, ExerciseValidationResponse, LexoFilterQuery, UpdateExerciseDTO } from './index.js';

class ExerciseRepository {
  async create(data: CreateExerciseDTO, userId: string) {
    const em = orm.getEmFork();
    
    try {
      // Find the user
      const user = await em.findOne(User, userId);
      
      // Get the appropriate service for this exercise type
      const service = exerciseServiceRegistry.getServiceForType(data.exerciseType);
      
      // Create the exercise using the service
      let exercise = await service.create(em, data);
      
      // Set the user if available
      if (user) {
        exercise.user = user;
      }
      
      await em.persistAndFlush(exercise);
      return exercise;
    } catch (error) {
      console.error('Error creating exercise:', error);
      throw error;
    }
  }

  async update(id: string, data: UpdateExerciseDTO) {
    const em = orm.getEmFork();
    
    try {
      // Find the exercise
      const exercise = await em.findOneOrFail(Exercise, id, {
        failHandler: () => new NotFoundError('Exercise not found')
      });
    
      // Handle type-specific updates if exerciseType is provided
      if ('exerciseType' in data && data.exerciseType) {
        const service = exerciseServiceRegistry.getServiceForType(data.exerciseType);
        await service.update(em, exercise, data);
      } else {
        // Try to infer type from the exercise instance
        for (const exType of ['letter']) {
          try {
            const service = exerciseServiceRegistry.getServiceForType(exType);
            await service.update(em, exercise, { ...data, exerciseType: exType as any });
            break;
          } catch (e) {
            // Continue to next type
          }
        }
      }
      
      // Update age range if provided
      if (data.ageRange) {
        exercise.ageRange = new AgeRange(
          data.ageRange.min, 
          data.ageRange.max
        );
        delete data.ageRange;
      }
      
      // Update general properties that apply to all exercise types
      const commonProps = { ...data };
      delete commonProps.exerciseType;
      delete commonProps.letters;
      
      wrap(exercise).assign(commonProps as any);
      await em.flush();
      
      return exercise;
    } catch (error) {
      console.error('Error updating exercise:', error);
      throw error;
    }
  }

  async delete(id: string) {
    const em = orm.getEmFork();
    const exercise = await em.findOneOrFail(Exercise, id, {
      failHandler: () => new NotFoundError('Exercise not found')
    });
    
    await em.removeAndFlush(exercise);
    return true;
  }

  async findById(id: string) {
    const em = orm.getEmFork();
    return await em.findOneOrFail(Exercise, id, {
      failHandler: () => new NotFoundError('Exercise not found')
    });
  }
  
  async findByUserId(userId: string) {
    const em = orm.getEmFork();
    return await em.find(Exercise, { user: userId });
  }

  async findAll(filters: LexoFilterQuery = {}) {
    const em = orm.getEmFork();
    
    const whereOptions: FilterQuery<Exercise> = {};
    
    // Apply filters
    if (filters.difficulty) {
      whereOptions.difficulty = filters.difficulty;
    }
    
    // Age range filtering
    if (filters.minAge !== undefined || filters.maxAge !== undefined) {
      // Need to do this more complex due to embedded entity
      const qb = em.createQueryBuilder(Exercise, 'e');
      
      if (filters.minAge !== undefined) {
        qb.where({ 'e.ageRange.minAge': { $lte: filters.minAge } });
      }
      
      if (filters.maxAge !== undefined) {
        qb.andWhere({ 'e.ageRange.maxAge': { $gte: filters.maxAge } });
      }
      
      qb.orderBy({ createdAt: QueryOrder.DESC });
      
      if (filters.limit) {
        qb.limit(filters.limit);
      }
      
      if (filters.offset) {
        qb.offset(filters.offset);
      }
      
      const [exercises, total] = await qb.getResultAndCount();
      return { exercises, total };
    }
    
    // Standard query without age filtering
    const [exercises, total] = await em.findAndCount(Exercise, whereOptions, {
      limit: filters.limit,
      offset: filters.offset,
      orderBy: { createdAt: QueryOrder.DESC }
    });
    
    return { exercises, total };
  }
  
  // Validate a user's answer to an exercise
  async validateAnswer(answerData: ExerciseAnswerDTO): Promise<ExerciseValidationResponse> {
    const em = orm.getEmFork();
    
    try {
      // Find the exercise
      const exercise = await em.findOneOrFail(Exercise, answerData.exerciseId, {
        failHandler: () => new NotFoundError('Exercise not found')
      });
      
      // Get the appropriate service for this answer type
      const service = exerciseServiceRegistry.getServiceForType(answerData.exerciseType);
      
      // Validate using the service
      return await service.validateAnswer(em, exercise, answerData);
    } catch (error) {
      console.error('Error validating exercise answer:', error);
      throw error;
    }
  }
}

export const exerciseRepository = new ExerciseRepository();
