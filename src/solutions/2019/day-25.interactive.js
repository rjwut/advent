const fs = require('fs/promises');
const path = require('path');
const readline = require('readline');
const intcode = require('./intcode/ascii');

const PROMPT = '\nCommand?\n';

/**
 * An interactive version of the day 25 puzzle, allowing you to play it
 * yourself. Execute this with `npm run 2019-25`.
 */
const run = async () => {
  const programFile = path.join(__dirname, '..', '..', '..', 'input', '2019', '25.txt');
  const program = await fs.readFile(programFile, 'utf8');
  const droid = intcode(program);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });
  let running;

  /**
   * Queries the user for their command.
   *
   * @returns {Promise} - resolves to the user's command
   */
  const getInput = () => new Promise(resolve => {
    rl.question(`Command? \u001b[32;1m`, resolve);
  });

  /**
   * Writes the output from the Intcode computer to the screen. If we recieved
   * the "Command?" prompt, strip that off so that we can use it as the prompt
   * for `getInput()`.
   *
   * @param {string} output - the output from the Intcode computer
   * @returns {boolean} - whether we can accept another command
   */
  const handleOutput = output => {
    process.stdout.write('\u001b[0m')

    if (!output.endsWith(PROMPT)) {
      process.stdout.write(output);
      return false;
    }

    output = output.substring(0, output.length - PROMPT.length + 1);
    process.stdout.write(output);
    return true;
  };

  running = handleOutput(droid.run());

  while (running) {
    const input = await getInput();
    running = handleOutput(droid.send(input));
  }

  rl.close();
};

run();
