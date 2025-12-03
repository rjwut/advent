const InputCache = require('./input-cache');
const Session = require('./session');
const RateLimiter = require('./rate-limiter');
const ERROR_SUFFIX = 'Run "npm run session {session} {contact}" to create session file.';
const EXPIRED_SUFFIX = ' (Has your session cookie expired? Run "npm run session {sessionId}" to update it.)';

const HOST = 'https://adventofcode.com/';

/**
 * API for accessing the Advent of Code web site. Automatically handles rate limiting, session
 * cookie and user agent headers, and response caching.
 */
class AocApi {
  #cache;
  #session;
  #rateLimiter;

  /**
   * Ensures that the session and rate limiter are initialized.
   */
  async #init() {
    if (!this.#cache) {
      this.#cache = new InputCache();
    }

    if (!this.#session) {
      this.#session = await Session.load();
    }

    if (!this.#rateLimiter) {
      this.#rateLimiter = await RateLimiter.load();
    }
  }

  /**
   * Retrieves the puzzle input for the given year and day.
   *
   * @param {number} year - the puzzle year
   * @param {number} day - the puzzle day
   * @returns {Promise<string>} - the puzzle input
   * @throws {Error} - if the request failed
   */
  async fetchInput(year, day) {
    await this.#init();
    let input = await this.#cache.read(year, day);

    if (input === null) {
      input = await this.#get(`${year}/day/${day}/input`);
      await this.#cache.write(year, day, input);
    }

    return input;
  }

  /**
   * Performs an HTTPS GET against the given path on the Advent of Code host.
   *
   * @param {string} path - the path to GET
   * @returns {string} - the response body
   * @throws {Error} - if the request failed
   */
  async #get(path) {
    const options = this.#session.options;

    if (!options) {
      throw new Error(`Session not set. ${ERROR_SUFFIX}`);
    }

    const url = HOST + path;
    const res = await this.#rateLimiter.fetch(url, options);
    const body = await res.text();

    if (res.ok) {
      return body;
    }

    let error = new Error(`HTTP ${res.status}: ${res.statusText}`);
    error.url = url;
    error.status = res.status;
    error.statusText = res.statusText;
    error.body = body;

    if (res.status === 400) {
      error.message += EXPIRED_SUFFIX;
    }

    throw error;
  }
}

module.exports = AocApi;
