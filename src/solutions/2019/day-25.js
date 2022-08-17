const intcode = require('./intcode-ascii');
const makeDroid = require('./day-25.droid');

/**
 * # [Advent of Code 2019 Day 25](https://adventofcode.com/2019/day/25)
 *
 * Holy moly! A full blown interactive fiction game in Intcode! 🤯
 *
 * It's entirely possible to "cheat" by inspecting the Intcode program for the
 * answer instead of actually running it, but that doesn't seem as fun, so my
 * solution actually runs the program and "wins" legitimately. It does so in
 * three phases:
 * 
 * 1. **Explore**: Move around the map finding room and items. This phase ends
 *    when all eight safe items have been collected and the "Security
 *    Checkpoint" room has been discovered.
 * 2. **Go to Security**: Compute the path to the "Security Checkpoint" room
 *    and follow it. This phase ends when the droid enters the "Security
 *    Checkpoint" room.
 * 3. **Try Items**: Try different combinations of items to try to get into the
 *    cockpit. This phase ends when the it succeeds and gets the code from
 *    Santa, which is our puzzle answer.
 *
 * ## Parsing
 *
 * I use my `intcode-ascii` module to translate commands to ASCII codes and
 * send them to the Intcode program, and then convert the output ASCII codes
 * back to text. I then have to parse the text to extract the information I
 * need in order to appropriately command the droid. The **Output Syntax**
 * section below details the format of the output after each type of command.
 * The output is terminated with `\nCommand?\n` if the droid is able to accept
 * another command.
 *
 * I use regular expressions to recognize each section. There are other
 * sections besides these, but I won't encounter them because they all involve
 * doing something I shouldn't. The recognized sections are converted to
 * events by the `day-25.parser` module. My code can then listen for these
 * events and react accordingly.
 *
 * | Regular Expression        | Description           | Parameter                  |
 * | ------------------------- | --------------------- | -------------------------- |
 * | `/typing (\d+) on/`       | Got code              | code                       |
 * | `/^You drop the (.+)\.$/` | Item dropped          | item name                  |
 * | `/^== (.+) ==/`           | Entered a room        | room name                  |
 * | `/^Doors.+:\n(.+)$/`      | Exits                 | list of directions         |
 * | `/^Items h.+:\n(.+)$/`    | Items present         | list of items              |
 * | `/\?$/`                   | Prompt for command    |                            |
 * | `/this ship are (\S+)/`   | Rejected by security  | `'lighter'` or `'heavier'` |
 * | `/^You take the (.+)\.$/` | Item taken            | item name                  |
 *
 * ## Exploration
 *
 * Layouts can vary based on your input. The distances between rooms are not
 * necessarily equal or straight lines, so you can't lay out the rooms on a
 * grid. Instead, the `day-25.map` module tracks the rooms in a graph. As I
 * enter rooms, I'll pick up any safe objects I find, and always enter a door
 * I've never explored before. If all the doors in the current room are
 * explored, I'll go to the closest room with an unexplored door.
 * It's particularly important to identify the "Security Checkpoint" room. This
 * is always adjacent to the "Pressure-Sensitive Floor" room, which is my final
 * goal, but I'll be sent back to the "Security Checkpoint" room if I take the
 * wrong items in.
 *
 * ## Inventory
 *
 * There are 13 items in the ship. Most of them are safe to pick up, but some
 * will prevent you from winning. The locations of the items and which safe
 * items are present on the ship can vary based on your input, but from what I
 * can tell, the unsafe items are the same for everyone:
 *
 * - `escape pod`: You're ejected from Santa's ship.
 * - `giant electromagnet`: You can't move.
 * - `infinite loop`: The Intcode program goes into an infinite loop.
 * - `molten lava`: You melt.
 * - `photons`: The lights go out and you're eaten by a grue.
 *
 * To pass security, you must adjust the droid's weight by holding a specific
 * combination of items (out of a possible 256). However, you aren't told what
 * the target weight is, nor the weights of the individual items. You are only
 * told whether the droid is too light or too heavy. You can attempt to deduce
 * which items are lighter or heavier than others, but it's easy enough to just
 * iterate through all the possible combinations. This can be done by simply
 * assigning each item a bit in an 8-bit value, and iterating through all
 * values from `0` to `255`. If a bit is `1`, then the item is held; otherwise,
 * it's left in the "Security Checkpoint" room. I then compare the desired
 * combination against my current inventory, and take and drop items as
 * necessary. I continue trying to enter with different combinations of items
 * until I get in.
 *
 * TODO Consider changing this to use
 * [Gray code](https://en.wikipedia.org/wiki/Gray_code).
 *
 * Tracking inventory, determining whether something is safe to take, and
 * determining what items to pick up or drop for a particular combination of
 * items are all handled by the `day-25.inventory` module.
 *
 * The intelligence that knows how to combine these abilities in order to reach
 * Santa is containined in the `day-25.droid` module.
 *
 * This module is the main entry point for the solution. It's responsible for
 * reading output from the Intcode program, passing it to the droid, receiving
 * the droid's output (a command), and feeding that back into the program.
 * Eventually the program won't supply a command, at which point we should have
 * the code.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const interpreter = intcode(input);
  const droid = makeDroid(input);
  let output = interpreter.run();

  do {
    const command = droid.consume(output);

    if (!command) {
      break;
    }

    output = interpreter.send(command);
  } while (true);

  return [ droid.getCode(), undefined ];
};
