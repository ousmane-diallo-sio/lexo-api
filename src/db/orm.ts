import { EntityManager, MikroORM } from '@mikro-orm/postgresql';

class Orm {
  private static _instance: Orm;
  private _orm?: MikroORM;

  private constructor() {}

  static getInstance(): Orm {
    if (!Orm._instance) {
      Orm._instance = new Orm();
    }
    return Orm._instance;
  }

  get(): MikroORM {
    if (!this._orm) {
      throw new Error('ORM not initialized yet. Ensure MikroORM.init() is called before accessing the ORM.');
    }
    return this._orm;
  }

  getEmFork(): EntityManager {
    if (!this._orm) {
      throw new Error('ORM not initialized yet. Ensure MikroORM.init() is called before accessing the EntityManager.');
    }
    return this._orm.em.fork();
  }

  set(orm: MikroORM): void {
    this._orm = orm;
  }
}

const orm = Orm.getInstance();

export default orm;