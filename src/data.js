import { EventEmitter } from 'events';
import IPFS from 'ipfs';
import OrbitDB from 'orbit-db';
import Identity from '@dunp/identity';

import { validateSlug } from './utils';
import config from '../config';
import Settings from './settings';
import Profile from './profile';


// dunp data store
export default class Data extends EventEmitter {
  
  static DEFAULT_OPTIONS = {
    // default options go here
    config
  };
  
  constructor(app, identity, options = {}) {
    super();

    if (!validateSlug(app)) throw new Error(`app '${app}' is not a valid slug`);
    if (!Identity.verifyIdentity(identity)) throw new Error('supplied identity is invalid');

    this._app = app;
    this._identity = identity;
    this._options = Object.assign({}, Data.DEFAULT_OPTIONS, options);
  }

  static async create(app, identity, options = {}) {
    const data = new Data(app, identity, options);
    await data.start();
    return data;
  }

  async _startIPFS(config) {
    return IPFS.create(config);
  }

  async _startOrbitDB(config) {
    return OrbitDB.createInstance(this.ipfs, {
      ...config,
      identity: this.identity
    });
  }

    // Startup and notify when started
    async start() {
    // IPFS init
    if (this._options.ipfs && typeof this._options.ipfs === 'object') {
      // TODO: validate ipfs instance
      this._ipfs = this._options.ipfs;
    } else {
      this._ipfs = await this._startIPFS(this._options.config.ipfs);
    }      
      
    // OrbitDB init
    if (this._options.orbitdb && typeof this._options.orbitdb === 'object') {
      // TODO: validate orbitdb instance
      this._orbitdb = this._options.orbitdb;
    } else {
      this._orbitdb = await this._startOrbitDB(this._options.config.orbitdb);
    }

    this.emit('started', this);
  }

  // Read only properties
  get app() { return this._app; }
  get identity() { return this._identity; }
  get ipfs() { return this._ipfs; }
  get orbitdb() { return this._orbitdb; }

  // Settings
  async settings(appIdentity) {
    const store = new Settings(this, { identity: appIdentity });
    await store.open();
    return store;
  }

  // Profile
  async profile(identity) {
    const store = new Profile(this, { identity });
    await store.open();
    return store;
  }

  async profileFromAddress(address) {
    const store = await Profile.fromAddress(this, address);
    return store;
  }

}