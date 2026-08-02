import { DB } from "sql-core"
import { UserController } from "./controller"
import { SqlUserRepository } from "./repository"
import { UserUseCase } from "./service"
export * from "./controller"
export * from "./user"

export function useUserController(db: DB): UserController {
  const repository = new SqlUserRepository(db)
  const service = new UserUseCase(repository)
  return new UserController(service)
}
