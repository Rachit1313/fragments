// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');
const md = require('markdown-it')({
  html: true,
});
const sharp = require('sharp');
// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    if (!ownerId) {
      throw new Error('owner id is required.');
    }
    if (!type) {
      throw new Error('type is required.');
    }
    if (size < 0 || typeof size != 'number') {
      throw new Error('size must not be negative and must be a number');
    }
    if (!Fragment.isSupportedType(type)) {
      throw new Error('type not supported');
    }

    this.id = id || randomUUID();
    this.ownerId = ownerId;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
    this.type = type;
    this.size = size;
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    return listFragments(ownerId, expand);
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    const result = await readFragment(ownerId, id);
    if (!result) {
      throw new Error(`Fragment with id: ${id} for user: ${ownerId} not found.`);
    }
    return new Fragment(result);
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static delete(ownerId, id) {
    deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise<void>
   */
  save() {
    this.updated = new Date().toISOString();
    return writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    if (Buffer.isBuffer(data)) {
      this.updated = new Date().toISOString();
      this.size = Buffer.byteLength(data);
      await this.save();
      return writeFragmentData(this.ownerId, this.id, data);
    } else {
      throw new Error(`Data is Empty!`);
    }
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    return this.mimeType == 'text/plain';
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    return ['text/plain'];
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    const { type } = contentType.parse(value);
    const validTypes = [
      `text/plain`,
      `text/markdown`,
      `text/html`,
      `application/json`,
      `image/png`,
      `image/jpeg`,
      `image/webp`,
      `image/gif`,
    ];

    return validTypes.includes(type);
  }

  /**
   * Converts a file extension to a corresponding text MIME type
   * @param {string} extension - The file extension (e.g., '.md', '.txt', '.json')
   * @returns {string} The corresponding text MIME type
   */

  static extConvert(extension) {
    var type = '';
    if (extension == '.md') {
      type = 'markdown';
    } else if (extension == '.txt') {
      type = 'plain';
    } else if (extension == '.jpg') {
      type = 'jpeg';
    } else {
      type = extension;
    }
    return type;
  }

  async textConvert(data, value) {
    var result;
    if (value == 'plain') {
      if (this.type == 'application/json') {
        result = JSON.parse(data);
      } else {
        result = data;
      }
    } else if (value == 'html') {
      if (this.type.endsWith('markdown')) {
        result = md.render(data.toString());
      }
    }
    return result;
  }

  async imageConvert(value) {
    var result, fragmentData;
    fragmentData = await this.getData();

    if (this.type.startsWith('image')) {
      if (value == 'gif') {
        result = sharp(fragmentData).gif();
      } else if (value == 'jpg' || value == 'jpeg') {
        result = sharp(fragmentData).jpeg();
      } else if (value == 'webp') {
        result = sharp(fragmentData).webp();
      } else if (value == 'png') {
        result = sharp(fragmentData).png();
      }
    }
    return result.toBuffer();
  }

  static validateConversion(type) {
    switch (type) {
      case 'text/plain':
        return '.txt';
      case 'text/markdown':
        return ['.md', '.html', '.txt'];
      case 'text/html':
        return ['.html', '.txt'];
      case 'application/json':
        return ['.json', '.txt'];
      case 'image/png':
        return ['.png', '.jpg', '.webp', '.gif'];
      case 'image/jpeg':
        return ['.png', '.jpg', '.webp', '.gif'];
      case 'image/webp':
        return ['.png', '.jpg', '.webp', '.gif'];
      case 'image/gif':
        return ['.png', '.jpg', '.webp', '.gif'];
    }
  }
}
module.exports.Fragment = Fragment;
