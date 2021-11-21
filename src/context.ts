import { HealthController, resources } from 'express-ext';
import { Pool } from 'mysql';
import { MySQLChecker, param, PoolManager } from 'mysql-core';
import { mysql, SearchBuilder } from 'query-core';
import { createValidator } from 'xvalidators';
import { SqlUserService, User, UserController, UserFilter, userModel } from './user';

resources.createValidator = createValidator;

export interface ApplicationContext {
  health: HealthController;
  user: UserController;
}
export function createContext(pool: Pool): ApplicationContext {
  const sqlChecker = new MySQLChecker(pool);
  const health = new HealthController([sqlChecker]);
  const manager = new PoolManager(pool);

  const userSearchBuilder = new SearchBuilder<User, UserFilter>(manager.query, 'users', userModel.attributes, mysql);
  const userService = new SqlUserService(userSearchBuilder.search, param, manager.query, manager.exec);
  const user = new UserController(log, userService);

  return { health, user };
}
export function log(msg: string, ctx?: any): void {
  console.log(msg);
}
