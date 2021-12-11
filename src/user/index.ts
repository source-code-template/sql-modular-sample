import { DB, SearchBuilder } from 'query-core';
import { User, UserFilter, userModel, UserService } from './user';
import { UserController } from './UserController';
export * from './user';
export { UserController };

import { SqlUserService } from './SqlUserService';

export function useUser(db: DB): UserService {
  const userSearchBuilder = new SearchBuilder<User, UserFilter>(db.query, 'users', userModel.attributes, db.driver);
  return new SqlUserService(userSearchBuilder.search, db);
}
export function useUserController(log: (msg: string) => void, db: DB): UserController {
  return new UserController(log, useUser(db));
}
