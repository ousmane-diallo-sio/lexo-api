import { Collection, Embeddable, Embedded, Entity, Property } from "@mikro-orm/core";
import { Exercise, ExerciseDifficulty } from "../Entity.js";
import { AgeRange } from "../ageRange/Entity.js";
import EnvConfig from "../../../lib/config/EnvConfig.js";

@Embeddable()
export class Number {
  @Property()
  number!: number;

  @Property({ persist: false })
  imageUrl!: string;

  constructor(number: number) {
    this.number = number;
    this.imageUrl = `${EnvConfig.API_BASE_URL}/public/numbers/${number}.png`;
  }
}

@Entity()
export class NumberExercise extends Exercise {

  @Embedded(() => Number, { array: true })
  letters = new Collection<Number>(this);

  constructor(title: string, description: string, durationMinutes: number, mainColor: string, thumbnailUrl: string, ageRange: AgeRange, difficulty: ExerciseDifficulty, xp: number, letters: Collection<Number>) {
    super(title, description, durationMinutes, mainColor, thumbnailUrl, ageRange, difficulty, xp);
    this.letters = letters;
  }

}