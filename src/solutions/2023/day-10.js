const SimpleGrid = require('../simple-grid');

const Direction = {
  NORTH: { r: -1, c: 0 },
  SOUTH: { r: 1, c: 0 },
  WEST: { r: 0, c: -1 },
  EAST: { r: 0, c: 1 },
};
Direction.NORTH.opposite = Direction.SOUTH;
Direction.SOUTH.opposite = Direction.NORTH;
Direction.WEST.opposite = Direction.EAST;
Direction.EAST.opposite = Direction.WEST;
const Directions = [ Direction.NORTH, Direction.SOUTH, Direction.WEST, Direction.EAST ];

const Pipes = {
  '|': [ Direction.NORTH, Direction.SOUTH ],
  '-': [ Direction.WEST, Direction.EAST ],
  'L': [ Direction.NORTH, Direction.EAST ],
  'J': [ Direction.NORTH, Direction.WEST ],
  '7': [ Direction.SOUTH, Direction.WEST ],
  'F': [ Direction.SOUTH, Direction.EAST ],
};

/**
 * # [Advent of Code 2023 Day 10](https://adventofcode.com/2023/day/10)
 *
 * I leverage my existing `SimpleGrid` class to handle the two-dimensional grid parsing and
 * management.
 *
 * ## The Starting Pipe
 *
 * Once we've located the starting pipe (marked with `S`), we have to determine the shape of the
 * pipe that goes there. Each of the six pipe shapes have connections in two directions, and the
 * `Pipes` object I created catalogs this, with a property for each pipe shape which stores the
 * directions of its two connections in an array under the pipe shape as the key.
 *
 * For the cells in each of the four directions from the starting cell, I check to see if the pipe
 * shape located there has a connection in the opposite direction. If so, those two cells are
 * connected. For each cell where a connection exists, I store the direction of that cell in an
 * array. After checking all four adjacent cells, there will be two directions in that array. I can
 * then do a reverse lookup on the `Pipes` object to find the pipe shape that matches those two
 * directions. This is the shape of the starting pipe.
 *
 * ## Finding the Furthest Cell in the Pipeline
 *
 * This is done with a simple breadth-first search. An entry is added to the queue containing the
 * start cell and a distance of `0`. I also created a variable named `last` which will always store
 * the queue entry for the most recently visited cell. Then as long as the queue isn't empty, I do
 * the following:
 *
 * 1. Take the next entry from the queue and retrieve the corresponding cell.
 * 2. If the cell contains an object instead of a character, skip it. (It's already been visited).
 * 3. Otherwise, convert the character to an object containing that character and store it back in
 *    the grid. (This is done so we can identify the cell as being part of the pipeline and can
 *    still identify its shape later. This will be important for part two.)
 * 4. Store this queue entry in the `last` variable.
 * 5. Increment the distance by one.
 * 6. Look up the directions of the current pipe shape's connections.
 * 7. For each of those two directions, add a new queue entry for the adjacent cell in that
 *    direction.
 *
 * When the queue empties, `last` will contain the queue entry for the furthest cell in the
 * pipeline; the distance recorded in that entry is the answer to part one.
 *
 * ## Counting Enclosed Cells
 *
 * First we have to figure out how to determine which cells are enclosed. A flood fill won't work,
 * because the puzzle description explicitly calls out that two adjacent parallel pipes still have
 * space between them; a flood fill won't go through that gap. Instead, we can use
 * [ray casting](https://en.wikipedia.org/wiki/Point_in_polygon#Ray_casting_algorithm). Suppose we
 * have this pipeline:
 *
 * ```txt
 *     ...............
 *     ..F---------7..
 * --> ..|..F----7.|..
 *     ..|..|....|.|..
 *     ..|..|....|.|..
 *     ..|..|....|.|..
 *     ..L--J....L-J..
 *     ...............
 * ```
 *
 * We can use the ray casting algorithm with each row in the grid to determine how many enclosed
 * cells are in that row. Let's use the row marked with an arrow as an example, casting a ray from
 * west to east along that row.
 *
 * The ray casting algorithm by assuming that the ray starts outside the enclosed area. As we move
 * from west to east, every time it crosses completely over the pipeline, we move from being
 * outside the loop to inside it, or vice versa. In the example above, the first pipe shape we
 * encounter is `|`. Upon passing this cell, we are now inside the pipeline loop. The next two
 * cells are not part of the pipeline, so they are counted as inside.
 *
 * The next cell contains `F`. This is part of the pipeline, but upon passing this cell, we haven't
 * really crossed over the pipeline again; we're just following it as it extends to the east. We
 * continue following the `-` cells until we encounter `7`. Here, the pipeline bends to the south,
 * meaning that for this stretch of pipeline, we didn't cross over it, so we are still inside the
 * loop. We encounter one more cell that is not part of the pipeline, so it's counted as inside.
 * Finally, we encounter `|` again, crossing over the pipeline, so we are now outside the loop. We
 * then exit the grid on the east. That gives us a total of three interior cells on that row.
 *
 * If instead of `F----7` we had encountered `F----J`, we would have crossed over the pipeline,
 * since it would have bent to the north instead of the south. The same is true for the other
 * direction: `L----7` crosses the pipeline, but `L----J` does not. We can generalize this as
 * follows: During the ray casting, we must encounter a connection to the north and to the south to
 * cross the pipeline; encountering a connection in the same direction twice in a row doesn't cross
 * it.
 *
 * We can track this with two booleans, one for north and one for south. We start out each row with
 * both set to `false`. When we encounter a connection to the north, we flip the north boolean, and
 * when we encounter a connection to the south, we flip the south boolean. Whenever we encounter a
 * cell which is not part of the pipeline loop, we check the status of the two booleans: if they're
 * both `true`, we are inside the loop and we increment a counter. Otherwise, we're outside it and
 * we leave the counter as is.
 *
 * After casting a ray for each row of the grid, the counter contains the answer to part two.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const grid = new PipeGrid(input);
  return [ grid.seekFurthestDistance(), grid.countEnclosed() ];
};

/**
 * Represents the grid of pipe shapes.
 */
