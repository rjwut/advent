const parseTile = require('./day-20.tile');

const INPUT = `Tile 2311:
..##.#..#.
##..#.....
#...##..#.
####.#...#
##.##.###.
##...#.###
.#.#.#..##
..#....#..
###...#.#.
..###..###`.split('\n');
const TILE = parseTile(INPUT);

describe('Day 20 - Tile object', () => {
  test('Parsing a tile', () => {
    expect(TILE.id).toBe(2311);
    expect(TILE.size).toBe(10);
  });

  test('Getting untransformed edges', () => {
    expect(TILE.getEdge(0, 0, 0)).toBe('..##.#..#.');
    expect(TILE.getEdge(0, 0, 1)).toBe('...#.##..#');
    expect(TILE.getEdge(0, 0, 2)).toBe('..###..###');
    expect(TILE.getEdge(0, 0, 3)).toBe('.#####..#.');
  });

  test('Getting flipped edges', () => {
    expect(TILE.getEdge(1, 0, 0)).toBe('.#..#.##..');
    expect(TILE.getEdge(1, 0, 1)).toBe('.#####..#.');
    expect(TILE.getEdge(1, 0, 2)).toBe('###..###..');
    expect(TILE.getEdge(1, 0, 3)).toBe('...#.##..#');
  });

  test('Getting rotated edges', () => {
    expect(TILE.getEdge(0, 1, 0)).toBe('.#..#####.');
    expect(TILE.getEdge(0, 1, 1)).toBe('..##.#..#.');
    expect(TILE.getEdge(0, 1, 2)).toBe('#..##.#...');
    expect(TILE.getEdge(0, 1, 3)).toBe('..###..###');
  });

  test('Getting flipped and rotated edges', () => {
    expect(TILE.getEdge(1, 1, 0)).toBe('#..##.#...');
    expect(TILE.getEdge(1, 1, 1)).toBe('.#..#.##..');
    expect(TILE.getEdge(1, 1, 2)).toBe('.#..#####.');
    expect(TILE.getEdge(1, 1, 3)).toBe('###..###..');
  });
});
