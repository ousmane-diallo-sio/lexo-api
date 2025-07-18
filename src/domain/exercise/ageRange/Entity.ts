import { BaseEntity, Check, Embeddable, Entity, Property } from '@mikro-orm/core';

@Embeddable()
@Check({ expression: 'min < max' })
export class AgeRange extends BaseEntity {

  @Property()
  min: number;

  @Property()
  max: number;

  constructor(min: number, max: number) {
    super();
    this.min = min;
    this.max = max;
  }

}