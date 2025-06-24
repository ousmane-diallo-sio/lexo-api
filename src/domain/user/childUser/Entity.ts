import { Entity, ManyToOne, Property, Rel } from "@mikro-orm/core";
import { BaseEntityWithUUID } from "../../../db/BaseEntityWithUUID.js";
import { User } from "../Entity.js";
import { CreateChildUserDTO } from "../index.js";

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