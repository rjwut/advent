const { split } = require('../util');
const BooleanInfiniteGrid = require('../boolean-infinite-grid')

const PART_DIMENSIONS = [ 3, 4 ];
const CYCLE_COUNT = 6;

/**
 * # [Advent of Code 2020 Day 17](https://adventofcode.com/2020/day/17)
 *
 * ## Dealing With More Than Two Dimensions
 *
 * Part one of this day's puzzle shows us that we have another
 * [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life)
 * simulation, but the twist this time is that it's in three dimensions. This
 * presents a problem when attempting to debug it: it's hard to print out 3D
 * data, and therefore it's hard to reason about in order to find out what's
 * wrong.
 *
 * The starting state for the simulation is only a 2D slice, which gives us a
 * hint about how we can go about this: write a solution that works for any
 * arbitrary number of dimensions, then test it out in 2D. We'll make it so
 * that we can print out the state of the simulation for the slice along the
 * X/Y origin plane (which for 2D will be the entire simulation), and we can
 * use this to ensure that our simulation is working correctly. 
 *
 * It turns out that the example data used in the puzzle is the classic
 * Conway's Game of Life "glider"; when run in a 2D simulation, it will
 * gradually move "southeast" and always have five active cells, so that's what
 * we'll watch for. Once we've got it working in 2D, we can test the example in
 * 3D and ensure that we get the right answer. As it happens that part two asks
 * us to run the simuluation again in 4D, so making our solution work for any
 * number of dimensions makes this super easy.
 *
 * My `BooleanInfiniteGrid` class will be perfect for this, since it makes it
 * easy to store and iterate `n`-dimensional data in a memory-efficient way. I
 * also modified it to support rendering a 2D slice of the simulation.
 *
 * ## Implementation
 *
 * We'll treat the upper-left cell of the input as the origin. (In reality, the
 * origin can be anywhere, but it's a convenient place to start.) We need to
 * be careful when we're executing a step of the simulation to ensure that we
 * compute what the next step will look like _before_ we actually apply the
 * changes; otherwise, the simulation will be incorrect because we'll be
 * looking at data from both the current and next step when counting neighbors.
 * To do this, we'll create one `BooleanInfiniteGrid` object called `current`
 * and another called `next`. We'll also create a coordinate array of size `n`
 * and set all elements to `0`. Then we iterate the characters in the input,
 * incrementing the X coordinate as we go, and resetting it to `0` and
 * incrementing the Y coordinate when we reach the end of a line. (All other
 * coordinates remain at `0`, since they're outside the X/Y origin plane used
 * for the input.) Whenever we encounter a `#` in the input, we set that cell
 * in `BooleanInfiniteGrid` to `true`.
 *
 * We need to be able to count the number of active cells adjacent to a given
 * cell. We can just use the `forEachNear()` method of `BooleanInfiniteGrid`,
 * setting the `distance` parameter to `1`, and increment a counter for each
 * iterated active cell. We'll wrap this in a function called
 * `countAdjacent()`.
 *
 * Now we're ready to write the `step()` function, which will perform a single
 * pass for the simulation. We iterate the simulation grid with `forEach()`,
 * specifying a `margin` of `1` so that we can account for active cells
 * spreading over time. For each cell, we use `countAdjacent()` and evaluate
 * the results against the rules, and if they call for the cell's state to be
 * changed, call `next.put()` to set the cell state. After all cells are
 * iterated, the grid in `next` becomes the new `current` grid, and the `next`
 * grid gets a new copy of the grid.
 *
 * The answer to each part is the number of active cells in the simulation
 * after it has been run. This is simply the value of `current.size`. We can
 * now wrap everything in an API that can be used to run the simulation: it
 * will have `step()` and `countActive()` methods, along with a `toString()`
 * method for printing out our 2D slice of the simulation (described in the
 * next section).
 *
 * After all that, getting the answer for each step of the puzzle is a cake
 * walk: after `parse()`ing the input, simply call `step()` six times, then
 * call `countActive()`; the return value is the answer.
 *
 * ## Testing and Debugging
 *
 * With such a complex solution, we want to be able to easily visualize the
 * state of the simulation for inspection so that we can verify that it's
 * correct. As mentioned previously, running the simulation in 2D makes this
 * easier, but we need to add a `toString()` method to our interface object to
 * facilitate printing out the state. Once `toString()` is written, you can
 * just call it after each `step()` to ensure that the simulation state is as
 * you expect.
 *
 * We're going to want only the cells that fall on the X/Y origin plane. For a
 * 2D simulation, that's all the cells, but for higher-order ones, most cells
 * are omitted. We can handle this easily by creating a coordinate array which
 * is initially populated with all `0`s, and then iterate the X-Y coordinate
 * plane within the bounds of the grid, setting elements `0` and `1` to those
 * coordinates and leaving the rest at `0`.
 *
 * My test code runs the 2D case and ensures that the result is `5` as
 * expected, before running the 3D and 4D cases and comparing the answers to
 * those provided in the puzzle.
 *
 * @param {string} input - the puzzle input
 * @param {number} [dimensions] - the number of dimensions
 * @returns {array|number} - the puzzle answer(s)
 */
