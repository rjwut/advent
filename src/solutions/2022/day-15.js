const { match } = require('../util');
const { manhattanDistance } = require('../math2');
const Range = require('../range');

const REGEXP = /^Sensor at x=(?<xSensor>-?\d+), y=(?<ySensor>-?\d+): closest beacon is at x=(?<xBeacon>-?\d+), y=(?<yBeacon>-?\d+)/gm
const PERIMETER_SCAN = [
  { dir: [  1,  1 ], untilIndex: 1 },
  { dir: [ -1,  1 ], untilIndex: 2 },
  { dir: [  1, -1 ], untilIndex: 1 },
  { dir: [ -1, -1 ], untilIndex: 2 },
];

/**
 * # [Advent of Code 2022 Day 15](https://adventofcode.com/2022/day/15)
 *
 * For the first part, we want the number of locations along a horizontal line where a beacon
 * cannot be present. Since for any given sensor we know the position of the closest beacon, we
 * know that any locations that are closer to the sensor cannot contain a beacon. So, we can count
 * the number of positions that lie along that line that are within the range of any sensor, and
 * subtract the number of beacons that fall on that line. I wrote several functions to help compute
 * this answer:
 *
 * - `getRanges()`: Determine the range of X coordinates where each sensor's detection range
 *   intersects with a horizontal line at the given Y coordinate.
 * - `consolidateRanges()`: Many of the ranges given by `getRanges()` will overlap; this function
 *   consolidates them to the minimum number of ranges that cover the same locations.
 * - `uniquifyBeacons()`: Given the parsed data, determines the unique list of detected beacons.
 *   (Some beacons are the closest to more than one sensor.)
 *
 * After getting the intersections between the detection ranges and the target line, and
 * consolidating them, we simply sum the lengths of these intersections, then subtract the number
 * of unique beacons that fall on the line. The result is the answer to part one.
 *
 * For part two, I iterate the sensors, then iterate each location just outside each sensor's
 * range. For each of those locations, I determine whether that point is 1) within the range
 * indicated by the problem (coordinates between 0 and 4,000,000, inclusive), 2) not within the
 * detection range of any sensor. The first one that I find that meets these requirements is the
 * location of the distress beacon.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = (input, yTarget = 2_000_000, searchSize = 4_000_000) => {
  const records = match(input, REGEXP, record => new Record(record));
  const part1 = answerPart1(records, yTarget);
  const beacon = findDistressBeacon(records, searchSize);
  const part2 = beacon[0] * searchSize + beacon[1];
  return [ part1, part2 ];
};

/**
 * Computes the answer for part one.
 *
 * @param {Array<Record>} records - the parsed `Record`s
 * @param {number} yTarget - the Y coordinate for the target line
 * @returns {number} - the answer to part one
 */
const answerPart1 = (records, yTarget) => {
  const ranges = getRanges(records, yTarget);
  consolidateRanges(ranges);
  const beacons = uniquifyBeacons(records);
  let part1 = ranges.reduce((sum, range) => sum + range.size, 0);
  [ ...beacons ].forEach(beacon => {
    const [ x, y ] = beacon;

    if (y === yTarget && ranges.some(range => range.contains(x))) {
      part1--;
    }
  });
  return part1;
};

/**
 * Returns an array of `Range` objects that represent the intersections between each sensor's
 * detection range and the horizontal line at the given Y-coordinate.
 *
 * @param {Record} records - the parsed `Record`s
 * @param {number} y - the Y coordinate of the line
 * @returns {Array<Range>} - the detected intersections
 */
const getRanges = (records, y) => records.reduce((ranges, { sensor, distance }) => {
  const halfWidth = distance - Math.abs(sensor[1] - y)

  if (halfWidth < 0) {
    return ranges;
  }

  ranges.push(new Range(
    sensor[0] - halfWidth,
    sensor[0] + halfWidth,
  ));
  return ranges;
}, []);

/**
 * Modifies the given array to contain a minimal number of `Range`s that represent the union of the
 * given `Range`s.
 *
 * @param {Array<Range>} ranges - the array to modify
 */
const consolidateRanges = ranges => {
  let foundIntersections;

  do {
    foundIntersections = false;

    for (let i = ranges.length - 1; i > 0; i--) {
      const range1 = ranges[i];

      for (let j = 0; j < i; j++) {
        const range2 = ranges[j];
        const union = range1.union(range2);

        if (union) {
          ranges[j] = union;
          ranges.splice(i, 1);
          foundIntersections = true;
          break;
        }
      }
    }
  } while (foundIntersections);
};

