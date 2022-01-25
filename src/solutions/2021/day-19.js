const { manhattanDistance } = require('../math2');
const { split } = require('../util');

const TRANSFORMATIONS = {
  turnUp:    c => [  c[0], -c[2],  c[1] ],
  turnDown:  c => [  c[0],  c[2], -c[1] ],
  turnLeft:  c => [ -c[1],  c[0],  c[2] ],
  turnRight: c => [  c[1], -c[0],  c[2] ],
  rollLeft:  c => [ -c[2],  c[1],  c[0] ],
  rollRight: c => [  c[2],  c[1], -c[0] ],
};

const ORIENTATIONS = [
  [],
  [ 'rollLeft' ],
  [ 'rollLeft', 'rollLeft' ],
  [ 'rollRight' ],
  [ 'turnLeft' ],
  [ 'turnLeft', 'rollLeft' ],
  [ 'turnLeft', 'rollLeft', 'rollLeft' ],
  [ 'turnLeft', 'rollRight' ],
  [ 'turnLeft', 'turnLeft' ],
  [ 'turnLeft', 'turnLeft', 'rollLeft' ],
  [ 'turnLeft', 'turnLeft', 'rollLeft', 'rollLeft' ],
  [ 'turnLeft', 'turnLeft', 'rollRight' ],
  [ 'turnRight' ],
  [ 'turnRight', 'rollLeft' ],
  [ 'turnRight', 'rollLeft', 'rollLeft' ],
  [ 'turnRight', 'rollRight' ],
  [ 'turnUp' ],
  [ 'turnUp', 'rollLeft' ],
  [ 'turnUp', 'rollLeft', 'rollLeft' ],
  [ 'turnUp', 'rollRight' ],
  [ 'turnDown' ],
  [ 'turnDown', 'rollLeft' ],
  [ 'turnDown', 'rollLeft', 'rollLeft' ],
  [ 'turnDown', 'rollRight' ],
];

/**
 * # [Advent of Code 2021 Day 19](https://adventofcode.com/2021/day/19)
 *
 * I created an array of 24 orientations, so that I could pass in a coordinate
 * array and get back the corresponding coordinates in that orientation.
 * Beacons were matched up by generating a hash of the distances between each
 * beacon and its closest neighbors, then iterating the scanners other than
 * scanner 0 and looking for matching hashes between their beacons and any of
 * scanner 0's beacons.
 *
 * If a match is found, I compute a vector between the matched beacon in
 * scanner 0 and its nearest neighbor, and do the the same with the various
 * orientations for the corresponding beacons from the matched scanner. When
 * the vectors match, I've found the correct orientation.
 *
 * I then compute the position of the matched scanner by subtracting the
 * coordinate vectors of the matched beacons (properly oriented). After that, I
 * filter the list of beacons from the matched scanner to remove any that
 * matched to one of the beacons in scanner 0. The remaining beacons are those
 * that don't already exist in scanner 0. I iterate them, orient them, and
 * translate them to the corresponding location in scanner 0's coordinate
 * space. Once all the new beacons are added, I recompute all of scanner 0's
 * hashes (since the nearest neighbors of some beacons may have changed with
 * the addition of the new beacons).
 *
 * I continue this process until all the scanners have been matched up and all
 * their beacons have been added to scanner 0.
 *
 * After this is done, the answers are easy. Part one's answer is simply the
 * number of beacons now belonging to scanner 0. Part two's answer (the largest
 * Manhattan distance between any two scanners) is easy to compute now that all
 * their positions are known.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const scanners = parse(input);
  scanners.forEach(scanner => scanner.generateHashes());
  const home = scanners[0];
  home.coords = [ 0, 0, 0 ];
  const queue = scanners.slice(1);
  let miss = 0;

  do { // Loop to search for matching beacons
    const that = queue.shift();
    let matches = home.getMatchingHashes(that);

    if (!matches.length) {
      queue.push(that);
      miss++;

      if (miss === queue.length) {
        throw new Error('No solution found');
      }

      continue;
    }

    // Found a match! Determine the correct orientation.
    miss = 0;
    const match = matches[0];
    const thisBeacon = match.thisHash.beacon;
    const thisNeighbor = match.thisHash.neighbors[0];
    const thisVector = subtractVectors(thisBeacon.coords, thisNeighbor.coords);
    const thatBeacon = match.thatHash.beacon;
    const thatNeighbor = match.thatHash.neighbors[0];
    let result;

    for (let orientation of ORIENTATIONS) {
      const thatOriented = thatBeacon.orient(orientation);
      const thatNeighborOriented = thatNeighbor.orient(orientation);
      const thatVector = subtractVectors(thatOriented, thatNeighborOriented);

      if (vectorsEqual(thisVector, thatVector)) {
        result = {
          orientation,
          thatOriented,
        };
        break;
      }
    }

    // Translate the beacons from the matched scanner to the home scanner's
    // coordinate space, and add them to the home scanner.
    that.coords = subtractVectors(thisBeacon.coords, result.thatOriented);
    matches = matches.map(match => match.thatHash);
    home.addBeacons(that.beacons
      .filter(beacon => !matches.find(match => match.beacon === beacon))
      .map(beacon => {
        const relativeCoords = beacon.orient(result.orientation);
        const coords = addVectors(that.coords, relativeCoords);
        return new Beacon(coords);
      })
    );
  } while (queue.length);

  return [ home.beacons.length, getLargestScannerDistance(scanners) ];
};

/**
 * Parses the puzzle input into an array of `Scanner`s.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the `Scanner`s
 */
