import { EventEmitter } from 'events';


// dunp data common store
export default class Store extends EventEmitter {

  static PREFIX = 'dunp';
  static SEPARATOR = '.';

  constructor(data, { type, names = [], identity, db }) {
    super();

    this._data = data;
    if (db) {
      this._db = db;
      this._identity = this._db.access.write[0].id;
      this._name = this._db.dbname;
      this._type = this._db.type;
    } else {
      this._identity = identity || data.identity.id;
      this._name = Store.PREFIX + Store.SEPARATOR + names.join(Store.SEPARATOR);
      this._type = type;
      this._db = null;
    }

    this.emit('created', this._name);
  }

  static async fromAddress(data, address) {
    if (typeof this !== 'function') throw new Error('fromAddress is static, cannot be called from an object or directly');

    const db = await data.orbitdb.open(address);

    const store = new this(data, { db });

    return store._setup();
  }

  // Read only properties
  get name() { return this._name; }
  get type() { return this._type; }
  get address() { return this._db ? this._db.id : undefined; }

  async open() {
    this._onlyClosed();

    this._db = await data.orbitdb.open(this._name, {
      create: true,
      type: this._type,
      accessController: { write: [ this._identity ] }
    });

    return this._setup();
  }

  async _setup() {
    this._db.events.on('replicated', (address) => this.emit('notify', this._name, address));
    await this._db.load();

    switch (this.type) {
      case 'feed':
        this.del = async (hash) => { this._onlyOpen(); return this._db.del(hash); };
      case 'eventlog':
        this.all = () => { this._onlyOpen(); return this._db.iterator({ limit: -1 }).collect().map(e => ({ _hash: e.hash, ...e.payload.value })); };
        this.get = (hash) => { this._onlyOpen(); const entry = this._db.get(hash); return { _hash: entry.hash, ...entry.payload.value } };
        this.add = async (data) => { this._onlyOpen(); return this.validate(data) ? this._db.add(data) : null; };
        break;
      case 'docstore':
        this.all = () => { this._onlyOpen(); return this._db.query(() => true); };
        this.get = (key) => { this._onlyOpen(); const res = this._db.get(key, true); return res.length > 0 ? res[0] : null };
        this.set = async (key, value) => { this._onlyOpen(); return this.validate(key, value) ? this._db.put({ ...value, _id: key }) : null; };
        this.del = async (key) => { this._onlyOpen(); return this.validate(key) ? this._db.del(key) : null; };
        break;
      case 'keyvalue':
        this.all = () => { this._onlyOpen(); return this._db.all; };
        this.get = (key) => { this._onlyOpen(); return this._db.get(key); };
        this.set = async (key, value) => { this._onlyOpen(); return this.validate(key, value) ? this._db.set(key, value) : null; };
        this.del = async (key) => { this._onlyOpen(); return this.validate(key) ? this._db.del(key) : null; };
        break;
      default:
        throw new Error('unknown data store type');
    }

    this.emit('opened', this._name, this.address);

    return this;
  }

  async close() {
    this._onlyOpen();
    // remove all event listeners and close the store
    await this._db.close();

    this.emit('closed', this._name, this.address);
  }

  // Helpers
  _nop = () => { this._onlyOpen(); throw new Error('invalid operation'); };
  _any = () => true;

  _onlyOpen = () => { if (!this._db) throw new Error('data store not open'); }
  _onlyClosed = () => { if (this._db) throw new Error('data store already open'); }


  // Operations
  all = this._nop;
  get = this._nop;
  set = this._nop;
  add = this._nop;
  del = this._nop;

  // Validation
  validate = this._any;   // key, value

}
