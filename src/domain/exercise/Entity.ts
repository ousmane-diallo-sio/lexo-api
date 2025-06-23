import { Embeddable, Embedded, Entity, Enum, Property } from '@mikro-orm/core';
import { BaseEntityWithUUID } from '../../db/BaseEntityWithUUID.js';
import { AgeRange } from './ageRange/Entity.js';

@Entity()
export abstract class Exercise extends BaseEntityWithUUID {

  @Property()
  title: string;

  @Property()
  description: string;

  @Property()
  durationMinutes: number;

  @Property()
  thumbnailUrl: string;

  @Embedded()
  ageRange: AgeRange;

  @Enum(() => ExerciseDifficulty)
  difficulty: ExerciseDifficulty;

  @Property()
  xp: number;

  constructor(title: string, description: string, durationMinutes: number, thumbnailUrl: string, ageRange: AgeRange, difficulty: ExerciseDifficulty, xp: number) {
    super();
    this.title = title;
    this.description = description;
    this.durationMinutes = durationMinutes;
    this.thumbnailUrl = thumbnailUrl;
    this.ageRange = ageRange;
    this.difficulty = difficulty;
    this.xp = xp;
  }
}

export enum ExerciseDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}