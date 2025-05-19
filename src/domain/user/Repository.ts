import { ServerMessage } from '../../types/response.js';
import { omit } from '../../lib/utils/index.js';
import { User } from './Entity.js';
import { FilterQuery, LoadStrategy, wrap } from '@mikro-orm/core';
import { NotFoundError } from '../../exceptions/LexoError.js';
import { CreateUserDTO, CreateUserGoogleDTO, UpdateUserDTO } from './index.js';
import orm from '../../db/orm.js';

class UserRepository {

  async create(data: CreateUserDTO | CreateUserGoogleDTO) {
    const em = orm.getEmFork();

    const user = new User(data);
    await em.persistAndFlush(user);

    return {
      data: omit(user, ["password", "salt"]),
      jwt: user.generateToken()
    };
  }

  async update(id: string, data: UpdateUserDTO): Promise<any> {
    const em = orm.getEmFork();

    const user = await em.findOneOrFail(User, id, { 
      failHandler: () => new NotFoundError() }
    );
    
    wrap(user).assign(data, { mergeObjectProperties: true });
    await em.persistAndFlush(user);

    return {
      data: user,
      jwt: user.generateToken()
    };
  }

  async updateEmailVerified(email: string, emailVerified: boolean) {
    const em = orm.getEmFork();
    const user = await em.findOneOrFail(User, { email }, { failHandler: () => new NotFoundError() });

    user.emailVerified = emailVerified;
    return em.persistAndFlush(user);
  }

  async delete(id: string) {
    const em = orm.getEmFork();
    const userRef = em.getReference(User, id);
    return await em.removeAndFlush(userRef);
  }

  async findAll() {
    const em = orm.getEmFork();
    return await em.find(User, {}, {
        exclude: ['password', 'salt']
      }
    );
  }

  async findById(id: string) {
    const em = orm.getEmFork();
    return await em.findOneOrFail(User, id, {
      exclude: ['password', 'salt'],
      failHandler: () => new NotFoundError(),
    }
    );
  }

  async findByGoogleId(googleId: string) {
    const em = orm.getEmFork();
    return await em.findOneOrFail(User, { googleId }, {
      exclude: ['password', 'salt'],
      failHandler: () => new NotFoundError(),
    }
    );
  }

  async findByEmailForLogin(email: string) {
    const em = orm.getEmFork();
    return await em.findOneOrFail(User, { email }, {
      fields: ['id', 'email', 'password', 'salt', 'googleId'],
      failHandler: () => new NotFoundError(),
    });
  }
}

export const userRepository = new UserRepository();