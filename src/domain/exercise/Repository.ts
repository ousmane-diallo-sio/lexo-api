import { FilterQuery, FindOptions, QueryOrder, wrap } from '@mikro-orm/core';
import { NotFoundError } from '../../exceptions/LexoError.js';
import { Exercise, ExerciseDifficulty } from './Entity.js';
import { LetterExercise, Letter } from './letterExercise/Entity.js';
import { AnimalExercise, Animal } from './animalExercise/Entity.js';
import { NumberExercise, Number } from './numberExercise/Entity.js';
import { ColorExercise, ColorChallenge } from './colorExercise/Entity.js';
import orm from '../../db/orm.js';
import { AgeRange } from './ageRange/Entity.js';
import { User } from '../user/Entity.js';
import { exerciseServiceRegistry } from './services/ExerciseServiceRegistry.js';
import { CreateExerciseDTO, ExerciseAnswerDTO, ExerciseValidationResponse, LexoFilterQuery, UpdateExerciseDTO } from './index.js';

class ExerciseRepository {
  async create(data: CreateExerciseDTO, userId: string) {
    const em = orm.getEmFork();

    try {
      const user = await em.findOne(User, userId);
      const service = exerciseServiceRegistry.getServiceForType(data.exerciseType);

      let exercise = await service.create(em, data);

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
      // Find the exercise in concrete types since Exercise is abstract
      let exercise: Exercise | null = null;
      
      // Try letter exercise first
      exercise = await em.findOne(LetterExercise, id);
      
      if (!exercise) {
        exercise = await em.findOne(AnimalExercise, id);
      }
      if (!exercise) {
        exercise = await em.findOne(NumberExercise, id);
      }
      if (!exercise) {
        exercise = await em.findOne(ColorExercise, id);
      }

      if (!exercise) {
        throw new NotFoundError('Exercise not found');
      }

      if ('exerciseType' in data && data.exerciseType) {
        const service = exerciseServiceRegistry.getServiceForType(data.exerciseType);
        await service.update(em, exercise, data);
      } else {
        // If no exerciseType is provided, try to determine it from the exercise instance
        let exerciseType: string;
        if (exercise instanceof LetterExercise) {
          exerciseType = 'letter';
        } else if (exercise instanceof AnimalExercise) {
          exerciseType = 'animal';
        } else if (exercise instanceof NumberExercise) {
          exerciseType = 'number';
        } else if (exercise instanceof ColorExercise) {
          exerciseType = 'color';
        } else {
          throw new Error('Unknown exercise type');
        }
        
        const service = exerciseServiceRegistry.getServiceForType(exerciseType);
        const dataWithType = Object.assign({}, data, { exerciseType });
        await service.update(em, exercise, dataWithType as any);
      }

      if (data.ageRange) {
        exercise.ageRange = new AgeRange(
          data.ageRange.min,
          data.ageRange.max
        );
      }

      const commonProps: any = {};
      
      if (data.title !== undefined) commonProps.title = data.title;
      if (data.description !== undefined) commonProps.description = data.description;
      if (data.durationMinutes !== undefined) commonProps.durationMinutes = data.durationMinutes;
      if (data.mainColor !== undefined) commonProps.mainColor = data.mainColor;
      if (data.thumbnailUrl !== undefined) commonProps.thumbnailUrl = data.thumbnailUrl;
      if (data.xp !== undefined) commonProps.xp = data.xp;
      if (data.difficulty !== undefined) commonProps.difficulty = data.difficulty;

      wrap(exercise).assign(commonProps);
      await em.flush();

      return exercise;
    } catch (error) {
      console.error('Error updating exercise:', error);
      throw error;
    }
  }

  async delete(id: string) {
    const em = orm.getEmFork();
    
    // Find the exercise in concrete types since Exercise is abstract
    let exercise: Exercise | null = null;
    
    // Try letter exercise first
    exercise = await em.findOne(LetterExercise, id);
    
    if (!exercise) {
      exercise = await em.findOne(AnimalExercise, id);
    }
    if (!exercise) {
      exercise = await em.findOne(NumberExercise, id);
    }
    if (!exercise) {
      exercise = await em.findOne(ColorExercise, id);
    }

    if (!exercise) {
      throw new NotFoundError('Exercise not found');
    }

    await em.removeAndFlush(exercise);
    return true;
  }

