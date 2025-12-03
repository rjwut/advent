const fs = require('fs/promises');
const path = require('path');

const INPUT_DIR = path.join(__dirname, '..', '..', 'input');
const RATE_LIMIT_FILE = path.join(INPUT_DIR, '.last-request-time');
const RATE_LIMIT_MS = 300_000; // 5 minutes

/**
 * This class is responsible for controlling the rate of requests to respect the Advent of Code
 * automation policy. Requests against the Advent of Code REST API should be made via the `fetch()`
 * method on this class, which will automatically throttle requests as needed.
 */
class RateLimiter {
  /**
   * @returns {Promise<RateLimiter>} - resolves to a new `RateLimiter` instance
   */
  static async load() {
    return new RateLimiter().#load();
  }

  #lastRequestTime;

  constructor() {
    this.#lastRequestTime = 0;
  }

  /**
   * A drop-in replacement for the global `fetch()` function that respects the rate limit. If
   * invoked too soon after the previous request, this method will wait for the rate limit to expire
   * before making the request.
   *
   * @param {*} resource - the resource to fetch
   * @param {RequestInit} [options] - fetch options
   * @returns {Promise<Response>} - the HTTP response
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch
   */
  async fetch(resource, options) {
    await this.#waitForRateLimit();
    const res = await fetch(resource, options);
    this.#lastRequestTime = Date.now();
    await this.#save();
    return res;
  }

  /**
   * Loads the last request time from the rate limit file, if it exists.
   *
   * @returns {Promise<RateLimiter>} - fulfills with this `RateLimiter` instance when the rate limit
   * file has been loaded
   */
  async #load() {
    try {
      this.#lastRequestTime = parseInt(await fs.readFile(RATE_LIMIT_FILE, 'utf8'), 10);
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }

      // No rate limit file; ignore
    }

    return this;
  }

  /**
   * Stores the last request time to the rate limit file.
   *
   * @returns {Promise<void>} - fulfills when the rate limit file has been saved
   */
  async #save() {
    try {
      await fs.writeFile(RATE_LIMIT_FILE, String(this.#lastRequestTime), 'utf8');
    } catch (err) {
      console.warn('Error saving rate limit file', err);
    }
  }

  /**
   * If the rate limit has not yet expired, waits until it does.
   *
   * @returns {Promise<void>} - fulfills when the rate limit has expired
   */
  async #waitForRateLimit() {
    return new Promise(resolve => {
      const sinceLastRequest = Date.now() - this.#lastRequestTime;

      if (sinceLastRequest < RATE_LIMIT_MS) {
        setTimeout(resolve, RATE_LIMIT_MS - sinceLastRequest);
      } else {
        resolve();
      }
    });
  }
}

module.exports = RateLimiter;
