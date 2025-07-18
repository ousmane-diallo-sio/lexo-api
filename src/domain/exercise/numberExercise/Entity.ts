import { Embeddable, Embedded, Entity, Property, Enum } from "@mikro-orm/core";
import { Exercise, ExerciseDifficulty } from "../Entity.js";
import { AgeRange } from "../ageRange/Entity.js";
import EnvConfig from "../../../lib/config/EnvConfig.js";

export enum NumberImageType {
  REGULAR = 'regular',
  HAND = 'hand'
}

@Entity()
export class NumberExercise extends Exercise {

  @Property({ type: 'json' })
  numbers: Number[] = [];

  @Enum(() => NumberImageType)
  imageType: NumberImageType;

  constructor(title: string, description: string, durationMinutes: number, mainColor: string, thumbnailUrl: string, ageRange: AgeRange, difficulty: ExerciseDifficulty, xp: number, numbers: number[], imageType: NumberImageType) {
    super(title, description, durationMinutes, mainColor, thumbnailUrl, ageRange, difficulty, xp);
    this.numbers = numbers.map(number => new Number(number, imageType));
    this.imageType = imageType;
  }

}

export class Number {
  number!: number;
  imageType!: NumberImageType;

  get imageUrl(): string {
    if (this.imageType === NumberImageType.HAND) {
      return `${EnvConfig.API_BASE_URL}/public/hand_numbers/hand_${this.number}.png`;
    } else {
      return `${EnvConfig.API_BASE_URL}/public/numbers/${this.number}.png`;
    }
  }

  constructor(number: number, imageType: NumberImageType) {
    this.number = number;
    this.imageType = imageType;
  }

  toJSON() {
    return {
      number: this.number,
      imageType: this.imageType,
      imageUrl: this.imageUrl
    };
  }
}