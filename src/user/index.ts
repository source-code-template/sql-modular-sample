import { Manager, SearchResult } from 'onecore';
import { DB, SearchBuilder } from 'query-core';
import { User, UserFilter, userModel, UserRepository, UserService } from './user';
import { UserController } from './user-controller';
export * from './user';
export { UserController };

import { SqlUserRepository } from './sql-user-repository';

export class UserManager extends Manager<User, string, UserFilter> implements UserService {
  constructor(find: (s: UserFilter, limit?: number, offset?: number | string, fields?: string[]) => Promise<SearchResult<User>>, repository: UserRepository) {
    super(find, repository);
  }
}
export function useUser(db: DB): UserService {
  const builder = new SearchBuilder<User, UserFilter>(db.query, 'users', userModel.attributes, db.driver);
  const repository = new SqlUserRepository(db);
  return new UserManager(builder.search, repository);
}
export function useUserController(log: (msg: string) => void, db: DB): UserController {
  return new UserController(log, useUser(db));
}
