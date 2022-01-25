const buildMap = require('./day-25.map');

let map;

beforeEach(() => {
  map = buildMap();
});

describe('2019 Day 25 - map', () => {
  describe('enteredRoom()', () => {
    test('Create first room', () => {
      const room = map.enteredRoom('Hull Breach', [ 'north', 'east', 'south' ]);
      expect(room).toEqual({
        name: 'Hull Breach',
        exits: { north: null, east: null, south: null },
      });
    });

    test('Create connections', () => {
      const hullBreach = map.enteredRoom('Hull Breach', [ 'north', 'east', 'south' ]);
      const engineering = map.enteredRoom(
        'Engineering',
        [ 'north', 'east', 'west' ],
        'Hull Breach',
        'east',
      );
      expect(hullBreach.exits.east).toBe(engineering);
      expect(engineering.exits.west).toBe(hullBreach);
    });

    test('Previous room must exist', () => {
      expect(() => map.enteredRoom(
        'Engineering',
        [ 'north', 'east', 'west' ],
        'Hull Breach',
        'east',
      )).toThrow('Unknown room: Hull Breach');
    });

    test('Previous room must have exit in correct direction', () => {
      map.enteredRoom('Hull Breach', [ 'north', 'east', 'south' ]);
      expect(() => map.enteredRoom(
        'Engineering',
        [ 'north', 'east', 'west' ],
        'Hull Breach',
        'west',
      )).toThrow('Hull Breach does not have an exit to west');
    });

    test('New room must have an exit in the correct direction', () => {
      map.enteredRoom('Hull Breach', [ 'north', 'east', 'south' ]);
      expect(() => map.enteredRoom(
        'Engineering',
        [ 'north', 'east', 'south' ],
        'Hull Breach',
        'east',
      )).toThrow('Engineering does not have an exit to west');
    });
  });

  describe('get()', () => {
    test('Return undefined for unknown room', () => {
      expect(map.get('Hull Breach')).toBeUndefined();
    });

    test('Return known room', () => {
      map.enteredRoom('Hull Breach', [ 'north', 'east', 'south' ]);
      expect(map.get('Hull Breach')).toEqual({
        name: 'Hull Breach',
        exits: { north: null, east: null, south: null },
      });
    });
  });

  describe('path()', () => {
    beforeEach(() => {
      map.enteredRoom('Hull Breach', [ 'north', 'east', 'south' ]);
      map.enteredRoom('Engineering', [ 'north', 'east', 'west' ], 'Hull Breach', 'east');
      map.enteredRoom('Observatory', [ 'east', 'south' ], 'Engineering', 'north');
      map.enteredRoom('Stables', [ 'west' ], 'Observatory', 'east');
      map.enteredRoom('Warp Drive Maintenance', [ 'east', 'west' ], 'Engineering', 'east');
    });

    const hasUnknownExits = room => {
      return Object.values(room.exits).some(exit => exit === null);
    };

    const roomNamed = name => room => room.name === name;

    test('Path to room you\'re already in', () => {
      // Hull Breach itself has unknown exits
      expect(map.path('Hull Breach', hasUnknownExits)).toHaveLength(0);
    });

    test('Path to some other room', () => {
      expect(map.path('Hull Breach', roomNamed('Stables'))).toEqual([
        'east', 'north', 'east'
      ]);
    });

    test('Path not found', () => {
      expect(map.path('Hull Breach', roomNamed('Hot Chocolate Fountain'))).toBe(null);
    });
  });
});
