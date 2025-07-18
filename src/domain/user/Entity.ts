import { BeforeCreate, BeforeUpdate, BeforeUpsert, Cascade, Collection, Entity, type EventArgs, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryKey, Property, Ref, ref, type Rel, rel, Unique } from '@mikro-orm/core';
import jwt from "jsonwebtoken";
import EnvConfig from '../../lib/config/EnvConfig.js';
import crypto from "crypto";
import type { CreateUserGoogleDTO, CreateUserDTO, CreateAdminUserDTO } from './index.d.ts';
import { BaseEntityWithUUID } from '../../db/BaseEntityWithUUID.js';
import { ChildUser } from './childUser/Entity.js';

@Entity()
export class User extends BaseEntityWithUUID {

  @Property({ unique: true })
  email!: string;

  @Property()
  firstName!: string;

  @Property()
  lastName!: string;

  @Property({ unique: true })
  googleId?: string;

  @OneToMany(() => ChildUser, (child) => child.parent, { cascade: [Cascade.ALL], orphanRemoval: true })
  children = new Collection<Rel<ChildUser>>(this);

  @Property()
  emailVerified: boolean = false;

  @Property({ default: false })
  isAdmin: boolean = false;

  @Property({ hidden: true, lazy: true })
  password?: string;

  @Property({ hidden: true, lazy: true })
  salt?: string

  // Remember, the constructor is never used by MikroORM when creating managed entities
  constructor(dto: CreateUserDTO | CreateUserGoogleDTO | CreateAdminUserDTO) {
    super();
    this.email = dto.email;
    this.firstName = dto.firstName;
    this.lastName = dto.lastName;

    if ('password' in dto && dto.password) {
      this.password = dto.password;
    }

    if ('googleId' in dto && dto.googleId) {
      this.googleId = dto.googleId;
    }

    if ('children' in dto && dto.children && Array.isArray(dto.children)) {
      dto.children.forEach(childDTO => {
        const child = new ChildUser(childDTO);
        this.children.add(child);
      });
    }

    if ('adminCreationKey' in dto && dto.adminCreationKey) {
      if (this.checkAdminCreationKey(dto.adminCreationKey, dto.email)) {
        if ('isAdmin' in dto && dto.isAdmin) {
          this.isAdmin = dto.isAdmin;
        }
      }
    }
  }

  @BeforeCreate()
  @BeforeUpdate()
  @BeforeUpsert()
  async hashPassword(args: EventArgs<User>) {
    const password = args.changeSet?.payload.password;
    if (password) {
      const salt = crypto.randomBytes(16).toString('hex');
      this.password = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
      this.salt = salt;
    }
  }

  checkAdminCreationKey(adminCreationKey: string, email: string) {
    if (adminCreationKey === EnvConfig.ADMIN_CREATION_KEY) return true;
    console.warn(`Attempted to create admin user with invalid key: ${adminCreationKey}, email: ${email}`);
    throw new Error("Invalid admin creation key");
  }

  generateToken() {
    return jwt.sign({ id: this.id, email: this.email }, EnvConfig.JWT_SECRET, { expiresIn: "7d" });
  }

  verifyPassword(password: string) {
    if (!this.salt) return false;
    const _hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
    return _hash === this.password;
  }

}

@Entity()
export class ChildUser extends BaseEntityWithUUID {

  @Property()
  firstName!: string;

  @Property()
  username!: string;

  @Property()
  birthdate!: Date;

  @Property()
  avatarUrl?: string;

  @Property()
  xp: number = 0;

  @ManyToOne()
  parent!: Rel<User>;
}