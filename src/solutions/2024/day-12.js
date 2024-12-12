const SimpleGrid = require('../simple-grid');

const DIRECTIONS = [
  [ -1,  0 ],
  [  0,  1 ],
  [  1,  0 ],
  [  0, -1 ],
];

/**
 * # [Advent of Code 2024 Day 12](https://adventofcode.com/2024/day/12)
 *
 * Discovering regions is done with a [flood fill
 * algorithm](https://en.wikipedia.org/wiki/Flood_fill). During the flood fill, when looking for
 * adjacent plots to add to the region, if we find that it's not in the region (out of bounds or
 * containing a different plant), we add a fence on the border of that plot in that direction. Once
 * all plots in the region are discovered, the number of fences created is the perimeter. To compute
 * the number of sides, we iterate the fences, and for each one that hasn't already been marked as
 * part of a side, we search in both directions along the fence's orientation to see if the fence
 * continues in the direction, marking each fence we find as part of the side. Note that fences must
 * be contiguous to be part of the same side. Once we run out of fence in both directions, we've
 * discovered all fences belonging to that side. Once all fences have been iterated, the number of
 * sides is determined.
 *
 * 1. Parse the input into a grid, where each cell represents a plot and starts out containing a
 *    character representing the plant found there.
 * 2. Create a `regions` array.
 * 3. Iterate the plots in the grid:
 *    1. If the plot contains just a character, we haven't assigned it to a region yet, so discover
 *       the region it belongs to:
 *       1. Create an object to represent this region. Set the region's plant to the plant in this
 *          plot, and start the region's area at `0`.
 *       2. Create a `fences` array. The objects in this array will represent a border between a
 *          plot in this region and a plot in another region or the edge of the grid.
 *       3. Create a stack of plots to visit. Put the location of the plot in a stack.
 *       4. Create a `Set` of plots called `seen` (plots we've seen adjacent to plots in the region
 *          but may not have visited yet). Mark this location as seen by adding it to the `seen`
 *          `Set`.
 *       5. While the stack is not empty:
 *          1. Pop the next plot from the stack.
 *          2. Replace the plant character in the grid for the plot with the region object.
 *          3. Increment the region's area.
 *          4. Check the four directions from this plot:
 *             1. If that direction is out of bounds, add a fence to the `fences` array and continue
 *                to the next direction.
 *             2. Check what's stored in the grid for that plot:
 *                - If the plot in that direction is a plant character, we haven't yet visited that
 *                  plot.
 *                  - If the plant is the same as the region's plant:
 *                    - If the plot has already been seen, ignore it.
 *                    - Otherwise, add it to the stack and mark it as seen.
 *                  - Otherwise, add a fence.
 *                - Otherwise, we've already visted that plot assigned that plot to a region.
 *                  - If it belongs to a different region, add a fence.
 *       6. Set the region's perimeter to the length of the `fences` array.
 *       7. Compute the number of sides for the region:
 *          1. Set `sides` to `0`.
 *          2. Iterate the fences (`fence1`):
 *             1. If we've already counted this fence, skip it.
 *             2. Increment `sides` and mark this fence as counted.
 *             3. Determine whether the fence is oriented vertically or horizontally.
 *             4. Set `distance` to 1.
 *             5. Set `fence2` and `fence3` to `fence1`.
 *             6. Loop until both `fence2` and `fence3` are falsy:
 *                1. Search the fence array for a fence that is in the positive direction along the
 *                   fence line exactly `distance` away from `fence1`. If found, mark it as counted
 *                   and set `fence2` to that fence. Otherwise, set `fence2` to `undefined`.
 *                2. Repeat this in the negative direction for `fence3`.
 *                3. Increment `distance`.
 * 4. Iterate the regions and compute their prices for each part:
 *    1. Part 1: `area * perimeter`
 *    2. Part 2: `area * sides`
 * 5. Sum the prices for each part.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const grid = new SimpleGrid({ data: input });
  const regions = buildRegions(grid);
  return regions.reduce((prices, { area, perimeter, sides }) => {
    prices[0] += area * perimeter;
    prices[1] += area * sides;
    return prices
  }, [ 0, 0 ]);
};

/**
 * Scans the grid to discover all regions.
 *
 * @param {SimpleGrid} grid - the `SimpleGrid` to scan
 * @returns {Object[]} - the discovered regions
 */
