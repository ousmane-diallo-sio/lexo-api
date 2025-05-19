import { OptionalProps, PrimaryKey, Property } from '@mikro-orm/postgresql';
import { v4 as uuidv4 } from 'uuid';
import { BaseEntity } from './BaseEntity.js';

export abstract class BaseEntityWithUUID<Optional = never> extends BaseEntity<Optional> {

  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

}