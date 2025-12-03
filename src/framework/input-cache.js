const fs = require('fs/promises');
const path = require('path');

const INPUT_DIR = path.join(__dirname, '..', '..', 'input');

/**
 * Manages reading and writing puzzle input to the local cache.
 */
class InputCache {
  /**
   * Reads puzzle input from the local cache.
   *
   * @param {number} year - the puzzle year
   * @param {number} day - the puzzle day
   * @returns {Promise<string>} - the puzzle input, or `null` if no input is cached for that day
   * @throws {Error} - if an unexpected error occurs while reading the file
   */
  async read(year, day) {
    try {
      return await fs.readFile(this.#buildPathToFile(year, day), 'utf8');
    } catch (err) {
      if (err.code === 'ENOENT') {
        return null;
      }

      throw err;
    }
  }

  /**
   * Writes the given puzzle input to the local cache.
   *
   * @param {number} year - the puzzle year
   * @param {number} day - the puzzle day
   * @param {String} input - the puzzle input to store
   * @returns {Promise} - fulfills when input is written successfully
   * @throws {Error} - if an error occurs while writing the file
   */
  async write(year, day, input) {
    const file = this.#buildPathToFile(year, day);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, input, 'utf8');
  }

  /**
   * Produces the absolute path to the cache file for the indicated puzzle input. This is simply
   * where the file should be located; it does not verify that the file exists.
   *
   * @param {number} year - the puzzle year
   * @param {number} day - the puzzle day
   * @returns {string} - the absolute path to the cache file
   */
  #buildPathToFile(year, day) {
    day = String(day).padStart(2, '0');
    return path.join(INPUT_DIR, String(year), `${day}.txt`)
  }
}

module.exports = InputCache;
