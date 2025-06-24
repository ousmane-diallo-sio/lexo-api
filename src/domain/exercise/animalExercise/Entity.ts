import { Collection, Embeddable, Embedded, Entity, Property } from "@mikro-orm/core";
import { Exercise, ExerciseDifficulty } from "../Entity.js";
import { AgeRange } from "../ageRange/Entity.js";
import EnvConfig from "../../../lib/config/EnvConfig.js";

@Entity()
export class AnimalExercise extends Exercise {

  @Embedded(() => Animal, { array: true })
  animals = new Collection<Animal>(this);

  constructor(title: string, description: string, durationMinutes: number, mainColor: string, thumbnailUrl: string, ageRange: AgeRange, difficulty: ExerciseDifficulty, xp: number, letters: Collection<Animal>) {
    super(title, description, durationMinutes, mainColor, thumbnailUrl, ageRange, difficulty, xp);
    this.animals = this.animals;
  }

}

@Embeddable()
export class Animal {
  @Property()
  animal!: string;

  @Property({ persist: false })
  imageUrl!: string;

  constructor(animal: string) {
    this.animal = animal;
    this.imageUrl = `${EnvConfig.API_BASE_URL}/public/animals/${animal}.png`;
  }
}