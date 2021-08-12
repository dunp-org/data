import Store from './store';


// dunp data app settings
export default class Settings extends Store {
  constructor(data, { identity, db }) {
    super(data, { type: 'keyvalue', names: [data.app], identity, db });
  }
}
