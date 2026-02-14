import { UseCase } from "onecore"
import { DB } from "query-core"
import { UserController } from "./controller"
import { SqlUserRepository } from "./repository"
import { User, UserFilter, UserRepository, UserService } from "./user"
export * from "./controller"
export * from "./user"

export class UserUseCase extends UseCase<User, string, UserFilter> implements UserService {
  constructor(repository: UserRepository) {
    super(repository)
  }
}

export function useUserController(db: DB): UserController {
  const repository = new SqlUserRepository(db)
  const service = new UserUseCase(repository)
  return new UserController(service)
}
