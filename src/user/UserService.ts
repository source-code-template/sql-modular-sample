import { ResultInfo, Service } from 'onecore';
import { User } from './User';
import { UserFilter } from './UserFilter';

export interface UserService extends Service<User, string, number | ResultInfo<User>, UserFilter> {
}
