import { IExerciseTypeService } from './IExerciseTypeService.js';

/**
 * Registry for all exercise type services
 */
export class ExerciseServiceRegistry {
  private services: IExerciseTypeService[] = [];

  /**
   * Register a new exercise type service
   */
  registerService(service: IExerciseTypeService): void {
    this.services.push(service);
  }

  /**
   * Get the appropriate service for a given exercise type
   */
  getServiceForType(exerciseType: string): IExerciseTypeService {
    const service = this.services.find(s => s.canHandle(exerciseType));
    
    if (!service) {
      throw new Error(`No service registered for exercise type: ${exerciseType}`);
    }
    
    return service;
  }
}

export const exerciseServiceRegistry = new ExerciseServiceRegistry();
