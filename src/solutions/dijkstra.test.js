const SimpleGrid = require('./simple-grid');
const dijkstra = require('./dijkstra')

const GRAPH_TEST_CASES = [
  {
    /*
     * START <---- 2 ----> d <---- 3 ----> e --------------2
     *     ^                                               |
     *     |                                               |
     *    1.5                                              |
     *     |                                               |
     *     V                                               V
     *     a <---- 2 ----> b <---- 3 ----> c ----- 4 ----> END
     */
    input: {
      START: [
        { node: 'a', cost: 1.5 },
        { node: 'd', cost: 2 },
      ],
      a: [
        { node: 'START', cost: 1.5 },
        { node: 'b', cost: 2 },
      ],
      b: [
        { node: 'a', cost: 2 },
        { node: 'c', cost: 3 },
      ],
      c: [
        { node: 'b', cost: 3 },
        { node: 'END', cost: 4 },
      ],
      d: [
        { node: 'START', cost: 2 },
        { node: 'e', cost: 3 },
      ],
      e: [
        { node: 'd', cost: 3 },
        { node: 'END', cost: 2 },
      ],
      END: [],
    },
    start: 'START',
    end: 'END',
    expected: {
      START: { node: 'START', cost: 0, prev: null },
      a: { node: 'a', cost: 1.5, prev: 'START' },
      b: { node: 'b', cost: 3.5, prev: 'a' },
      c: { node: 'c', cost: 6.5, prev: 'b' },
      d: { node: 'd', cost: 2, prev: 'START' },
      e: { node: 'e', cost: 5, prev: 'd' },
      END: { node: 'END', cost: 7, prev: 'e' },
    },
  },
  {
    /*
     * START <---- 2 ----> d <---- 3 ----> e
     *     ^
     *     |
     *    1.5
     *     |
     *     V
     *     a <---- 2 ----> b <---- 3 ----> c ----- 4 ----> END
     */
    input: {
      START: [
        { node: 'a', cost: 1.5 },
        { node: 'd', cost: 2 },
      ],
      a: [
        { node: 'START', cost: 1.5 },
        { node: 'b', cost: 2 },
      ],
      b: [
        { node: 'a', cost: 2 },
        { node: 'c', cost: 3 },
      ],
      c: [
        { node: 'b', cost: 3 },
        { node: 'END', cost: 4 },
      ],
      d: [
        { node: 'START', cost: 2 },
        { node: 'e', cost: 3 },
      ],
      e: [
        { node: 'd', cost: 3 },
      ],
      END: [],
    },
    start: 'START',
    end: 'END',
    expected: {
      START: { node: 'START', cost: 0, prev: null },
      a: { node: 'a', cost: 1.5, prev: 'START' },
      b: { node: 'b', cost: 3.5, prev: 'a' },
      c: { node: 'c', cost: 6.5, prev: 'b' },
      d: { node: 'd', cost: 2, prev: 'START' },
      e: { node: 'e', cost: 5, prev: 'd' },
      END: { node: 'END', cost: 10.5, prev: 'c' },
    },
  },
  {
    /*
     * START <---- 2 ----> d <---- 3 ----> e
     *     ^
     *     |
     *    1.5             END
     *     |
     *     V
     *     a <---- 2 ----> b <---- 3 ----> c
     */
    input: {
      START: [
        { node: 'a', cost: 1.5 },
        { node: 'd', cost: 2 },
      ],
      a: [
        { node: 'START', cost: 1.5 },
        { node: 'b', cost: 2 },
      ],
      b: [
        { node: 'a', cost: 2 },
        { node: 'c', cost: 3 },
      ],
      c: [
        { node: 'b', cost: 3 },
      ],
      d: [
        { node: 'START', cost: 2 },
        { node: 'e', cost: 3 },
      ],
      e: [
        { node: 'd', cost: 3 },
      ],
      END: [],
    },
    start: 'START',
    end: 'END',
    expected: {
      START: { node: 'START', cost: 0, prev: null },
      a: { node: 'a', cost: 1.5, prev: 'START' },
      b: { node: 'b', cost: 3.5, prev: 'a' },
      c: { node: 'c', cost: 6.5, prev: 'b' },
      d: { node: 'd', cost: 2, prev: 'START' },
      e: { node: 'e', cost: 5, prev: 'd' },
    },
  },
];
const GRID_TEST_CASES = [
  {
    input: '.#....\n......\n.#.##.\n.#..#.\n....#.',
    start: { r: 0, c: 0 },
    end: { r: 4, c: 5 },
    expected: {
      cost: 9,
      path: [
        '0,0',
        '1,0',
        '1,1',
        '1,2',
        '1,3',
        '1,4',
        '1,5',
        '2,5',
        '3,5',
        '4,5',
      ],
    },
  },
  {
    input: '.#....\n......\n.#.##.\n.#..##\n....#.',
    start: { r: 0, c: 0 },
    end: { r: 4, c: 5 },
    expected: null,
  },
];
const DIRECTIONS = [
  { dr: -1, dc:  0 },
  { dr:  0, dc: -1 },
  { dr:  1, dc:  0 },
  { dr:  0, dc:  1 },
];

const testGraph = ({ input, start, end, expected }) => {
  const edgeFn = node => input[node];
  let result = dijkstra(start, edgeFn, { goal: end });
  result = Object.fromEntries([ ...result.entries() ]);
  expect(result).toEqual(expected);
};

const testGrid = ({ input, start, end, expected }) => {
  const grid = new SimpleGrid({ data: input });
  const edgeFn = node => {
    const edges = [];
    DIRECTIONS.forEach(({ dr, dc }) => {
      const neighbor = { r: node.r + dr, c: node.c + dc };
      const { r, c } = neighbor;

      if (grid.inBounds(r, c) && grid.get(r, c) === '.') {
        edges.push({ node: neighbor });
      }
    });
    return edges;
  };
  const keyFn = ({ r, c }) => `${r},${c}`;
  const result = dijkstra(start, edgeFn, { keyFn, goal: end });
  expectResult(keyFn(end), result, expected);
};

const expectResult = (end, result, expected) => {
  let node = result.get(end);

  if (expected === null) {
    expect(node).toBeUndefined();
    return;
  }

  expect(node).toBeDefined();
  expect(node.cost).toBe(expected.cost);
  const path = [ end ];

  while (node.prev !== null) {
    path.unshift(node.prev);
    node = result.get(node.prev);
  }

  expect(path).toEqual(expected.path);
}

test.each(GRAPH_TEST_CASES)('Graphs', testGraph);

test.each(GRID_TEST_CASES)('Grids', testGrid);