class PipeGrid extends SimpleGrid {
  #start;

  /**
   * Parses the input into our grid.
   *
   * @param {string} input - the puzzle input
   */
  constructor(input) {
    super({ data: input });
    this.#detectStartPipe();
  }

  /**
   * Determines which cell is the furthest from the starting cell following the pipeline loop, and
   * returns the distance to that cell.
   *
   * @returns {number} - the distance to the furthest cell
   */
  seekFurthestDistance() {
    const queue = [ { coords: this.#start, distance: 0 } ];
    let last;

    while (queue.length) {
      const entry = queue.shift();
      let { coords, distance } = entry;
      const pipe = this.get(coords.r, coords.c);

      if (typeof pipe === 'object') {
        continue;
      }

      this.set(coords.r, coords.c, { pipe });
      last = entry;
      distance++;
      Pipes[pipe].forEach(direction => {
        const newCoords = { r: coords.r + direction.r, c: coords.c + direction.c };
        queue.push({
          coords: newCoords,
          distance,
        });
      });
    }

    return last.distance;
  }

  /**
   * Counts how many cells are within the pipeline loop.
   *
   * @returns {number} - the number of enclosed cells
   */
  countEnclosed() {
    let enclosed = 0;

    for (let r = 0; r < this.rows; r++) {
      let inside = { north: false, south: false };

      for (let c = 0; c < this.cols; c++) {
        const cell = this.get(r, c);

        if (typeof cell === 'object') {
          const directions = Pipes[cell.pipe];

          if (directions.includes(Direction.NORTH)) {
            inside.north = !inside.north;
          }

          if (directions.includes(Direction.SOUTH)) {
            inside.south = !inside.south;
          }
        } else if (inside.north && inside.south) {
          enclosed++;
        }
      }
    }

    return enclosed;
  }

  /**
   * Locates the starting pipe and determines its shape.
   */
  #detectStartPipe() {
    let { r, c } = this.coordsOf('S');
    const connections = Directions.reduce((connections, direction) => {
      const adjacent = this.get(r + direction.r, c + direction.c);
      const adjacentDirections = Pipes[adjacent];

      if (!adjacentDirections)  {
        return connections;
      }

      if (adjacentDirections.includes(direction.opposite)) {
        connections.push(direction);
      }

      return connections;
    }, []);
    const [ pipe ] = Object.entries(Pipes).find(([ , directions ]) => {
      return directions.every(
        direction => connections.includes(direction)
      );
    });
    this.set(r, c, pipe);
    this.#start = { r, c };
  }
}