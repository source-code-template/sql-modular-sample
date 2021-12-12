import { HealthController, LogController, resources } from 'express-ext';
import { Logger, map } from 'logger-core';
import { createChecker, DB } from 'query-core';
import { createValidator } from 'xvalidators';
import { UserController, useUserController } from './user';

resources.createValidator = createValidator;

export interface ApplicationContext {
  health: HealthController;
  log: LogController;
  user: UserController;
}
export function useContext(db: DB, logger: Logger): ApplicationContext {
  const log = new LogController(logger, map);
  const sqlChecker = createChecker(db);
  const health = new HealthController([sqlChecker]);

  const user = useUserController(logger.error, db);

  return { health, log, user };
}
