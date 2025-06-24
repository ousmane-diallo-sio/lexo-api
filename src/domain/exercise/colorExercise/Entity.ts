import { Collection, Embeddable, Embedded, Entity, ManyToMany, ManyToOne, Property } from "@mikro-orm/core";
import { Exercise, ExerciseDifficulty } from "../Entity.js";
import { AgeRange } from "../ageRange/Entity.js";
import EnvConfig from "../../../lib/config/EnvConfig.js";

@Entity()
export class ColorExercise extends Exercise {

  @Embedded(() => ColorChallenge, { array: true })
  colorChallenges = new Collection<ColorChallenge>(this);

  constructor(title: string, description: string, durationMinutes: number, mainColor: string, thumbnailUrl: string, ageRange: AgeRange, difficulty: ExerciseDifficulty, xp: number, colorChallenges: Collection<ColorChallenge>) {
    super(title, description, durationMinutes, mainColor, thumbnailUrl, ageRange, difficulty, xp);
    this.colorChallenges = colorChallenges;
  }

}

@Entity()
export class Color {
  @Property()
  color!: string;

  @Property()
  name!: string;

  constructor(color: string, name: string) {
    this.color = color;
    this.name = name;
  }
}

@Embeddable()
export class ColorChallenge {

  @ManyToOne()
  color!: Color;

  @ManyToMany()
  wrongColors = new Collection<Color>(this);

  @Property({ persist: false })
  imageUrl!: string;

  constructor(color: Color, wrongColors: Collection<Color>) {
    this.color = color;
    this.wrongColors = wrongColors;
    this.imageUrl = `${EnvConfig.API_BASE_URL}/public/colors/${color.name}.png`;
  }
}