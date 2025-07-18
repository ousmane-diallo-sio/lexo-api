import { Embeddable, Embedded, Entity, Enum, ManyToMany, Collection, ManyToOne, Property } from '@mikro-orm/core';
import { BaseEntityWithUUID } from '../../db/BaseEntityWithUUID.js';
import { AgeRange } from './ageRange/Entity.js';
import type { User } from '../user/Entity.js';
import { ChildUser } from '../user/childUser/Entity.js';

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

  @ManyToMany()
  availableToChildren = new Collection<ChildUser>(this);


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