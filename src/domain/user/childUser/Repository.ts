import { FilterQuery, wrap } from '@mikro-orm/core';
import { NotFoundError } from '../../../exceptions/LexoError.js';
import { User } from '../Entity.js';
import orm from '../../../db/orm.js';
import { CreateChildUserDTO, UpdateChildUserDTO } from '../index.js';
import { ChildUser } from './Entity.js';

class UserChildRepository {
  async create(parentId: string, data: CreateChildUserDTO) {
    const em = orm.getEmFork();
    
    const parent = await em.findOneOrFail(User, parentId, {
      failHandler: () => new NotFoundError('User not found')
    });
    
    const child = new ChildUser(data);
    parent.children.add(child);
    await em.persistAndFlush([parent, child]);
    
    return child;
  }

  async update(id: string, data: UpdateChildUserDTO) {
    const em = orm.getEmFork();
    
    const child = await em.findOneOrFail(ChildUser, id, {
      failHandler: () => new NotFoundError('Child not found')
    });
    
    wrap(child).assign(data, { mergeObjectProperties: true });
    await em.persistAndFlush(child);
    
    return child;
  }

  async delete(id: string) {
    const em = orm.getEmFork();
    const child = await em.findOneOrFail(ChildUser, id, {
      failHandler: () => new NotFoundError('Child not found')
    });
    
    await em.removeAndFlush(child);
    return true;
  }

  async findOne(id: string) {
    const em = orm.getEmFork();
    return await em.findOneOrFail(ChildUser, id, {
      failHandler: () => new NotFoundError('Child not found')
    });
  }

  async findByParentId(userId: string) {
    const em = orm.getEmFork();
    return await em.find(ChildUser, { parent: userId });
  }

  async findAll() {
    const em = orm.getEmFork();
    return await em.find(ChildUser, {});
  }
}

export const userChildRepository = new UserChildRepository();
