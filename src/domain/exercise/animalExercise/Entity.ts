import { Embeddable, Embedded, Entity, Property } from "@mikro-orm/core";
import { Exercise, ExerciseDifficulty } from "../Entity.js";
import { AgeRange } from "../ageRange/Entity.js";
import EnvConfig from "../../../lib/config/EnvConfig.js";

@Entity()
export class AnimalExercise extends Exercise {

  @Property({ type: 'json' })
  animals: Animal[] = [];

  constructor(title: string, description: string, durationMinutes: number, mainColor: string, thumbnailUrl: string, ageRange: AgeRange, difficulty: ExerciseDifficulty, xp: number, animals: string[]) {
    super(title, description, durationMinutes, mainColor, thumbnailUrl, ageRange, difficulty, xp);
    this.animals = animals.map(animal => new Animal(animal));
  }

}

export class Animal {
  animal!: string;

  get imageUrl(): string {
    return `${EnvConfig.API_BASE_URL}/public/animals/${this.animal}.png`;
  }

  constructor(animal: string) {
    this.animal = animal;
  }

  toJSON() {
    return {
      animal: this.animal,
      imageUrl: this.imageUrl
    };
  }
}