import { Embeddable, Embedded, Entity, Property } from "@mikro-orm/core";
import { Exercise, ExerciseDifficulty } from "../Entity.js";
import { AgeRange } from "../ageRange/Entity.js";
import EnvConfig from "../../../lib/config/EnvConfig.js";

@Entity()
export class LetterExercise extends Exercise {

  @Embedded(() => Letter, { array: true })
  letters: Letter[] = [];

  constructor(
    title: string,
    description: string, 
    durationMinutes: number, 
    mainColor: string, 
    thumbnailUrl: string, 
    ageRange: AgeRange, 
    difficulty: ExerciseDifficulty, 
    xp: number, 
    letters: string[]
  ) {
    super(title, description, durationMinutes, mainColor, thumbnailUrl, ageRange, difficulty, xp);
    this.letters = letters.map(letter => new Letter(letter));
  }
  
  /**
   * Get all letter values in this exercise
   * @returns Array of letter values
   */
  getAllLetterValues(): string[] {
    return this.letters.map(letter => letter.value);
  }
  
  /**
   * Get all image URLs for the letters in this exercise
   * @returns Array of image URLs
   */
  getAllImageUrls(): string[] {
    return this.letters.map(letter => letter.imageUrl);
  }
  
  /**
   * Check if the provided answer matches the specified letter
   * @param answer The user's answer to check
   * @param letterIndex Index of the letter to check against (0-based)
   * @returns Whether the answer is correct
   */
  isCorrectAnswer(answer: string, letterIndex: number): boolean {
    if (letterIndex < 0 || letterIndex >= this.letters.length) {
      return false;
    }
    return answer.toLowerCase() === this.letters[letterIndex].value.toLowerCase();
  }
  
  /**
   * Get the letter at the specified index
   * @param index Index of the letter to retrieve (0-based)
   * @returns The letter or undefined if index is out of bounds
   */
  getLetterAt(index: number): Letter | undefined {
    return this.letters[index];
  }
  
  /**
   * Find a letter by its value
   * @param letterValue The letter value to find
   * @returns The matching letter or undefined if not found
   */
  findLetterByValue(letterValue: string): Letter | undefined {
    return this.letters.find(l => l.value.toLowerCase() === letterValue.toLowerCase());
  }
}

@Embeddable()
export class Letter {
  @Property()
  value!: string;

  @Property({ persist: false })
  imageUrl!: string;

  constructor(letter: string) {
    this.value = letter;
    this.imageUrl = `${EnvConfig.API_BASE_URL}/public/letters/${letter}.png`;
  }
}