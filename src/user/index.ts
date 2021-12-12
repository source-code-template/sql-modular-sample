import { Log, Manager, Search } from 'onecore';
import { DB, SearchBuilder } from 'query-core';
import { User, UserFilter, userModel, UserRepository, UserService } from './user';
import { UserController } from './user-controller';
export * from './user';
export { UserController };

import { SqlUserRepository } from './sql-user-repository';

export class UserManager extends Manager<User, string, UserFilter> implements UserService {
  constructor(search: Search<User, UserFilter>, repository: UserRepository) {
    super(search, repository);
  }
}
export function useUserService(db: DB): UserService {
  const builder = new SearchBuilder<User, UserFilter>(db.query, 'users', userModel, db.driver);
  const repository = new SqlUserRepository(db);
  return new UserManager(builder.search, repository);
}
export function useUserController(log: Log, db: DB): UserController {
  return new UserController(log, useUserService(db));
}
