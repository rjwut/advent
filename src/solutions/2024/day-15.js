const Warehouse1 = require('./day-15.warehouse1');
const Warehouse2 = require('./day-15.warehouse2');

/**
 * # [Advent of Code 2024 Day 15](https://adventofcode.com/2024/day/15)
 *
 * Since the logic differed significantly, I created a separate class for each warehouse, each
 * extending my `SimpleGrid` class. Each class has a constructor that parses the input, a `run()`
 * method that executes all the moves, and a `gpsSum` read-only property that produces the answer.
 *
 * ## Part 1
 *
 * Parsing was straightforward: split the input on the blank line, then read the top part into the
 * `SimpleGrid` and convert the bottom part into an array of row and column deltas. The `run()`
 * logic is also simple. Terminology:
 *
 * - source cell: The cell the robot currently occupies
 * - target cell: The cell the robot wishes to occupy
 * - focus cell: The cell we are currently examining
 *
 * 1. Set the focus cell to be the target cell.
 * 2. Examine the focus cell whether or not we can move:
 *    - If it's a wall, we can't move; stop.
 *    - If it's empty, we can move.
 *    - If it's a crate, set the focus cell to be the next cell over in the direction of the move,
 *      then repeat step 2.
 * 3. If we can move, update the grid:
 *    1. If we pushed a crate, update the focus cell to be a crate.
 *    2. Update the target cell to contain the robot.
 *    3. Update the source cell to be empty.
 *
 * Computing the GPS sum was simply a matter of finding all cells containing a crate, multiplying
 * each row coordinate by 100, adding that to the column coordinate, and summing the results for all
 * crates.
 *
 * ## Part 2
 *
 * Widening the input is simple: just make the following string replacements:
 *
 * - `'.'` → `'..'`
 * - `'#'` → `'##'`
 * - `'O'` → `'[]'`
 * - `'@'` → `'@.'`
 *
 * The movement logic is complicated by the fact that pushing a crate "up" or "down" on the grid
 * could cause _two_ additional crates to move, and those may push additional crates, and so on. I
 * handled this by creating a `#tryMoveCrate()` method that tests whether the crate at the given
 * coordinates can be moved. The method also accepts a `Set` of coordinates of crates to be moved;
 * if it is determined that the crate can be moved, its coordinates are added to this `Set`, to be
 * moved later. If the move is determined to be possible, the method returns this `Set`; otherwise,
 * it returns `null`.
 *
 * Horizontal and vertical moves are handled separately. Horizontal moves are similar to how they
 * were done in part one, except that we can't do the trick of just updating the start and end of a
 * line of crates and pretending like we moved them all, since now crates are composed of two
 * distinct characters. So we instead just put the crate positions in the `Set` and move them all at
 * the end if the move is determined to be possible.
 *
 * For vertical moves, we have to consider two cells instead of one. If either cell contains a wall,
 * the move is not possible. If they're both empty, the move is possible. If one or both cells
 * contain (half of) a crate, we recurse to test that crate. At the end, if the move is possible,
 * the `Set` contains the positions of all crates to be moved. The `Set` has been populated with the
 * furthest crates from the robot's position first, so we can just iterate over it, erase the crate
 * at that position, and write it at its new position.
 *
 * There are two reasons we store all the crate positions in a `Set` first and then move them all at
 * the end:
 *
 * - Either all the crates we test move, or none of them do. If we move a crate before all have been
 *   tested, we may discover later the move is blocked and have crates moved that shouldn't.
 * - It is possible for two crates to push one crate, like this scenario when the robot moves down:
 *
 *   ```txt
 *   ##########
 *   ##  @   ##
 *   ##  []  ##
 *   ## [][] ##
 *   ##  []  ##
 *   ##      ##
 *   ##########
 *   ```
 *
 *   If we didn't store the crates in a `Set`, we might attempt to move the bottommost crate twice,
 *   which could corrupt our grid.
 *
 * The GPS sum is computed the same way as in part one, but now we have to find all cells containing
 * `[` instead of `O`.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  return [ Warehouse1, Warehouse2 ].map(Warehouse => {
    const warehouse = new Warehouse(input);
    warehouse.run();
    return warehouse.gpsSum;
  });
};
