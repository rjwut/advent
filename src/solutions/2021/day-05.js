const LINE_REGEX = /^(?<x0>\d+),(?<y0>\d+) -> (?<x1>\d+),(?<y1>\d+)$/gm;

/**
 * # [Advent of Code 2021 Day 5](https://adventofcode.com/2021/day/5)
 *
 * At first glance, you might be tempted to create a two-dimensional array to
 * map the clouds, but it's easier to simply use a `Map`, with the coordinates
 * of the cells as keys.
 * TODO Convert to InfiniteGrid
 * 
 * To map a cloud, we start at `x0,y0` and move to `x1,y1`. At each step, we
 * look up that cell in the `Map` and increment its value (or just set it to
 * `1` if it doesn't exist). For step 1, we just filter out the diagonal clouds
 * first before we map them.
 *
 * Once all clouds are mapped, we simply count the cells with a value greater
 * than `1` to produce the answer.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const clouds = parse(input);
  const nonDiagonalClouds = clouds.filter(cloud => cloud.dir !== 'diagonal');
  return [ nonDiagonalClouds, clouds ].map(cloudsToMap => {
    const cloudMap = mapClouds(cloudsToMap);
    return countCloudsWithDensity(cloudMap, 2);
  });
};

/**
 * Parses the input into an array of clouds. The `LINE_REGEX` does the heavy
 * lifting to parse each line. Then we compute the cloud's direction
 * (`'horizontal'`, `'vertical'`, or `'diagonal'`) and it with the coordinates
 * in an object representing each cloud.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the parsed clouds
 */
const parse = input => {
  return [ ...input.matchAll(LINE_REGEX) ]
    .map(cloud => {
      cloud = cloud.groups;
      let dir;

      if (cloud.x0 === cloud.x1) {
        dir = 'vertical';
      } else if (cloud.y0 === cloud.y1) {
        dir = 'horizontal';
      } else {
        dir = 'diagonal';
      }

      return {
        x0: parseInt(cloud.x0, 10),
        y0: parseInt(cloud.y0, 10),
        x1: parseInt(cloud.x1, 10),
        y1: parseInt(cloud.y1, 10),
        dir,
      };
    });
};

/**
 * Invokes the given function for each cell occupied by the given cloud.
 *
 * @param {Object} cloud - the cloud to iterate
 * @param {Function} fn - the function to invoke for each cell
 */
const iterateCloud = (cloud, fn) => {
  let x = cloud.x0;
  let y = cloud.y0;
  let dx = Math.sign(cloud.x1 - cloud.x0);
  let dy = Math.sign(cloud.y1 - cloud.y0);

  do {
    fn(x, y);
    x += dx;
    y += dy;
  } while (x !== cloud.x1 || y !== cloud.y1);

  fn(x, y);
};

/**
 * Renders the given clouds into a cell `Map`.
 *
 * @param {Array} clouds - the clouds to render
 * @returns {Map} - the rendered cell map
 */
const mapClouds = clouds => {
  const map = new Map();

  clouds.forEach(cloud => {
    iterateCloud(cloud, (x, y) => {
      const key = `${x},${y}`;
      const value = map.get(key) || 0;
      map.set(key, value + 1);
    });
  });

  return map;
};

/**
 * Counts the number of cells in the given cloud `Map` with at least the
 * indicated cloud density.
 *
 * @param {Map} cloudMap - the cloud map 
 * @param {number} minDensity - the minimum density of the counted cells
 * @returns {number} - the number of cells with at least that density
 */
const countCloudsWithDensity = (cloudMap, minDensity) => {
  let count = 0;

  // eslint-disable-next-line no-unused-vars
  for (const [ _coords, value ] of cloudMap) {
    if (value >= minDensity) {
      count++;
    }
  }

  return count;
};