  async findById(id: string) {
    const em = orm.getEmFork();
    
    // Try to find the exercise in each concrete type since Exercise is abstract
    try {
      const letterExercise = await em.findOne(LetterExercise, id);
      if (letterExercise) {
        if (letterExercise.letters) {
          letterExercise.letters = letterExercise.letters.map((letterData: any) => 
            letterData instanceof Letter ? letterData : new Letter(letterData.letter)
          );
        }
        return letterExercise;
      }
    } catch (error) {
    }
    
    try {
      const animalExercise = await em.findOne(AnimalExercise, id);
      if (animalExercise) {
        if (animalExercise.animals) {
          animalExercise.animals = animalExercise.animals.map((animalData: any) => 
            animalData instanceof Animal ? animalData : new Animal(animalData.animal)
          );
        }
        return animalExercise;
      }
    } catch (error) {
    }    try {
      const numberExercise = await em.findOne(NumberExercise, id);
      if (numberExercise) {
        if (numberExercise.numbers) {
          numberExercise.numbers = numberExercise.numbers.map((numberData: any) => 
            numberData instanceof Number ? numberData : new Number(numberData.number, numberExercise.imageType)
          );
        }
        return numberExercise;
      }
    } catch (error) {
    }

    try {
      const colorExercise = await em.findOne(ColorExercise, id);
      if (colorExercise) {
        if (colorExercise.colorChallenges) {
          colorExercise.colorChallenges = colorExercise.colorChallenges.map((challengeData: any) => 
            challengeData instanceof ColorChallenge ? challengeData : new ColorChallenge(challengeData.fruit, challengeData.correctColor, challengeData.wrongColors)
          );
        }
        return colorExercise;
      }
    } catch (error) {
    }

    throw new NotFoundError('Exercise not found');
  }

  async findByUserId(userId: string) {
    const em = orm.getEmFork();
    
    const exercises: Exercise[] = [];
    
    const letterExercises = await em.find(LetterExercise, { user: userId });
    letterExercises.forEach(exercise => {
      if (exercise.letters) {
        exercise.letters = exercise.letters.map((letterData: any) => 
          letterData instanceof Letter ? letterData : new Letter(letterData.letter)
        );
      }
      exercises.push(exercise);
    });

    const animalExercises = await em.find(AnimalExercise, { user: userId });
    animalExercises.forEach(exercise => {
      if (exercise.animals) {
        exercise.animals = exercise.animals.map((animalData: any) => 
          animalData instanceof Animal ? animalData : new Animal(animalData.animal)
        );
      }
      exercises.push(exercise);
    });
    
    const numberExercises = await em.find(NumberExercise, { user: userId });
    numberExercises.forEach(exercise => {
      if (exercise.numbers) {
        exercise.numbers = exercise.numbers.map((numberData: any) => 
          numberData instanceof Number ? numberData : new Number(numberData.number, exercise.imageType)
        );
      }
      exercises.push(exercise);
    });

    const colorExercises = await em.find(ColorExercise, { user: userId });
    colorExercises.forEach(exercise => {
      if (exercise.colorChallenges) {
        exercise.colorChallenges = exercise.colorChallenges.map((challengeData: any) => 
          challengeData instanceof ColorChallenge ? challengeData : new ColorChallenge(challengeData.fruit, challengeData.correctColor, challengeData.wrongColors)
        );
      }
      exercises.push(exercise);
    });

    return exercises;
  }

