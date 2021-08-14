import { nanoid } from 'nanoid';

import Store from './store';
import { checkRequired, checkValid } from './utils/validation';

// dunp data portfolio
export default class Portfolio extends Store {

  static TYPES = [
    'post',     // Post content, like tweets or short content like social media posts
    'blog',     // Longer form content, like reddit or medium posts
    'audio',    // Audio content, like music, podcasts or DJ sets
    'video',    // Video content, like youtube or tiktok content
    'photo',    // Photos like instagram or flickr
    'book',     // Books, like if you are a book writer
    'event',    // Event data, like calendar appointments or facebook events
    'course',   // Courses as in online learning communities
    'shop'      // Products or articles for sale, like craigslist, amazon or ebay
    // What else? submit PR's with other interesting portfolio types... :)
  ];

  static MODIFIERS = [ 
    'set'       // Collections
  ];

  static MODIFIER_SEPARATOR = ':'

  constructor(data, { type, modifier, identity, db }) {
    if (type && !Portfolio.TYPES.includes(type)) throw new Error(`portfolio type '${type}' not accepted`);
    if (modifier && !Portfolio.MODIFIERS.includes(modifier)) throw new Error(`portfolio modifier '${modifier}' not accepted`);
    const portfolio = modifier ? [type, modifier].join(Portfolio.MODIFIER_SEPARATOR) : type;
    super(data, { type: 'feed', names: [portfolio], identity, db });

    this.validate = (data) => {
      // Add id if missing
      if (!data.id) data.id = nanoid(12);
      // Perform other validations
      checkRequired(REQUIRED, data);
      checkValid(VALID, data);
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

const VALID = {
  id: 'string',
  version: 'string',
  created: 'number',
  updated: 'number',
  publish: 'bool',

  content: 'string',
  thumbnail: 'string',
  title: 'string',
  summary: 'string',
  length: 'number',

  type: 'string',
  category: 'string',
  tags: 'array',
  metadata: 'object'
};
