import { Manager, SearchResult } from 'onecore';
import { DB, SearchBuilder } from 'query-core';
import { User, UserFilter, userModel, UserRepository, UserService } from './user';
import { UserController } from './user-controller';
export * from './user';
export { UserController };

import { SqlUserRepository } from './sql-user-repository';

export type SearchFunc<T, F> = (s: F, limit?: number, offset?: number | string, fields?: string[]) => Promise<SearchResult<T>>;
export class UserManager extends Manager<User, string, UserFilter> implements UserService {
  constructor(search: SearchFunc<User, UserFilter>, repository: UserRepository) {
    super(search, repository);
  }
}
export function useUserService(db: DB): UserService {
  const builder = new SearchBuilder<User, UserFilter>(db.query, 'users', userModel.attributes, db.driver);
  const repository = new SqlUserRepository(db);
  return new UserManager(builder.search, repository);
}
export function useUserController(log: (msg: string) => void, db: DB): UserController {
  return new UserController(log, useUserService(db));
}
