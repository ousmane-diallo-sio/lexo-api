import { Embeddable, Embedded, Entity, Property } from "@mikro-orm/core";
import { Exercise, ExerciseDifficulty } from "../Entity.js";
import { AgeRange } from "../ageRange/Entity.js";
import EnvConfig from "../../../lib/config/EnvConfig.js";

@Entity()
export class LetterExercise extends Exercise {

  @Property({ type: 'json' })
  letters: Letter[] = [];

  constructor(title: string, description: string, durationMinutes: number, mainColor: string, thumbnailUrl: string, ageRange: AgeRange, difficulty: ExerciseDifficulty, xp: number, letters: string[]) {
    super(title, description, durationMinutes, mainColor, thumbnailUrl, ageRange, difficulty, xp);
    this.letters = letters.map(letter => new Letter(letter));
  }

}

export class Letter {
  letter!: string;

  get imageUrl(): string {
    return `${EnvConfig.API_BASE_URL}/public/letters/${this.letter}.png`;
  }

  constructor(letter: string) {
    this.letter = letter;
  }

  toJSON() {
    return {
      letter: this.letter,
      imageUrl: this.imageUrl
    };
  }
}