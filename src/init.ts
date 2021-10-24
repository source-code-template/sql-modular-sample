import { HealthController, resources } from 'express-ext';
import { Pool } from 'mysql';
import { MySQLChecker, param, PoolManager } from 'mysql-core';
import { mysql, SearchBuilder } from 'query-core';
import { createValidator } from 'validator-x';
import { ApplicationContext } from './context';
import { SqlUserService, User, UserController, UserFilter, userModel } from './user';

export function log(msg: string, ctx?: any): void {
  console.log(msg);
}
resources.createValidator = createValidator;

export function createContext(pool: Pool): ApplicationContext {
  const sqlChecker = new MySQLChecker(pool);
  const health = new HealthController([sqlChecker]);
  const manager = new PoolManager(pool);

  const userSearchBuilder = new SearchBuilder<User, UserFilter>(manager.query, 'users', userModel.attributes, mysql);
  const userService = new SqlUserService(param, userSearchBuilder.search, manager.query, manager.exec);
  const user = new UserController(log, userService);

  const ctx: ApplicationContext = { health, user };
  return ctx;
}
