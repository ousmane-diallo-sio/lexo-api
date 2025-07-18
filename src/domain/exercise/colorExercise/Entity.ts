import { Entity, Property } from "@mikro-orm/core";
import { Exercise, ExerciseDifficulty } from "../Entity.js";
import { AgeRange } from "../ageRange/Entity.js";
import EnvConfig from "../../../lib/config/EnvConfig.js";

export enum FruitType {
  APPLE = 'apple',
  BANANA = 'banana',
  GRAPE = 'grape',
  KIWI = 'kiwi',
  ORANGE = 'orange',
  PEACH = 'peach',
  PINEAPPLE = 'pineapple',
  RASPBERRY = 'raspberry'
}

export enum ColorName {
  GREEN = 'green',
  YELLOW = 'yellow',
  BLACK = 'black',
  PURPLE = 'purple',
  BROWN = 'brown',
  ORANGE = 'orange',
  PINK = 'pink',
  RED = 'red'
}

@Entity()
export class ColorExercise extends Exercise {

  @Property({ type: 'json' })
  colorChallenges: ColorChallenge[] = [];

  constructor(title: string, description: string, durationMinutes: number, mainColor: string, thumbnailUrl: string, ageRange: AgeRange, difficulty: ExerciseDifficulty, xp: number, colorChallenges: ColorChallenge[]) {
    super(title, description, durationMinutes, mainColor, thumbnailUrl, ageRange, difficulty, xp);
    this.colorChallenges = colorChallenges;
  }

}

export class ColorChallenge {
  fruit!: FruitType;
  correctColor!: ColorName;
  wrongColors!: ColorName[];

  get imageUrl(): string {
    return `${EnvConfig.API_BASE_URL}/public/fruits/${this.fruit}_${this.correctColor}.png`;
  }

  get allColors(): ColorName[] {
    return [this.correctColor, ...this.wrongColors];
  }

  constructor(fruit: FruitType, correctColor: ColorName, wrongColors: ColorName[]) {
    this.fruit = fruit;
    this.correctColor = correctColor;
    this.wrongColors = wrongColors;
  }

  toJSON() {
    return {
      fruit: this.fruit,
      correctColor: this.correctColor,
      wrongColors: this.wrongColors,
      allColors: this.allColors,
      imageUrl: this.imageUrl
    };
  }
}