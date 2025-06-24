import { Collection, Embeddable, Embedded, Entity, Property } from "@mikro-orm/core";
import { Exercise, ExerciseDifficulty } from "../Entity.js";
import { AgeRange } from "../ageRange/Entity.js";
import EnvConfig from "../../../lib/config/EnvConfig.js";

@Entity()
export class LetterExercise extends Exercise {

  @Embedded(() => Letter, { array: true })
  letters = new Collection<Letter>(this);

  constructor(title: string, description: string, durationMinutes: number, mainColor: string, thumbnailUrl: string, ageRange: AgeRange, difficulty: ExerciseDifficulty, xp: number, letters: Collection<Letter>) {
    super(title, description, durationMinutes, mainColor, thumbnailUrl, ageRange, difficulty, xp);
    this.letters = letters;
  }

}

@Embeddable()
export class Letter {
  @Property()
  letter!: string;

  @Property({ persist: false })
  imageUrl!: string;

  constructor(letter: string) {
    this.letter = letter;
    this.imageUrl = `${EnvConfig.API_BASE_URL}/public/letters/${letter}.png`;
  }
}