import { Entity, Property } from "@mikro-orm/core";
import { Exercise, ExerciseDifficulty } from "../Entity.js";
import { AgeRange } from "../ageRange/Entity.js";
import EnvConfig from "../../../lib/config/EnvConfig.js";

@Entity()
export class ReadingExercise extends Exercise {

  @Property()
  letters: string[];

  get letterImageUrl(): string[] {
    return this.letters.map(letter => `${EnvConfig.API_BASE_URL}/public/letters/${letter}.png`);
  }

  constructor(title: string, description: string, durationMinutes: number, thumbnailUrl: string, ageRange: AgeRange, difficulty: ExerciseDifficulty, xp: number, letter: string[]) {
    super(title, description, durationMinutes, thumbnailUrl, ageRange, difficulty, xp);
    this.letters = letter;
  }

}