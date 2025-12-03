const fs = require('fs/promises');
const path = require('path');

const INPUT_DIR = path.join(__dirname, '..', '..', 'input');
const SESSION_FILE = path.join(INPUT_DIR, '.session');
const SESSION_ID_REGEXP = /^[0-9a-f]{128}$/;
const AGENT_NAME = 'github.com/rjwut/advent';
const AGENT_VERSION = '2025-12-02';
const USER_AGENT_PREFIX = `${AGENT_NAME} ${AGENT_VERSION}; contact @ `;

/**
 * Manage session information for requests against the Advent of Code REST API.
 */
class Session {
  /**
   * @returns {Promise<Session>} - a `Session` with any stored information loaded
   */
  static async load() {
    return new Session().#load();
  }

  #sessionId;
  #contact;
  #options;

  /**
   * @returns {string|undefined} - the session ID, if known
   */
  get sessionId() {
    return this.#sessionId;
  }

  /**
   * @returns {string|undefined} - the contact information, if known
   */
  get contact() {
    return this.#contact;
  }

  /**
   * @returns {object|undefined} - the request options including needed headers, if known
   */
  get options() {
    return this.#options;
  }

  /**
   * Sets the session ID and contact information, updating stored session file.
   *
   * @param {string} sessionId - the session ID
   * @param {string} contact - the contact information
   * @returns {Promise<void>} - fulfills when the session file has been written
   */
  async set(sessionId, contact) {
    this.#setSessionId(sessionId);
    this.#setContact(contact);
    this.#buildOptions();
    return this.#writeSessionFile();
  }

  /**
   * Loads the session file and populates this `Session` with its data.
   *
   * @returns {Promise<Session>} - fulfills when the session file has been loaded
   */
  async #load() {
    try {
      const data = await fs.readFile(SESSION_FILE, 'utf8');
      const lines = data
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);
      this.#setSessionId(lines[0]);
      this.#setContact(lines[1]);
      this.#buildOptions();
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }

      // No session file; ignore
    }

    return this;
  }

  /**
   * Validates and sets the session ID, but does not update the session file.
   *
   * @param {string} sessionId - the session ID
   * @throws {Error} - if the session ID is invalid
   */
  #setSessionId(sessionId) {
    if (!SESSION_ID_REGEXP.test(sessionId)) {
      throw new Error('Invalid session ID');
    }

    this.#sessionId = sessionId;
  }

  /**
   * Validates and sets the contact information, but does not update the session file.
   *
   * @param {string} contact - the contact information
   * @throws {Error} - if the contact information is invalid
   */
  #setContact(contact) {
    if (typeof contact !== 'string' || contact.length < 5) {
      throw new Error('Invalid contact information');
    }

    this.#contact = contact;
  }

  /**
   * Builds the HTTP options object to be sent to `fetch()`. This should be invoked any time the
   * information contained in this object changes.
   */
  #buildOptions() {
    this.#options = this.#sessionId && this.#contact ? Object.freeze({
      headers: {
        Cookie: `session=${this.#sessionId}`,
        'User-Agent': `${USER_AGENT_PREFIX}${this.#contact}`,
      },
    }) : null;
  }

  /**
   * Writes session data to the session file. If this class contains no session data, nothing
   * happens.
   *
   * @returns {Promise<void>} - fulfills when the session file has been written, or immediately if
   * there is no session data to write
   */
  async #writeSessionFile() {
    if (this.#options) {
      const data = `${this.#sessionId}\n${this.#contact}\n`;
      return fs.writeFile(SESSION_FILE, data, 'utf8');
    }
  }
}

module.exports = Session;
