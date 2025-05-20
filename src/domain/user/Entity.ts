import { BeforeCreate, BeforeUpdate, BeforeUpsert, Cascade, Collection, Entity, type EventArgs, ManyToMany, OneToMany, OneToOne, PrimaryKey, Property, ref, type Rel, rel, Unique } from '@mikro-orm/core';
import jwt from "jsonwebtoken";
import EnvConfig from '../../lib/config/EnvConfig.js';
import crypto from "crypto";
import type { CreateUserGoogleDTO, CreateUserDTO, CreateAdminUserDTO } from './index.d.ts';
import { BaseEntityWithUUID } from '../../db/BaseEntityWithUUID.js';

@Entity()
export class User extends BaseEntityWithUUID {

  @Property({ unique: true })
  email!: string;

  @Property({ unique: true })
  googleId?: string;

  @Property()
  username: string;

  @Property()
  birthdate?: Date

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
    this.username = dto.username;
    this.birthdate = dto.birthdate;
    if ('password' in dto && dto.password) {
      this.password = dto.password;
    }
    if ('googleId' in dto && dto.googleId) {
      this.googleId = dto.googleId;
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
    console.debug('Verifying password:', { _hash, password, salt: this.salt });
    return _hash === this.password;
  }

}