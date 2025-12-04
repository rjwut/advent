const Inventory = require('./day-25.inventory');

const UNSAFE_ITEMS = [
  'escape pod',
  'giant electromagnet',
  'infinite loop',
  'molten lava',
  'photons',
];

let inventory;

beforeEach(() => {
  inventory = new Inventory();
});

describe('2019 Day 25 - inventory', () => {
  test('isSafe()', () => {
    expect(inventory.isSafe('pool noodle')).toBe(true);
    expect(inventory.isSafe('photons')).toBe(false);
  });

  describe('take()', () => {
    test('Can take items', () => {
      expect(() => inventory.take('pool noodle')).not.toThrow();
    });

    test.each(UNSAFE_ITEMS)('Can\'t take unsafe items', item => {
      expect(() => inventory.take(item)).toThrow(`Not safe to take ${item}`);
    });

    test('Can\'t take items already held', () => {
      inventory.take('pool noodle');
      expect(() => inventory.take('pool noodle')).toThrow('Already holding pool noodle');
    });
  });

  describe('drop()', () => {
    test('Can drop held items', () => {
      inventory.take('pool noodle');
      expect(() => inventory.drop('pool noodle')).not.toThrow();
    });

    test('Can\'t drop items not held', () => {
      expect(() => inventory.drop('pool noodle')).toThrow('Not holding pool noodle');
    });
  });

  test('foundAllSafeItems()', () => {
    for (let i = 0; i < 7; i++) {
      inventory.take(`item ${i}`);
    }

    expect(inventory.foundAllSafeItems()).toBe(false);
    inventory.take('item 7');
    expect(inventory.foundAllSafeItems()).toBe(true);
  });

  describe('permutation()', () => {
    describe('Having discovered all safe items', () => {
      beforeEach(() => {
        for (let i = 0; i < 8; i++) {
          inventory.take(`item${i}`);
        }
      });

      test('Can produce commands for permutations', () => {
        expect(inventory.permutation(0)).toBeNull();
        expect(inventory.permutation(1)).toBe('drop item0');
        expect(inventory.permutation(2)).toBe('drop item2');
        expect(inventory.permutation(3)).toBe('take item0');
      });

      test('Running the full set of permutations does not cause any errors', () => {
        for (let i = 0; i < 256; i++) {
          expect(() => {
            const command = inventory.permutation(i);

            if (command) {
              const [ action, item ] = command.split(' ');

              if (action === 'take') {
                inventory.take(item);
              } else {
                inventory.drop(item);
              }
            }
          }).not.toThrow();
        }
      });

      test('Permutation out of range throws', () => {
        expect(() => inventory.permutation(-1)).toThrow('Permutation out of range: -1');
        expect(() => inventory.permutation(256)).toThrow('Permutation out of range: 256');
      })
    });

    test('Must discover all safe items first', () => {
      expect(() => inventory.permutation(0)).toThrow('Haven\'t found all safe items yet');
    });
  });

  test('toArray()', () => {
    expect(inventory.toArray()).toEqual([]);
    inventory.take('pool noodle');
    expect(inventory.toArray()).toEqual([ 'pool noodle' ]);
    inventory.take('pho');
    expect(inventory.toArray()).toEqual([ 'pool noodle', 'pho' ]);
    inventory.drop('pool noodle');
    expect(inventory.toArray()).toEqual([ 'pho' ]);
  });
});
