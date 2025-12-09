const { split } = require('../util');

/**
 * # [Advent of Code 2025 Day 9](https://adventofcode.com/2025/day/9)
 *
 * Part 1 is relatively straightforward: for each pair of points, calculate the area of the
 * rectangle they describe, then select the largest one.
 *
 * Part 2 is where it gets tricky: we need to only consider a rectangle if it is completely
 * contained within the polygon formed by the input points. Polygon A is completely inside of
 * polygon B if at least one vertex of polygon A is inside polygon B, and no edge of polygon A
 * intersects any edge of polygon B.
 *
 * Fortunately, we don't need to check whether a vertex is inside the polygon, because every vertex
 * of the rectangle we're checking is guaranteed to be a vertex of the polygon, and is thus
 * considered inside. So we only need to check for edge intersections.
 *
 * All of the edges in this problem are either horizontal or vertical, which makes intersection
 * detection simpler. Two edges intersect if:
 *
 * - one is horizontal and the other vertical
 * - the X coordinate of the vertical edge is between the X coordinates of the horizontal edge, and
 * - the Y coordinate of the horizontal edge is between the Y coordinates of the vertical edge.
 *
 * So we build four edges that represent the rectangle being checked, then check to see if any
 * intersect our polygon's edges. If none do, we have a valid rectangle.
 *
 * However, this is complicated by the fact that, by this definition, edges that share a vertex are
 * considered to intersect, which is guaranteed to happen since all the rectangle's vertices are
 * also vertices of the polygon. I was originally trying to work out the exact correct logic to
 * account for this, but it was complicated, and I soon realized that there was a much simpler
 * solution. Since we know that all vertex coordinates are integers, we can get around this by
 * shrinking the rectangle by a half-unit on all sides, then testing that slightly smaller rectangle
 * for intersections. If the smaller rectangle doesn't intersect, then the original one doesn't
 * either.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  // Convert input into a polygon
  const points = split(input).map(line => {
    const [ x, y ] = line.split(',').map(Number);
    return new Point(x, y);
  });
  const polygon = new Polygon(points);
  const iLimit = points.length - 1;
  let part1 = -1, part2 = -1;

  // Iterate all pairs of points
  for (let i = 0; i < iLimit; i++) {
    const p1 = points[i];

    for (let j = i + 1; j < points.length; j++) {
      const p2 = points[j];

      // Compute area, then update best answer for part 1 if it's larger
      const area = p1.rectArea(p2);
      part1 = Math.max(part1, area);

      // Create a slightly-smaller rectangle for intersection testing
      const x1 = Math.min(p1.x, p2.x) + 0.5;
      const x2 = Math.max(p1.x, p2.x) - 0.5;
      const y1 = Math.min(p1.y, p2.y) + 0.5;
      const y2 = Math.max(p1.y, p2.y) - 0.5;
      const rect = new Polygon([
        new Point(x1, y1),
        new Point(x2, y1),
        new Point(x2, y2),
        new Point(x1, y2)
      ]);

      if (!rect.edges.some(edge => polygon.intersects(edge))) {
        // Rectangle is fully inside polygon; update best answer for part 2 if it's larger
        part2 = Math.max(part2, area);
      }
    }
  }

  return [ part1, part2 ];
};

/**
 * A single point in 2D space.
 */
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Computes the area of the rectangle defined by this point and another. Note that we are using
   * whole units, so every rectangle has a width and height of at least 1.
   *
   * @param {Point} that - the other point
   * @returns {number} - the rectangle's area
   */
  rectArea(that) {
    return (Math.abs(this.x - that.x) + 1) * (Math.abs(this.y - that.y) + 1);
  }
}

/**
 * An edge between two points, either horizontal or vertical.
 */
class Edge {
  constructor(p1, p2) {
    this.horizontal = p1.y === p2.y;
    this.p1 = this.horizontal ? (p1.x < p2.x ? p1 : p2) : (p1.y < p2.y ? p1 : p2);
    this.p2 = this.horizontal ? (p1.x < p2.x ? p2 : p1) : (p1.y < p2.y ? p2 : p1);
  }

  /**
   * Determines whether this `Edge` intersects another.
   *
   * @param {Edge} that - the other `Edge`
   * @returns {boolean} - whether the `Edge`s intersect
   */
  intersects(that) {
    // Edges that are both horizontal or both vertical do not intersect
    if (this.horizontal === that.horizontal) {
      return false;
    }

    // Figure out which one is the horizontal and which is the vertical
    const horizontal = this.horizontal ? this : that;
    const vertical = this.horizontal ? that : this;

    // Check for intersection
    return vertical.p1.x > horizontal.p1.x && vertical.p1.x < horizontal.p2.x &&
           horizontal.p1.y > vertical.p1.y && horizontal.p1.y < vertical.p2.y;
  }
}

/**
 * A `Polygon` is defined by a series of `Point`s connected by `Edge`s.
 */
class Polygon {
  constructor(points) {
    this.points = points;
    this.edges = [];
    points.forEach((p, i) => {
      const next = points[(i + 1) % points.length];
      this.edges.push(new Edge(p, next));
    });
  }

  /**
   * Determines whether the given `Edge` intersects any of the polygon's `Edge`s.
   *
   * @param {Edge} edge - the `Edge` to test
   * @returns {boolean} - whether the `Edge` intersects the `Polygon`
   */
  intersects(edge) {
    return this.edges.some(e => e.intersects(edge));
  }
}