const buildRegions = grid => {
  const regions = [];
  grid.forEach((plant, r, c) => {
    if (typeof plant === 'string') {
      regions.push(floodRegion(grid, r, c, plant));
    }
  });
  return regions;
};

/**
 * Discovers a single, previously undiscovered region in the grid which contains the given
 * coordinates. The region will have the following properties:
 *
 * - `area`: the number of plots in the region
 * - `plant`: the plant in the region
 * - `perimeter`: the number of fences around the region
 * - `sides`: the number of sides the region has
 *
 * @param {SimpleGrid} grid - the grid
 * @param {number} r - the row coordinate
 * @param {number} c - the column coordinate
 * @param {string} plant - the plant for this region
 * @returns {Object} - the region
 */
const floodRegion = (grid, r, c, plant) => {
  const region = { area: 0, plant };
  const stack = [ [ r, c ] ];
  const seen = new Set([ `${r},${c}` ]);
  const fences = [];

  do {
    // Add the next plot to the region
    const [ r, c ] = stack.pop();
    grid.set(r, c, region);
    region.area++;

    // Iterate the four directions from this plot
    DIRECTIONS.forEach(([ dr, dc ], dir) => {
      const nr = r + dr;
      const nc = c + dc;

      if (!grid.inBounds(nr, nc)) {
        // Coordinates are out of bounds; add a fence
        fences.push({ r, c, dir });
        return;
      }

      const neighbor = grid.get(nr, nc);

      if (typeof neighbor === 'string') {
        // We haven't visited this node yet
        if (neighbor === plant) {
          // It's part of this region
          const key = `${nr},${nc}`;

          if (!seen.has(key)) {
            // We haven't already seen it; add it to the stack
            stack.push([ nr, nc ]);
            seen.add(key);
          }
        } else {
          // It's a different region; add a fence
          fences.push({ r, c, dir });
        }
      } else {
        // This node has already been visited
        if (neighbor !== region) {
          // ...and it's a different region; add a fence
          fences.push({ r, c, dir });
        }
      }
    });
  } while (stack.length);

  // Calculate the region's perimeter and sides
  region.perimeter = fences.length;
  region.sides = countSides(fences);
  return region;
};

/**
 * Given all the fences around a region, compute the number of sides the region has. Each fence has
 * the following properties:
 *
 * - `r`: the row coordinate
 * - `c`: the column coordinate
 * - `dir`: the direction of the fence (0 = up, 1 = right, 2 = down, 3 = left)
 *
 * @param {Object[]} fences - the fences
 * @returns {number} - the number of sides the region has
 */
const countSides = fences => {
  let sides = 0;

  // Iterate the fences
  for (const fence1 of fences) {
    if (fence1.counted) {
      continue; // We've already counted this fence as part of a previous side
    }

    // We've found a new side; search in both directions for more fences on this side
    sides++;
    fence1.counted = true;
    const horiz = fence1.dir === 0 || fence1.dir === 2;
    let distance = 1, fence2 = fence1, fence3 = fence1;

    do {
      if (fence2) {
        // Check for next fence on the positive side
        fence2 = fences.find(
          fence2 => fence1.dir === fence2.dir && (
            (horiz && fence1.r === fence2.r && fence1.c + distance === fence2.c) ||
            (!horiz && fence1.c === fence2.c && fence1.r + distance === fence2.r)
          )
        );

        if (fence2) {
          fence2.counted = true; // Found one; mark it as counted
        }
      }

      if (fence3) {
        // Check for next fence on the negative side
        fence3 = fences.find(
          fence3 => fence1.dir === fence3.dir && (
            (horiz && fence1.r === fence3.r && fence1.c - distance === fence3.c) ||
            (!horiz && fence1.c === fence3.c && fence1.r - distance === fence3.r)
          )
        );

        if (fence3) {
          fence3.counted = true; // Found one; mark it as counted
        }
      }

      distance++;
    } while (fence2 || fence3); // Loop until we've run out of fences on both sides
  }

  return sides;
};
