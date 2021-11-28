import { HealthController, LogController, resources } from 'express-ext';
import { JSONLogger, LogConfig, map } from 'logger-core';
import { Pool } from 'mysql';
import { MySQLChecker, param, PoolManager } from 'mysql-core';
import { mysql, SearchBuilder } from 'query-core';
import { createValidator } from 'xvalidators';
import { SqlUserService, User, UserController, UserFilter, userModel } from './user';

resources.createValidator = createValidator;

export interface Config {
  port?: number;
  log: LogConfig;
}
export interface ApplicationContext {
  health: HealthController;
  log: LogController;
  user: UserController;
}
export function createContext(pool: Pool, conf: Config): ApplicationContext {
  const logger = new JSONLogger(conf.log.level, conf.log.map);
  const log = new LogController(logger, map);

  const sqlChecker = new MySQLChecker(pool);
  const health = new HealthController([sqlChecker]);
  const manager = new PoolManager(pool);

  const userSearchBuilder = new SearchBuilder<User, UserFilter>(manager.query, 'users', userModel.attributes, mysql);
  const userService = new SqlUserService(userSearchBuilder.search, param, manager.query, manager.exec);
  const user = new UserController(logger.error, userService);

  return { health, log, user };
}
