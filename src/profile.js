import { nanoid } from 'nanoid';

import Store from './store';
import { checkRequired, checkValid } from './utils/validation';

// dunp data profile
export default class Profile extends Store {

  static DEFAULT = 'default';

  constructor(data, { identity, db }) {
    super(data, { type: 'docstore', names: ['profile'], identity, db });

    this.validate = (key, value) => {
      // Add id if missing
      if (!value.id) value.id = nanoid(12);
      // Perform other validations
      if (![Profile.DEFAULT, this._data.app].includes(key)) throw new Error(`profile '${key}' not accessible`);
      if (value) {
        checkRequired(REQUIRED, value);
        if (key === Profile.DEFAULT) checkValid(VALID_DEFAULT, value);
      }
      return true;
    };
  }
}

const REQUIRED = {
  id: 'string',
  version: 'string',
  created: 'number',
  updated: 'number',
  publish: 'bool'
};

const VALID_DEFAULT = {
  id: 'string',
  version: 'string',
  created: 'number',
  updated: 'number',
  publish: 'bool',

  name: 'string',
  avatar: 'string',
  bio: 'string',
  location: 'string',
  links: 'object',
  birthday: 'number',

  tags: 'array',
  metadata: 'object'
};
