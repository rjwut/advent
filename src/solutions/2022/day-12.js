const SimpleGrid = require('../simple-grid');
const aStar = require('../a-star');

const DIRECTIONS = [
  { r: -1, c:  0 },
  { r:  1, c:  0 },
  { r:  0, c: -1 },
  { r:  0, c:  1 },
];

/**
 * # [Advent of Code 2022 Day 12](https://adventofcode.com/2022/day/12)
 *
 * @todo Describe solution
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const grid = parse(input);
  return [ part1, part2 ].map(part => part(grid));
};

const parse = input => {
  let grid = new SimpleGrid({ data: input });
  let start, end;
  grid = grid.map((letter, r, c) => {
    const node = { r, c, letter };

    if (letter === 'S') {
      node.elevation = 0;
      start = node;
    } else if (letter === 'E') {
      node.elevation = 25;
      end = node;
    } else {
      node.elevation = letter.charCodeAt(0) - 97;
    }

    return node;
  });
  grid.start = start;
  grid.end = end;
  return grid;
};

const part1 = grid => {
  const edgeCache = new Map();

  const getEdges = node => {
    let edges = edgeCache.get(node);

    if (!edges) {
      edges = DIRECTIONS
        .map(({ r, c }) => ({ r: node.r + r, c: node.c + c}))
        .filter(({ r, c }) => r >= 0 && r < grid.rows && c >= 0 && c < grid.cols)
        .map(({ r, c }) => grid.get(r, c))
        .filter(({ elevation }) => elevation - node.elevation < 2)
        .map(neighbor => ({ node: neighbor }));
      edgeCache.set(node, edges);
    }

    return edges;
  };

  return aStar(
    grid.start,
    grid.end,
    getEdges,
    node => Math.abs(node.r - grid.end.r) + Math.abs(node.c - grid.end.c),
  ).cost;
};

const part2 = grid => {
  const edgeCache = new Map();

  const getEdges = node => {
    let edges = edgeCache.get(node);

    if (!edges) {
      edges = DIRECTIONS
        .map(({ r, c }) => ({ r: node.r + r, c: node.c + c}))
        .filter(({ r, c }) => r >= 0 && r < grid.rows && c >= 0 && c < grid.cols)
        .map(({ r, c }) => grid.get(r, c))
        .filter(({ elevation }) => elevation - node.elevation > -2)
        .map(neighbor => ({ node: neighbor }));
      edgeCache.set(node, edges);
    }

    return edges;
  };

  return aStar(
    grid.end,
    node => node.elevation === 0,
    getEdges,
  ).cost;
};