const parse = input => split(input, { group: true })
  .map(group => new Scanner(group));

/**
 * Represents a single scanner and all its beacons.
 */
class Scanner {
  coords;
  beacons;
  hashes;

  /**
   * Constructs a new `Scanner` from the group of input lines.
   *
   * @param {Array} lines - the input lines for the scanner
   */
  constructor(lines) {
    this.beacons = lines.slice(1).map(line => new Beacon(line));
  }

  /**
   * Adds the given `Beacon`s to this `Scanner`.
   * @param {*} beacons 
   */
  addBeacons(beacons) {
    this.beacons = [ ...this.beacons, ...beacons ];
    this.generateHashes();
  }

  /**
   * Computes the hashes for all the `Beacon`s in this `Scanner`.
   */
  generateHashes() {
    this.hashes = this.beacons.map(beacon => this.generateHash(beacon));
  }

  /**
   * Generates a hash for the given `Beacon`. This is done by computing the
   * distances between this `Beacon` and its two nearest neighbors, sorting the
   * three resulting distances, and concatenating them together. The returned
   * object has three properties:
   *
   * - `beacon`: A reference to the given `Beacon`
   * - `hash`: The computed hash string
   * - `neighbors`: An array containing the two neighbor `Beacon`s that were
   *   used to compute the hash
   *
   * @param {Beacon} beacon - the beacon to generate a hash for
   * @returns {Object} - the hash object
   */
  generateHash(beacon) {
    const distances = this.beacons
      .filter(other => other !== beacon)
      .map(other => ({ other, distance: other.distance(beacon) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 2);
    return {
      beacon,
      hash: distances.map(obj => obj.distance.toFixed(5)).join(),
      neighbors: distances.map(obj => obj.other),
    }
  }

  /**
   * Searches for matching hash strings between this `Scanner` and the given
   * `Scanner`. The returned array contains objects representing each match,
   * with two properties:
   *
   * `thisHash`: A reference to the hash object from this `Scanner`
   * `thatHash`: A reference to the hash object from the given `Scanner`
   *
   * @param {Scanner} that - the other `Scanner`
   * @returns {Array} - the matching hash objects
   */
  getMatchingHashes(that) {
    let matches = [];

    for (let thisHashObj of this.hashes) {
      for (let thatHashObj of that.hashes) {
        if (thisHashObj.hash === thatHashObj.hash) {
          matches.push({
            thisHash: thisHashObj,
            thatHash: thatHashObj,
          });
        }
      }
    }

    return matches;
  }
}

/**
 * Represents a single beacon.
 */
class Beacon {
  coords;

  /**
   * Constructs a new `Beacon` from the given coordinates.
   *
   * @param {Array} coords - the coordinates of this `Beacon` 
   */
  constructor(coords) {
    if (typeof coords === 'string') {
      this.coords = coords.split(',').map(Number);
    } else {
      this.coords = coords;
    }
  }

  /**
   * Computes the distance between this `Beacon` and the given `Beacon`.
   *
   * @param {Beacon} that - the other `Beacon`
   * @returns {nunber} - the distance
   */
  distance(that) {
    return this.coords.reduce((sum, coord, i) => sum + (coord - that.coords[i]) ** 2, 0);
  }

  /**
   * Returns the coordinates of this `Beacon` in the given ordientation.
   *
   * @param {Array} orientation - the orientation to use
   * @returns {Array} - the resulting coordinates
   */
  orient(orientation) {
    return orientation.reduce(
      (coords, transform) => TRANSFORMATIONS[transform](coords),
      this.coords
    );
  }
}

/**
 * Returns the largest Manhattan distance between any two `Scanner`s.
 *
 * @param {Array} scanners - the `Scanner`s to search
 * @returns {number} - the largest Manhattan distance
 */
const getLargestScannerDistance = scanners => scanners.reduce((max, scanner0, i) => {
  for (let j = i + 1; j < scanners.length; j++) {
    const scanner1 = scanners[j];
    const distance = manhattanDistance(scanner0.coords, scanner1.coords);
    max = Math.max(max, distance);
  }

  return max;
}, 0);

/**
 * Determines whether the two given vectors are equal.
 *
 * @param {Array} v0 - the first vector
 * @param {Array} v1 - the second vector
 * @returns {boolean} - `true` if they're equal, `false` otherwise
 */
const vectorsEqual = (v0, v1) => v0.every((coord, i) => coord === v1[i]);

/**
 * Adds the two given vectors.
 *
 * @param {Array} v0 - the first vector
 * @param {Array} v1 - the second vector
 * @returns {Array} - the resulting vector
 */
const addVectors = (v0, v1) => v0.map((coord, i) => coord + v1[i]);

/**
 * Subtracts the two given vectors.
 *
 * @param {Array} v0 - the first vector
 * @param {Array} v1 - the second vector
 * @returns {Array} - the resulting vector
 */
const subtractVectors = (v0, v1) => v0.map((coord, i) => coord - v1[i]);