/**
 * Returns an array containing the distinct beacons listed in the given `Record`s.
 *
 * @param {Array<Record>} records - the `Record`s
 * @returns {Array<Array<number>>} - the coordinates of the distinct beacons
 */
const uniquifyBeacons = records => {
  const beacons = new Map();
  records.forEach(record => {
    record.beacon = uniquifyBeacon(beacons, record.beacon);
  });
  return [ ...beacons.values() ];
}

/**
 * We don't have tuples yet, so this function checks to see if the given coordinates are already
 * stored in the cache represented by the indicated `Map`. The `Map` uses the coordinates converted
 * to strings as keys under which to store the coordinates. If the cache already contains the
 * coordinates, a reference to the cached coordinates is returned; otherwise, the coordinates
 * originally passed in are returned instead.
 *
 * @param {Map<string, Array<number>>} map - the cache
 * @param {Array<number>} coords - the coordinates to find in the cache
 * @returns {Array<number>} - the uniquified beacon coordinates
 */
const uniquifyBeacon = (map, coords) => {
  const key = coords.join(',');
  const unique = map.get(key);

  if (unique) {
    return unique;
  }

  map.set(key, coords);
  return coords;
};

/**
 * Locates the distress beacon for part two.
 *
 * @param {Array<Record>} records - the parsed `Record`s
 * @param {number} searchSize - the size of the search area
 * @returns {Array<number>} - the beacon coordinates
 */
const findDistressBeacon = (records, searchSize) => {
  for (const record of records) {
    const beacon = checkPerimeter(records, record, searchSize);

    if (beacon) {
      return beacon;
    }
  }
};

/**
 * Checks each location just outside the detection range of the sensor named in the given `Record`
 * to see if that location is within the range of any other sensor and is inside our search area.
 * The first location that meets those criteria is returned.
 *
 * @param {Array<Record>} records - the parsed `Record`s
 * @param {Record} record - the `Record` of the sensor whose perimeter should be checked
 * @param {number} searchSize - the size of the search area
 * @returns {Array<number>|undefined} - the distress beacon's location, if found
 */
const checkPerimeter = (records, record, searchSize) => {
  const coords = [ record.sensor[0], record.sensor[1] - record.distance - 1 ];

  for (const { dir, untilIndex } of PERIMETER_SCAN) {
    do {
      if (coords[0] >= 0 && coords[0] <= searchSize && coords[1] >= 0 && coords[1] <= searchSize) {
        let found = true;

        for (const record2 of records) {
          if (record === record2) {
            continue;
          }

          if (record2.isInsideRange(coords)) {
            found = false;
            break;
          }
        }

        if (found) {
          return coords;
        }
      }

      coords.forEach((_, i) => coords[i] += dir[i]);
    } while (coords[untilIndex] !== record.sensor[untilIndex]);
  }
};

/**
 * A single parsed line of the input.
 */
class Record {
  sensor;
  beacon;
  distance;

  /**
   * Creates a new record from the `RegExp` match.
   *
   * @param {Object} param0 - the `RegExp` match
   */
  constructor({ xSensor, ySensor, xBeacon, yBeacon }) {
    this.sensor = [ Number(xSensor), Number(ySensor) ];
    this.beacon = [ Number(xBeacon), Number(yBeacon) ];
    this.distance = manhattanDistance(this.sensor, this.beacon);
  }

  /**
   * Returns the X coordinates where the border of the sensor's detection range intersects with the
   * horizontal line at the given Y coordinate. The returned array may contain 0, 1, or 2
   * coordinates.
   *
   * @param {number} y - the Y coordinate for the intersection
   * @returns {Array<number>} - the X coordinates where the intersection occurs
   */
  findBorderIntersectionsAtY(y) {
    const [ xSensor, ySensor ] = this.sensor;
    const maxDistance = this.distance + 1;
    const yMin = ySensor - maxDistance;
    const yMax = ySensor + maxDistance;

    if (y < yMin || y > yMax) {
      return [];
    }

    if (y === yMin || y === yMax) {
      return [ xSensor ];
    }

    const yDiff = Math.abs(y - ySensor);
    return [ xSensor - yDiff, xSensor + yDiff ];
  }

  /**
   * Determines whether the given coordinates are within the sensor's detection range.
   *
   * @param {Array<number>} coords - the coordinates to test
   * @returns {boolean} - whether they're within range
   */
  isInsideRange(coords) {
    return manhattanDistance(this.sensor, coords) <= this.distance;
  }
}
