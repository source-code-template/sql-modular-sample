import { HealthController } from 'express-ext';
import { UserController } from './user';

export interface ApplicationContext {
  health: HealthController;
  user: UserController;
}
