import path from 'path';
import { nanoid } from 'nanoid';
import { EventEmitter } from 'events';


export default class Content extends EventEmitter {

  static VERSION = '0.0.1';   // Content version

  static MANIFEST = 'manifest.json';

  static INDEX_MIME_TYPES = [
    // Generic
    'text/plain',
    'text/html',
    'text/markdown',
    // Utility
    'text/csv',
    'text/calendar',
    'text/vcard',
    'application/json',
    'text/xml',
    // Books
    'application/pdf',
    'application/epub+zip',
    'application/postscript',
    'application/rtf',
    'text/rtf',
    // Compressed
    'application/x-tar',
    'application/gzip',
    'application/zip',
    'application/x-bzip',
    'application/x-bzip2',
    // Media
    'audio/*',
    'video/*',
    'image/*'
  ];

  static IPFS_OPTIONS = {
    pin: true,
    wrapWithDirectory: true,
    timeout: 10000
  };

  constructor(data, { portfolio, id, cid }) {
    super();

    this._data = data;
    this._files = [];
    if (cid) {
      this._cid = cid;
      this._published = true;
    } else {
      this._cid = null;
      this._published = false;
      this._portfolio = portfolio;   // Portfolio address
      this._id = id || nanoid(12);
    }
  }

  static async fromAddress(data, address) {
    if (typeof this !== 'function') throw new Error('fromAddress is static, cannot be called from an object or directly');

    const content = new this(data, { cid: address });

    return content.load();
  }

  // Read only properties
  get cid() { return this._cid; }
  get published() { return this._published; }
  get portfolio() { return this._portfolio; }
  get id() { return this._id; }
  get files() { return this._files; }


  add(filepath, content, mode, mtime) {   // WARNING: mode and mtime are optional and will result in different CIDs for the same file if passed!
    // Only for unpublished content
    if (this._published) throw new Error('add operation unavailable for published content');
    // Verify path
    if (path.isAbsolute(filepath)) {
      console.error('absolute paths in content are invalid');
      return false;
    }
    if (filepath.indexOf('\\') !== -1) {
      console.error(`content paths with '\\' are invalid`);
      return false;
    }
    if (filepath === Content.MANIFEST) {
      console.error('to add a manifest.json file use the manifest function');
      return false;
    }

    // Verify content
    if (!['undefined', 'string', 'array', 'object'].includes(typeof content) ||
       ( typeof content === 'object' && ![Uint8Array, Blob, ReadableStream, File, FileReader].includes(content.constructor)) ) {
      console.error('invalid data type for content');
      return false;
    }

    // Push the file to be added to the content DAG
    this._files.push({
      path: filepath,
      content
    });

    return true;
  }

  manifest(mime, index) {
    // Only for unpublished content
    if (this._published) throw new Error('add operation unavailable for published content');
    // Verify mime is valid
    if (!Content.INDEX_MIME_TYPES.filter(mimePlain).includes(mime) && !Content.INDEX_MIME_TYPES.filter(mimeMulti).includes(mime.split('/')[0])) {
      console.error('invalid mime type for manifest');
      return false;
    }
    // Verify index path is valid
    if (!this._files.map(f => f.path).includes(index)) {
      console.error(`missing file '${index}' cannot be manifest index`);
      return false;
    }

    // Create manifest
    const manifest = {
      id: this._id,
      portfolio: this._portfolio,
      version: Content.VERSION,

      mime,   // mime type of index file
      index   // relative path in content directory of content index file
    };

    // Push the manifest to be added to the content DAG
    this._files.push({
      path: Content.MANIFEST,
      content: JSON.stringify(manifest)
    });

    return true;
  }

  async publish(options) {
    // Only for unpublished content
    if (this._published) throw new Error('add operation unavailable for published content');
    // Verify manifest exists
    if (!this._files.map(f => f.path).includes(Content.MANIFEST)) {
      console.error(`missing manifest file`);
      return false;
    }

    // Add to IPFS
    const opts = { ...Content.IPFS_OPTIONS, ...options };
    for await (const file of this.data.ipfs.addAll(this._files, opts)) this._files.push(file);

    // TODO: Get root cid and return it instead
    return this._files;
  }

  async load() {
    // Load content from IPFS
    let data;
    for await (const buf of ipfs.get(cid)) {
      // TODO: continue...
    }
    // Update all internals from content
  }
}

// Mime filters
const mimePlain = (m) => !m.endsWith('/*');
const mimeMulti = (m) => m.endsWith('/*');
