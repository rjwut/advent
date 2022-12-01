const fs = require('fs').promises;
const path = require('path');
const https = require('https');

const INPUT_DIR = path.join(__dirname, '..', '..', 'input');
const SESSION_ID_FILE = path.join(INPUT_DIR, '.session');
const RATE_LIMIT_MS = 10_000;
const USER_AGENT = 'github.com/rjwut/advent; submit issues at https://github.com/rjwut/advent/issues/new';

let sessionId;
let lastRequestTime;

/**
 * Retrieves the puzzle input for the given day. This is read from the local
 * cache first, and if that fails, from the Advent of Code web site. The latter
 * requires that `input/.session` exist and contain the value of the session
 * cookie. Requests to the Advent of Code site are rate limited so that no more
 * than one request is made within 10 seconds.
 *
 * @param {number} year - the puzzle year
 * @param {number} day - the puzzle day
 * @returns {string} - the puzzle input
 * @throws {Error} - if puzzle input could not be retrieved
 */
module.exports = async (year, day) => {
  let input = await readFromCache(year, day);

  if (!input) {
    await rateLimit();
    input = await readFromSite(year, day);
    await writeToCache(year, day, input);
  }

  return input;
};

/**
 * Retrieves the input for the given day from the local cache.
 *
 * @param {number} year - the puzzle year
 * @param {number} day - the puzzle day
 * @returns {string|null} - the cached puzzle input, or `null` on cache miss
 */
const readFromCache = async (year, day) => {
  try {
    return await fs.readFile(pathToFile(year, day), 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      return null;
    }

    throw err;
  }
};

/**
 * Writes the given puzzle input to the local cache.
 *
 * @param {number} year - the puzzle year
 * @param {number} day - the puzzle day
 * @param {string} input - the puzzle input
 */
const writeToCache = async (year, day, input) => {
  const file = pathToFile(year, day);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, input, 'utf8');
};

/**
 * Retrieves the input for the given day from the Advent of Code web site. This
 * requires that `input/.session` exist and contain the value of the session
 * cookie. Note that this will be rate limited; if it's been less than 10
 * seconds since the last request, the request will be delayed until that time.
 *
 * @param {number} year - the puzzle year
 * @param {number} day - the puzzle day
 * @returns {string} - the puzzle input
 * @throws {Error} - if the `input/.session` file does not exist
 * @throws {Error} - if the session cookie is invalid
 * @throws {Error} - if could not communicate with the AoC web site
 */
const readFromSite = async (year, day) => {
  if (!sessionId) {
    try {
      sessionId = (await fs.readFile(SESSION_ID_FILE, 'utf8')).trim();
    } catch (err) {
      if (err.code === 'ENOENT') {
        throw new Error('No session cookie found. Run "npm run session {cookie}" to set it.')
      }
    }
  }

  return await get(`https://adventofcode.com/${year}/day/${day}/input`);
};

/**
 * Performs an HTTPS GET against the given URL. Expects `sessionId` to be
 * populated.
 *
 * @param {string} url - the URL to GET
 * @returns {string} - the response body
 * @throws {Error} - if the request failed
 */
const get = url => new Promise((resolve, reject) => {
  const options = {
    headers: {
      Cookie: `session=${sessionId}`,
      'User-Agent': USER_AGENT,
    },
  };
  const req = https.get(url, options, res => {
    if (res.statusCode !== 200) {
      const error = new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`);
      error.statusCode = res.statusCode;
      error.statusMessage = res.statusMessage;

      if (res.statusCode === 400) {
        error.statusMessage += ' (Has your session cookie expired? Run "npm run session {cookie}" to update it.)'
      }

      reject(error);
      return;
    }

    let data = '';
    res.on('data', chunk => {
      data += chunk;
    });
    res.on('end', () => {
      resolve(data);
    });
  });
  req.on('error', reject);
  req.end();
});

/**
 * Returns the path to the input cache file for the given puzzle.
 *
 * @param {number} year - the puzzle year
 * @param {number} day - the puzzle day
 * @returns {string} - the cache file path
 */
const pathToFile = (year, day) => {
  day = String(day).padStart(2, '0')
  return path.join(INPUT_DIR, String(year), `${day}.txt`)
};

/**
 * Delays until the next request can be made without violating the rate limit.
 */
const rateLimit = () => new Promise(resolve => {
  const ready = () => {
    lastRequestTime = Date.now();
    resolve();
  }

  const sinceLastRequest = Date.now() - (lastRequestTime || 0);

  if (sinceLastRequest < RATE_LIMIT_MS) {
    setTimeout(ready, RATE_LIMIT_MS - sinceLastRequest);
  } else {
    ready();
  }
});
