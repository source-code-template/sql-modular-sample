import { DB, Repository } from "query-core"
import { User, UserFilter, userModel, UserRepository } from "./user"

export class SqlUserRepository extends Repository<User, string, UserFilter> implements UserRepository {
  constructor(db: DB) {
    super(db, "users", userModel)
  }
}
