import { Embeddable, Embedded, Entity, Enum, ManyToOne, Property } from '@mikro-orm/core';
import { BaseEntityWithUUID } from '../../db/BaseEntityWithUUID.js';
import { AgeRange } from './ageRange/Entity.js';
import { User } from '../user/Entity.js';

@Entity()
export abstract class Exercise extends BaseEntityWithUUID {

  @ManyToOne()
  user?: User;

  @Property()
  title: string;

  @Property()
  description: string;

  @Property()
  durationMinutes: number;

  @Property()
  mainColor: string;

  @Property()
  thumbnailUrl: string;

  @Property()
  xp: number;

  @Embedded()
  ageRange: AgeRange;

  @Enum(() => ExerciseDifficulty)
  difficulty: ExerciseDifficulty;


  constructor(title: string, description: string, durationMinutes: number, mainColor: string, thumbnailUrl: string, ageRange: AgeRange, difficulty: ExerciseDifficulty, xp: number) {
    super();
    this.title = title;
    this.description = description;
    this.durationMinutes = durationMinutes;
    this.mainColor = mainColor;
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