module.exports = (input, dimensions) => {
  if (typeof dimensions === 'number') {
    return runForDimensions(input, dimensions);
  }

  return PART_DIMENSIONS.map(n => runForDimensions(input, n));
};

/**
 * Runs the simulation for the given number of dimensions.
 *
 * @param {string} input - the puzzle input 
 * @param {number} n - the number of dimensions
 * @returns {number} - the number of active cells after six cycles
 */
const runForDimensions = (input, n) => {
  const pocket = parse(input, n);

  for (let i = 0; i < CYCLE_COUNT; i++) {
    pocket.step();
  }

  return pocket.countActive();
};

/**
 * Builds the simulation and populates it with the initial state as specified
 * in the puzzle input. The simulation object has the following methods:
 * - `step()`: Advances the simulation one cycle.
 * - `countActive()`: Returns the number of active cells in the simulation.
 * - `toString()`: Returns a string representation of the x-y origin plane of
 *   the simulation.
 *
 * @param {string} input - the puzzle input
 * @param {number} n - the number of dimensions 
 * @returns {Object} - the simulation object
 */
const parse = (input, n) => {
  let current = new BooleanInfiniteGrid();
  let next;
  const origin = new Array(n);
  origin.fill(0);

  /**
   * Returns the number of active cells adjacent to the given coordinates.
   *
   * @param {Array} coords - the coordinates
   */
  const countAdjacent = coords => {
    let count = 0;
    current.forEachNear(coords, (_nearCoords, value) => {
      if (value) {
        count += value ? 1 : 0;
      }
    }, { omitSelf: true });
    return count;
  };

  // Initialize the simulation with its starting state.
  const initCoords = new Array(n);
  initCoords.fill(0);
  split(input).forEach((line, r) => {
    [ ...line ].forEach((chr, c) => {
      if (chr === '#') {
        initCoords[0] = c;
        initCoords[1] = r;
        current.put(initCoords, true);
      }
    });
  });
  next = new BooleanInfiniteGrid(current);

  // Build the simulation interface object.
  const api = {
    /**
     * Advances the simluation one cycle.
     */
    step: () => {
      current.forEach((coords, active) => {
        const adjacent = countAdjacent(coords);
    
        if (active && (adjacent < 2 || adjacent > 3)) {
          next.put(coords, false);
        } else if (!active && adjacent === 3) {
          next.put(coords, true);
        }
      }, { margin: 1 });
      current = next;
      next = new BooleanInfiniteGrid(next);
    },

    /**
     * Returns the number of active cells in the simulation.
     * @returns {number}
     */
    countActive: () => current.size,

    /**
     * Returns a string representation of the x-y origin plane of the
     * simulation.
     * @returns {string}
     */
    toString: () => {
      const bounds = current.getBounds();
      const rest = new Array(n - 2).fill(0);
      const lines = [];
      let line = [ ' ' ];

      for (let x = bounds[0].min; x <= bounds[0].max; x++) {
        line.push(Math.abs(x % 10));
      }

      lines.push(line.join(''));

      for (let y = bounds[1].min; y <= bounds[1].max; y++) {
        line = [ Math.abs(y % 10) ];

        for (let x = bounds[0].min; x <= bounds[0].max; x++) {
          const coords = [ x, y, ...rest ];
          line.push(current.get(coords) ? '#' : '.');
        }

        lines.push(line.join(''));
      }

      return lines.join('\n');
    }
  };
  return api;
};
