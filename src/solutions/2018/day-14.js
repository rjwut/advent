const CircularLinkedList = require('../circular-linked-list');
const { arraysEqual } = require('../util');

const SEED_RECIPES = [ 3, 7 ];

/**
 * # [Advent of Code 2018 Day 14](https://adventofcode.com/2018/day/14)
 *
 * To handle this puzzle, I enhanced my existing `CircularLinkedList` class to
 * support multiple pointers. When you create the list, the original pointer is
 * assigned an ID of `0`; subsequent pointers you create will have IDs of `1`,
 * `2`, etc. The change is backwards compatible with the previous version of
 * the class; the pointer ID can be omitted from all methods that accept it, in
 * which case it will assume pointer `0`.
 *
 * For this problem, pointer `0` will stay on the recipe that was most recently
 * added to the list. Additional pointers are created for each elf to keep
 * track of the recipe they're currently on. While the puzzle has the number of
 * elves and starting recipes fixed at two, I made it so that you can pass in
 * your list of "seed" recipes, and it will assume you have one elf for each.
 * This just made it easier to write without duplicating code.
 *
 * With the list initialized with the seed recipes and the pointers set in
 * their initial positions, the algorithm looks like this:
 *
 * 1. Add 10 to the input value. This is the part one target size.
 * 2. Create an array called `tail` that is a copy of the seed recipes. This
 *    array will be used to detect when we've found the answer to part two.
 * 3. Sum the scores for the elves' current recipes.
 * 4. Break the sum apart into digits and store them in a `newRecipes` array.
 * 5. Insert each new recipe into the list at pointer 0, keeping the pointer at
 *    the end of the list as they are inserted.
 * 6. If the answer to part one hasn't been found yet and the list's size is at
 *    least as great as the part one target size:
 *    1. Create a pointer at the end of the list.
 *    2. Rotate the pointer `target - list.size - 9` steps.
 *    3. Capture the next 10 digits from the pointer's current position. This
 *       is the answer to part one.
 *    4. Delete the pointer.
 * 6. If the answer to part two hasn't been found yet, do the following for
 *    each recipe in `newRecipes`:
 *    1. Push the recipe to the end of `tail`.
 *    2. If `tail` is longer than the input, remove the first recipe from
 *       `tail`.
 *    3. If `tail` doesn't match the input, skip to the next recipe in
 *       `newRecipes`.
 *    4. Compute how many steps backward from the end of the list that the
 *       `tail` sequence starts.
 *    5. Subtract that number from the current list size. This is the answer to
 *       part two.
 * 7. For each elf, rotate that elf's pointer forward in the list by the number
 *    of spaces equal to the score of their current recipe plus `1`.
 * 8. If the answers to both parts haven't been found yet, go bakc to step 3.
 *
 * @param {string} input - the puzzle input
 * @param {number} [part] - which part of the puzzle to solve
 * @returns {Array|string|number} - the puzzle answer(s)
 */
module.exports = (input, part) => {
  const answers = run(SEED_RECIPES, input);
  return part ? answers[part - 1] : answers;
};

/**
 * Finds and returns both answers to the puzzle as described in the module
 * documentation.
 *
 * @param {Array} seed - the starting recipes
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
const run = (seed, input) => {
  input = input.trim();
  let recipes = new CircularLinkedList(seed);

  // Create pointers for each elf
  const pointers = seed.map((_, i) => {
    const pointer = recipes.createPointer();
    recipes.rotate(i, pointer);
    return pointer;
  });
  recipes.rotate(-1); // move main pointer to end of list

  // End criteria
  const part1target = parseInt(input, 10) + 10;
  const part2sequence = [ ...input ].map(Number);
  const tail = [ ...seed ];
  let part1, part2;

  do {
    // Add new recipes
    const scores = pointers.map(pointer => recipes.peek(pointer));
    const sum = scores.reduce((sum, score) => sum + score, 0);
    const newRecipes = [ ...String(sum) ].map(Number);
    newRecipes.forEach(recipe => recipes.insertAfter(recipe));

    // Check for part 1 answer
    if (!part1 && recipes.size >= part1target) {
      // We've generated enough recipes, go back and get them
      const part1pointer = recipes.createPointer();
      recipes.rotate(part1target - recipes.size - 9, part1pointer);
      part1 = recipes.subsequence(10, part1pointer).join('');
      recipes.deletePointer(part1pointer);
    }

    // Check for part 2 answer
    if (!part2) {
      newRecipes.forEach((recipe, i) => {
        tail.push(recipe);
  
        if (tail.length > part2sequence.length) {
          tail.shift();
        }
  
        if (arraysEqual(tail, part2sequence)) {
          const offset = newRecipes.length - i - 1;
          part2 = recipes.size - part2sequence.length - offset;
        }
      });
    }

    // Move elf pointers
    pointers.forEach(pointer => {
      const offset = recipes.peek(pointer) + 1;
      recipes.rotate(offset, pointer);
    });
  } while (!part1 || !part2);

  return [ part1, part2 ];
};
