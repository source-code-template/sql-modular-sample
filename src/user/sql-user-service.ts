import { DB, SearchResult, Service } from 'query-core';
import { User, UserFilter, userModel, UserService } from './user';

export class SqlUserService extends Service<User, string, UserFilter> implements UserService {
  constructor(find: (s: UserFilter, limit?: number, offset?: number | string, fields?: string[]) => Promise<SearchResult<User>>, db: DB) {
    super(find, db, 'users', userModel.attributes);
  }
}
