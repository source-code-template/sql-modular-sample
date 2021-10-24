import { DateRange, Filter } from 'onecore';

export interface UserFilter extends Filter {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date|DateRange;
}
