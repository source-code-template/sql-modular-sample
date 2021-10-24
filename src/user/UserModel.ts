import { Model } from 'onecore';

export const userModel: Model = {
  name: 'user',
  source: 'users',
  attributes: {
    id: {
      key: true,
      length: 40
    },
    username: {
      required: true,
      length: 255
    },
    email: {
      format: 'email',
      required: true,
      length: 120
    },
    phone: {
      format: 'phone',
      required: true,
      length: 14
    },
    dateOfBirth: {
      type: 'datetime'
    }
  }
};
