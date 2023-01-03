const path = require('path');
const fs = require('fs/promises');
const https = require('https');
const AssembunnyVm = require('./assembunny');
const Display = require('./display');

const FILE_PATH = path.join('input', '2016', 'bonus.txt');
const INPUT_URL = 'https://gist.githubusercontent.com/topaz/15518587415ccd0468767aed4192bfd3/raw/c5bfd6a7d40eabe1ae8b9a0fb36a939cb0c5ddf4/bonuschallenge.txt';

/**
 * Solves the _Advent of Code_ 2016
 * [bonus challenge](https://www.reddit.com/r/adventofcode/comments/72aizu/bonus_challenge/).
 * Topaz came out with this challenge about nine months after the 2016 event ended.
 */
const solve = async () => {
  const input = await getInput();
  const vm = new AssembunnyVm();
  vm.load(input);
  vm.run();
  const instructions = vm.dequeueAllOutput()
    .map(ascii => String.fromCharCode(ascii))
    .join('');
  const display = new Display(6, 50);
  display.execute(instructions);
  console.log(display.toString());
  console.log(await display.ocr());
};

/**
 * Retrieves the input. This tries the local cache first, and then GitHub Gist if that fails.
 *
 * @returns {string} - the input
 * @throws {Error} - if the input could not be retrieved
 */
const getInput = async () => {
  try {
    const input = await getInputFromCache();
    return input;
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }

  const input = await getInputFromGitHub();
  return writeInputToCache(input);
};

/**
 * Reads the input from cache.
 *
 * @returns {string} - the input
 * @throws {Error} - if the input could not be read
 */
const getInputFromCache = async () => fs.readFile(FILE_PATH, 'utf8');

/**
 * Writes the input to cache.
 *
 * @param {string} input - the input
 * @returns {Error} if the input could not be written
 */
const writeInputToCache = async input => fs.writeFile(FILE_PATH, input, 'utf8');

/**
 * Retrieves the input from GitHub Gist.
 *
 * @returns {string} - the input
 * @throws {Error} - if the request failed
 */
const getInputFromGitHub = () => new Promise((resolve, reject) => {
  const req = https.get(INPUT_URL, {}, res => {
    if (res.statusCode !== 200) {
      const error = new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`);
      error.statusCode = res.statusCode;
      error.statusMessage = res.statusMessage;
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

solve();
