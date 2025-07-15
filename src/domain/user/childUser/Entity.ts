import { Entity, ManyToOne, ManyToMany, Collection, Property, type Rel } from "@mikro-orm/core";
import { BaseEntityWithUUID } from "../../../db/BaseEntityWithUUID.js";
import { User } from "../Entity.js";
import type { CreateChildUserDTO } from "../index.d.ts";
import { Exercise } from "../../exercise/Entity.js";

@Entity()
export class ChildUser extends BaseEntityWithUUID {

  @Property()
  firstName!: string;

  @Property()
  username!: string;

  @Property()
  birthdate!: Date;

  @Property()
  xp: number = 0;

  @Property()
  gems: number = 0;

  @Property()
  avatarUrl?: string;

  @ManyToOne()
  parent!: Rel<User>;

  @ManyToMany(() => Exercise, 'availableToChildren')
  availableExercises = new Collection<Exercise>(this);

  constructor(dto: CreateChildUserDTO) {
    super();
    this.firstName = dto.firstName;
    this.username = dto.username;
    this.birthdate = dto.birthdate;
    if (dto.avatarUrl) {
      this.avatarUrl = dto.avatarUrl;
    }
  }
}