  async findAll(filters: LexoFilterQuery = {}) {
    const em = orm.getEmFork();

    const buildWhereOptions = (baseConditions: FilterQuery<any> = {}) => {
      const whereOptions = { ...baseConditions };

      if (filters.difficulty) {
        whereOptions.difficulty = filters.difficulty;
      }

      if (filters.minAge !== undefined) {
        whereOptions.age_range_min = { $lte: filters.minAge };
      }

      if (filters.maxAge !== undefined) {
        whereOptions.age_range_max = { $gte: filters.maxAge };
      }

      return whereOptions;
    };

    const letterQueryOptions: FindOptions<LetterExercise> = {
      limit: filters.limit,
      offset: filters.offset,
      orderBy: { id: QueryOrder.DESC }
    };

    const animalQueryOptions: FindOptions<AnimalExercise> = {
      limit: filters.limit,
      offset: filters.offset,
      orderBy: { id: QueryOrder.DESC }
    };

    const numberQueryOptions: FindOptions<NumberExercise> = {
      limit: filters.limit,
      offset: filters.offset,
      orderBy: { id: QueryOrder.DESC }
    };

    const colorQueryOptions: FindOptions<ColorExercise> = {
      limit: filters.limit,
      offset: filters.offset,
      orderBy: { id: QueryOrder.DESC }
    };

    const [letterExercises, letterTotal] = await em.findAndCount(
      LetterExercise, 
      buildWhereOptions(),
      letterQueryOptions
    );

    const transformedLetterExercises = letterExercises.map(exercise => {
      if (exercise.letters) {
        exercise.letters = exercise.letters.map((letterData: any) => 
          letterData instanceof Letter ? letterData : new Letter(letterData.letter)
        );
      }
      return exercise;
    });

    const [animalExercises, animalTotal] = await em.findAndCount(
      AnimalExercise, 
      buildWhereOptions(),
      animalQueryOptions
    );

    const transformedAnimalExercises = animalExercises.map(exercise => {
      if (exercise.animals) {
        exercise.animals = exercise.animals.map((animalData: any) => 
          animalData instanceof Animal ? animalData : new Animal(animalData.animal)
        );
      }
      return exercise;
    });

    const [numberExercises, numberTotal] = await em.findAndCount(
      NumberExercise, 
      buildWhereOptions(),
      numberQueryOptions
    );

    const transformedNumberExercises = numberExercises.map(exercise => {
      if (exercise.numbers) {
        exercise.numbers = exercise.numbers.map((numberData: any) => 
          numberData instanceof Number ? numberData : new Number(numberData.number, exercise.imageType)
        );
      }
      return exercise;
    });

    const [colorExercises, colorTotal] = await em.findAndCount(
      ColorExercise, 
      buildWhereOptions(),
      colorQueryOptions
    );

    const transformedColorExercises = colorExercises.map(exercise => {
      if (exercise.colorChallenges) {
        exercise.colorChallenges = exercise.colorChallenges.map((challengeData: any) => 
          challengeData instanceof ColorChallenge ? challengeData : new ColorChallenge(challengeData.fruit, challengeData.correctColor, challengeData.wrongColors)
        );
      }
      return exercise;
    });

    const totalExercises = letterTotal + animalTotal + numberTotal + colorTotal;

    const exercises = {
      letter: transformedLetterExercises,
      animal: transformedAnimalExercises,
      number: transformedNumberExercises,
      color: transformedColorExercises,
    };

    return { 
      exercises,
      total: totalExercises 
    };
  }

  // Validate a user's answer to an exercise
  async validateAnswer(answerData: ExerciseAnswerDTO): Promise<ExerciseValidationResponse> {
    const em = orm.getEmFork();

    try {
      // Find the exercise in concrete types since Exercise is abstract
      let exercise: Exercise | null = null;
      
      // Try letter exercise first
      exercise = await em.findOne(LetterExercise, answerData.exerciseId);
      
      // Add other exercise types here when they exist
      if (!exercise) {
        exercise = await em.findOne(AnimalExercise, answerData.exerciseId);
      }
      if (!exercise) {
        exercise = await em.findOne(NumberExercise, answerData.exerciseId);
      }
      if (!exercise) {
        exercise = await em.findOne(ColorExercise, answerData.exerciseId);
      }

      if (!exercise) {
        throw new NotFoundError('Exercise not found');
      }

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
