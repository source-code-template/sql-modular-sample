import { Controller } from 'express-ext';
import { User } from './User';
import { UserFilter } from './UserFilter';
import { UserService } from './UserService';

export class UserController extends Controller<User, string, UserFilter> {
  constructor(log: (msg: any, ctx?: any) => void, private userService: UserService) {
    super(log, userService);
  }
}
