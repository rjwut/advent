const SimpleGrid = require('../simple-grid');

const DEFAULT_STEPS = 100;

/**
 * # [Advent of Code 2015 Day 18](https://adventofcode.com/2015/day/18)
 *
 * [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway's_Game_of_Life)
 * is not hard to implement, but the key thing to remember is to not re-use the
 * grid with each step, since changing the cells will throw off later neighbor
 * counts. Instead, write into a new grid, then when you're done, replace the
 * main grid with the new one.
 * 
 * In part two, the four corner cells are stuck on. So we simply have an
 * additional argument that we can pass in indicating whether the corner cells
 * are stuck or not; if they are, then with each new grid we generate, we make
 * sure to force those cells on before doing anything else.
 *
 * @param {string} input - the puzzle input
 * @param {number} [steps=100] - the number of steps to simulate
 * @returns {Array} - the puzzle answers
 */
module.exports = (input, steps = DEFAULT_STEPS) => {
  const games = [
    new GameOfLife(input),
    new GameOfLife(input, true),
  ];
  games.forEach(grid => {
    grid.step(steps);
  });
  return games.map(grid => grid.lightsOn);
};

/**
 * Conway's Game of Life implementation for Day 18.
 */
class GameOfLife {
  #grid;
  #stuck;

  /**
   * Initializes the grid.
   *
   * @param {string} input - the puzzle input
   * @param {boolean} [stuck] - whether the four corners are stuck on
   */
  constructor(input, stuck) {
    this.#grid = new SimpleGrid({ data: input });
    this.#stuck = stuck;

    if (stuck) {
      this.#forceCornerLightsOn();
    }
  }

  /**
   * Advances the simulation the indicated number of times.
   *
   * @param {number} times - how many steps to advance
   */
  step(times) {
    for (let i = 0; i < times; i++) {
      this.#stepOnce();
    }
  }

  /**
   * @returns {number} - the number of lights currently on
   */
  get lightsOn() {
    return this.#grid.reduce((count, cell) => count + (cell === '#' ? 1 : 0), 0);
  }

  /**
   * Set all four corner lights to on.
   */
  #forceCornerLightsOn() {
    this.#grid.set(0, 0, '#');
    this.#grid.set(this.#grid.rows - 1, 0, '#');
    this.#grid.set(0, this.#grid.cols - 1, '#');
    this.#grid.set(this.#grid.rows - 1, this.#grid.cols - 1, '#');
  }

  /**
   * Perform a single step in the simulation.
   */
  #stepOnce() {
    const nextGrid = new SimpleGrid({
      rows: this.#grid.rows,
      cols: this.#grid.cols,
    });
    this.#grid.forEach((value, r, c) => {
      let adjacent = 0;
      this.#grid.forEachNear(r, c, neighbor => {
        if (neighbor === '#') {
          adjacent++;
        }
      });

      let nextCell;

      if (value === '#') {
        nextCell = adjacent > 1 && adjacent < 4 ? '#' : '.';
      } else {
        nextCell = adjacent === 3 ? '#' : '.';
      }

      nextGrid.set(r, c, nextCell);
    });
    this.#grid = nextGrid;

    if (this.#stuck) {
      this.#forceCornerLightsOn();
    }
}
}
