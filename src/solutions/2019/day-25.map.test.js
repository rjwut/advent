const ShipMap = require('./day-25.map');

let map;

beforeEach(() => {
  map = new ShipMap();
});

describe('2019 Day 25 - map', () => {
  describe('enteredRoom()', () => {
    test('Create first room', () => {
      const room = map.enteredRoom('Hull Breach', [ 'north', 'east', 'south' ]);
      expect(room.name).toBe('Hull Breach');
      expect([ ...room ]).toEqual([
        [ 'north', null ],
        [ 'east', null ],
        [ 'south', null ],
      ]);
    });

    test('Create connections', () => {
      const hullBreach = map.enteredRoom('Hull Breach', [ 'north', 'east', 'south' ]);
      const engineering = map.enteredRoom(
        'Engineering',
        [ 'north', 'east', 'west' ],
        'Hull Breach',
        'east',
      );
      expect(hullBreach.getExit('east')).toBe(engineering);
      expect(engineering.getExit('west')).toBe(hullBreach);
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
      )).toThrow('Hull Breach has no exit to the west');
    });

    test('New room must have an exit in the correct direction', () => {
      map.enteredRoom('Hull Breach', [ 'north', 'east', 'south' ]);
      expect(() => map.enteredRoom(
        'Engineering',
        [ 'north', 'east', 'south' ],
        'Hull Breach',
        'east',
      )).toThrow('Engineering has no exit to the west');
    });
  });

  describe('get()', () => {
    test('Return undefined for unknown room', () => {
      expect(map.get('Hull Breach')).toBeUndefined();
    });

    test('Return known room', () => {
      const hullBreach = map.enteredRoom('Hull Breach', [ 'north', 'east', 'south' ]);
      expect(map.get('Hull Breach')).toBe(hullBreach);
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
      return room[Symbol.iterator]().some(([ , otherRoom ]) => otherRoom === null);
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
