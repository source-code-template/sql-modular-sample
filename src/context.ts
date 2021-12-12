import { HealthController, LogController, resources } from 'express-ext';
import { JSONLogger, LogConfig, map } from 'logger-core';
import { createChecker, DB } from 'query-core';
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
export function useContext(db: DB, conf: Config): ApplicationContext {
  const logger = new JSONLogger(conf.log.level, conf.log.map);
  const log = new LogController(logger, map);

  const sqlChecker = createChecker(db);
  const health = new HealthController([sqlChecker]);

  const user = useUserController(logger.error, db);

  return { health, log, user };
}
