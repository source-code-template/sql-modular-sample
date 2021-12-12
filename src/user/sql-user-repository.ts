import { DB, Repository } from 'query-core';
import { User, userModel, UserRepository } from './user';

export class SqlUserRepository extends Repository<User, string> implements UserRepository {
  constructor(db: DB) {
    super(db, 'users', userModel);
  }
}
