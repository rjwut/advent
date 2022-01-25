const { gcd } = require('../math2');
const { split } = require('../util');

const DISTANCE_SORT = (a, b) => a.distance - b.distance;
const ANGLE_SORT = (a, b) => a.angle - b.angle;

/**
 * For part one, we need to be able to compute an angle from any asteroid to
 * any other asteroid.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const asteroids = parse(input);
  const metricsMap = asteroids.reduce((bestMetricsMap, _, i) => {
    const metricsMap = computeMetrics(asteroids, i);
    const foundBetter = !bestMetricsMap || metricsMap.size > bestMetricsMap.size;
    return foundBetter ? metricsMap : bestMetricsMap;
  }, null);
  metricsMap.forEach(entry => {
    entry.asteroids.sort(DISTANCE_SORT);
  });
  const metricsArray = Array.from(metricsMap.values()).sort(ANGLE_SORT);
  let metricsIndex = 0;
  let lastVaporized;
  let vaporizedCount = 0;

  do {
    do {
      lastVaporized = metricsArray[metricsIndex].asteroids.shift();
      metricsIndex = (metricsIndex + 1) % metricsArray.length;
    } while (!lastVaporized);

    vaporizedCount++;
  } while (vaporizedCount < 200);

  return [
    metricsMap.size,
    lastVaporized.location.x * 100 + lastVaporized.location.y,
  ]
};

const parse = input => {
  return split(input).reduce((asteroids, line, y) => {
    for (let x = 0; x < line.length; x++) {
      if (line.charAt(x) === '#') {
        asteroids.push({ x, y });
      }
    }

    return asteroids;
  }, []);
};

/**
 * Computes a metrics `Map` that contains the metrics for the relationships
 * between the asteroid at the given index and all other asteroids. The `Map`
 * contains an entry for each unique angle, and the value stored for each angle
 * is an object which contains the following properties:
 *
 * - `angle`: The angle from `pos0` to `pos1`, expressed in degrees
 * - `asteroids`: An array of all asteroids that have the same angle, where
 *   each asteroid is an object
 *
 * @param {Array} asteroids - the list of asteroid positions
 * @param {number} i - the index of the "origin" asteroid
 * @returns {Map} - the metrics map
 */
const computeMetrics = (asteroids, i) => {
  const thisAsteroid = asteroids[i];
  const metricsMap = asteroids.reduce((map, otherAsteroid, j) => {
    if (i === j) {
      return map;
    }

    const result = compute(thisAsteroid, otherAsteroid);
    let entry = map.get(result.key);

    if (!entry) {
      entry = {
        angle: result.angle,
        asteroids: [],
      };
      map.set(result.key, entry);
    }

    entry.asteroids.push({
      location: otherAsteroid,
      distance: result.distance,
    });
    return map;
  }, new Map());
  metricsMap.origin = thisAsteroid;
  return metricsMap;
};

/**
 * Computes metrics for the relationship between two asteroids. The returned
 * object has the following properties:
 *
 * - `angle`: The angle from `pos0` to `pos1`, expressed in degrees, where 0 is
 *   "north", 90 is "east", 180 is "south", and 270 is "west".
 * - `distance`: The distance between `pos0` and `pos1`.
 * - `key`: A string representation of the angle, in the format `dy/dx`. This
 *   is a fraction representation of the angle which has been reduced to lowest
 *   terms. This allows us to match up asteroids with the same angle without
 *   having to worry about floating point rounding errors.
 *
 * @param {Object} pos0 - the position of the first asteroid
 * @param {Object} pos1 - the position of the second asteroid
 * @returns {Object} - the metrics object
 */
const compute = (pos0, pos1) => {
  let dx0 = pos1.x - pos0.x;
  let dy0 = pos1.y - pos0.y;
  let dx, dy;

  if (dx0 * dy0 === 0) {
    dx = dx0 === 0 ? 0 : Math.sign(dx0);
    dy = dy0 === 0 ? 0 : Math.sign(dy0);
  } else {
    let factor;
    dx = dx0, dy = dy0;

    do {
      factor = gcd(dx, dy);
      dx /= factor;
      dy /= factor;
    } while (factor !== 1);
  }

  return {
    angle: convertAngle(Math.atan2(dx, dy) + Math.PI), // y increases to the south
    distance: Math.sqrt(dx0 * dx0 + dy0 * dy0),
    key: `${dy}/${dx}`,
  };
}

/**
 * The angles are originally computed in radians, with the y axis increasing to
 * the south and with the angle increasing counterclockwise. This function
 * converts it to the angle system used in part two of the puzzle, where the
 * laser starts facing "north" and sweeps clockwise.
 *
 * @param {number} radians - the angle in radians
 * @returns {number} - the angle in degrees
 */
const convertAngle = radians => ((-radians * 180 / Math.PI) + 90) % 360;