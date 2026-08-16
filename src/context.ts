import { HealthController, LogController, Logger, Middleware, MiddlewareController, resources } from "express-web-kit"
import { updateLogger } from "logger-core"
import { Pool } from "mysql2"
import { MySQLChecker, PoolManager } from "mysql2-core"
import { check } from "types-validation"
import { createValidator } from "validation-core"
import { UserController, useUserController } from "./user"

resources.createValidator = createValidator
resources.check = check

export interface ApplicationContext {
  health: HealthController
  log: LogController
  middleware: MiddlewareController
  user: UserController
}
export function useContext(pool: Pool, logger: Logger, midLogger: Middleware): ApplicationContext {
  const db = new PoolManager(pool)
  const log = new LogController(logger, updateLogger)
  const middleware = new MiddlewareController(midLogger)
  const sqlChecker = new MySQLChecker(pool.promise())
  const health = new HealthController([sqlChecker])

  const user = useUserController(db)

  return { health, log, middleware, user }
}
