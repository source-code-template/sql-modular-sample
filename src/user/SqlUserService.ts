import { Attribute, SearchResult, Service, StringMap } from 'query-core';
import { User } from './User';
import { UserFilter } from './UserFilter';
import { userModel } from './UserModel';
import { UserService } from './UserService';

export class SqlUserService extends Service<User, string, UserFilter> implements UserService {
  constructor(
    param: (i: number) => string,
    find: (s: UserFilter, limit?: number, offset?: number | string, fields?: string[]) => Promise<SearchResult<User>>,
    query: <T>(sql: string, args?: any[], m?: StringMap, bools?: Attribute[]) => Promise<T[]>,
    exec: (sql: string, args?: any[]) => Promise<number>
  ) {
    super(find, 'users', query, exec, userModel.attributes, param);
  }
}
