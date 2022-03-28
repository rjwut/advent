const SimpleGrid = require('./simple-grid');
const aStar = require('./a-star')

const GRAPH_TEST_CASES = [
  {
    input: {
      start: {
        edges: [
          { node: 'a', cost: 1.5 },
          { node: 'd', cost: 2 },
        ],
        heuristic: 7,
      },
      a: {
        edges: [
          { node: 'start', cost: 1.5 },
          { node: 'b', cost: 2 },
        ],
        heuristic: 4,
      },
      b: {
        edges: [
          { node: 'a', cost: 2 },
          { node: 'c', cost: 3 },
        ],
        heuristic: 2,
      },
      c: {
        edges: [
          { node: 'b', cost: 3 },
          { node: 'end', cost: 4 },
        ],
        heuristic: 4,
      },
      d: {
        edges: [
          { node: 'start', cost: 2 },
          { node: 'e', cost: 3 },
        ],
        heuristic: 4.5,
      },
      e: {
        edges: [
          { node: 'd', cost: 3 },
          { node: 'end', cost: 2 },
        ],
        heuristic: 2,
      },
      end: {
        edges: [],
        heuristic: 0,
      },
    },
    start: 'start',
    end: 'end',
    expected: {
      cost: 7,
      path: [ 'start', 'd', 'e', 'end' ],
    },
  },
  {
    input: {
      start: {
        edges: [
          { node: 'a', cost: 1.5 },
          { node: 'd', cost: 2 },
        ],
        heuristic: 7,
      },
      a: {
        edges: [
          { node: 'start', cost: 1.5 },
          { node: 'b', cost: 2 },
        ],
        heuristic: 4,
      },
      b: {
        edges: [
          { node: 'a', cost: 2 },
          { node: 'c', cost: 3 },
        ],
        heuristic: 2,
      },
      c: {
        edges: [
          { node: 'b', cost: 3 },
          { node: 'end', cost: 4 },
        ],
        heuristic: 4,
      },
      d: {
        edges: [
          { node: 'start', cost: 2 },
          { node: 'e', cost: 3 },
        ],
        heuristic: 4.5,
      },
      e: {
        edges: [
          { node: 'd', cost: 3 },
        ],
        heuristic: 2,
      },
      end: {
        edges: [],
        heuristic: 0,
      },
    },
    start: 'start',
    end: 'end',
    expected: {
      cost: 10.5,
      path: [ 'start', 'a', 'b', 'c', 'end' ],
    },
  },
  {
    input: {
      start: {
        edges: [
          { node: 'a', cost: 1.5 },
          { node: 'd', cost: 2 },
        ],
        heuristic: 7,
      },
      a: {
        edges: [
          { node: 'start', cost: 1.5 },
          { node: 'b', cost: 2 },
        ],
        heuristic: 4,
      },
      b: {
        edges: [
          { node: 'a', cost: 2 },
          { node: 'c', cost: 3 },
        ],
        heuristic: 2,
      },
      c: {
        edges: [
          { node: 'b', cost: 3 },
        ],
        heuristic: 4,
      },
      d: {
        edges: [
          { node: 'start', cost: 2 },
          { node: 'e', cost: 3 },
        ],
        heuristic: 4.5,
      },
      e: {
        edges: [
          { node: 'd', cost: 3 },
        ],
        heuristic: 2,
      },
      end: {
        edges: [],
        heuristic: 0,
      },
    },
    start: 'start',
    end: 'end',
    expected: null,
  },
];
const GRID_TEST_CASES = [
  {
    input: '.#....\n......\n.#.##.\n.#..#.\n....#.',
    start: '0,0',
    end: '4,5',
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
    start: '0,0',
    end: '4,5',
    expected: null,
  },
];
const DIRECTIONS = [
  [ -1,  0 ],
  [  0, -1 ],
  [  0,  1 ],
  [  1,  0 ],
];

describe('A* algorithm', () => {
  test.each(GRAPH_TEST_CASES)('Graphs', ({ input, start, end, expected }) => {
    const getEdges = node => input[node].edges;
    const heuristic = node => input[node].heuristic;
    const result = aStar(start, end, getEdges, heuristic);
    expect(result).toEqual(expected);
  });

  test.each(GRID_TEST_CASES)('Grids', ({ input, start, end, expected }) => {
    const grid = new SimpleGrid({ data: input });
    const [ rEnd, cEnd ] = end.split(',').map(Number);
    const getEdges = node => {
      const coords = node.split(',').map(Number);
      const edges = [];
      DIRECTIONS.forEach(delta => {
        const neighbor = coords.map((v, i) => v + delta[i]);
        const [ r, c ] = neighbor;
  
        if (r >= 0 && r < grid.rows && c >= 0 && c < grid.cols) {
          const chr = grid.get(r, c);
  
          if (chr === '.') {
            edges.push({ node: `${r},${c}` });
          }
        }
      });
      return edges;
    };
    const heuristic = node => {
      const [ r, c ] = node.split(',').map(Number);
      return Math.abs(r - rEnd) + Math.abs(c - cEnd);
    };
    const result = aStar(start, end, getEdges, heuristic);
    expect(result).toEqual(expected);
  });
});
