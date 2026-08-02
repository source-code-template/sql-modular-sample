import { UseCase } from "onecore"
import { User, UserFilter, UserRepository, UserService } from "./user"

export class UserUseCase extends UseCase<User, string, UserFilter> implements UserService {
  constructor(repository: UserRepository) {
    super(repository)
  }
}
