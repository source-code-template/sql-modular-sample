import { Controller, Log } from 'express-ext';
import { User, UserFilter, UserService } from './user';

export class UserController extends Controller<User, string, UserFilter> {
  constructor(log: Log, userService: UserService) {
    super(log, userService);
  }
}
