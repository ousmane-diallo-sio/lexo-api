import { OptionalProps, PrimaryKey, Property } from '@mikro-orm/postgresql';
import { v4 as uuidv4 } from 'uuid';

// see: https://mikro-orm.io/docs/guide/relationships#custom-base-entity
export abstract class BaseEntity<Optional = never> {

  /*
    see :
      - https://mikro-orm.io/docs/guide/relationships#creating-entity-graph
      - https://mikro-orm.io/docs/guide/relationships#generics-to-the-rescue
  */
  [OptionalProps]?: 'createdAt' | 'updatedAt' | Optional;

  @Property()
  createdAt = new Date().toUTC();

  @Property({ onUpdate: () => new Date().toUTC() })
  updatedAt = new Date().toUTC();

}