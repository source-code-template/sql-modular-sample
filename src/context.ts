import { HealthController, LogController, resources } from 'express-ext';
import { JSONLogger, LogConfig, map } from 'logger-core';
import { Pool } from 'mysql';
import { MySQLChecker, PoolManager } from 'mysql-core';
import { createValidator } from 'xvalidators';
import { UserController, useUserController } from './user';

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
export function useContext(pool: Pool, conf: Config): ApplicationContext {
  const logger = new JSONLogger(conf.log.level, conf.log.map);
  const log = new LogController(logger, map);

  const sqlChecker = new MySQLChecker(pool);
  const health = new HealthController([sqlChecker]);
  const db = new PoolManager(pool);

  const user = useUserController(logger.error, db);

  return { health, log, user };
}
