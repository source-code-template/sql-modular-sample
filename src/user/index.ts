import { DB, SearchBuilder } from 'query-core';
import { User, UserFilter, userModel, UserService } from './user';
export * from './user';

import { SqlUserService } from './SqlUserService';
import { UserController } from './UserController';
export { UserController };

export function useUser(db: DB): UserService {
  const userSearchBuilder = new SearchBuilder<User, UserFilter>(db.query, 'users', userModel.attributes, db.driver);
  return new SqlUserService(userSearchBuilder.search, db);
}
export function useUserController(log: (msg: string) => void, db: DB): UserController {
  return new UserController(log, useUser(db));
}
