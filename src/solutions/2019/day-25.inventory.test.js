const buildInventory = require('./day-25.inventory');

const UNSAFE_ITEMS = [
  'escape pod',
  'giant electromagnet',
  'infinite loop',
  'molten lava',
  'photons', 
];

let inventory;

beforeEach(() => {
  inventory = buildInventory();
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
          inventory.take(`item ${i}`);
        }
      });
  
      test('Can produce commands for permutations', () => {
        expect(inventory.permutation(0)).toEqual([
          'drop item 0',
          'drop item 1',
          'drop item 2',
          'drop item 3',
          'drop item 4',
          'drop item 5',
          'drop item 6',
          'drop item 7',
        ]);
        inventory.drop('item 2');
        inventory.drop('item 3');
        inventory.drop('item 7');
        expect(inventory.permutation(0)).toEqual([
          'drop item 0',
          'drop item 1',
          'drop item 4',
          'drop item 5',
          'drop item 6',
        ]);
        inventory.drop('item 0');
        inventory.drop('item 1');
        inventory.drop('item 4');
        inventory.drop('item 5');
        inventory.drop('item 6');
        expect(inventory.permutation(0)).toHaveLength(0);
        inventory.take('item 3');
        expect(inventory.permutation(3)).toEqual([
          'drop item 3',
          'take item 6',
          'take item 7',
        ]);
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
