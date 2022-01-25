const CircularLinkedList = require('./circular-linked-list');

describe('CircularLinkedList', () => {
  test('empty', () => {
    const list = new CircularLinkedList();
    expect(list.empty).toBe(true);
    expect(list.size).toBe(0);
    expect(list.peek()).toBeUndefined();
    expect(list.remove()).toBeUndefined();
    expect(Array.from(list)).toHaveLength(0);
  });

  test('insertAfter()', () => {
    const list = new CircularLinkedList();
    list.insertAfter(1);
    expect(list.empty).toBe(false);
    expect(list.peek()).toBe(1);
    const pointer1 = list.createPointer();
    list.insertAfter(2);
    expect(list.peek()).toBe(2);
    list.insertAfter(3);
    expect(list.peek()).toBe(3);
    expect(list.size).toBe(3);
    expect([ ...list ]).toEqual([ 3, 1, 2 ]);
    expect([ ...list.iterator(pointer1) ]).toEqual([ 1, 2, 3 ]);
  });

  test('insertBefore()', () => {
    const list = new CircularLinkedList();
    list.insertBefore(1);
    expect(list.empty).toBe(false);
    expect(list.peek()).toBe(1);
    const pointer1 = list.createPointer();
    list.insertBefore(2);
    expect(list.peek()).toBe(2);
    list.insertBefore(3);
    expect(list.peek()).toBe(3);
    expect(list.size).toBe(3);
    expect([ ...list ]).toEqual([ 3, 2, 1 ]);
    expect([ ...list.iterator(pointer1) ]).toEqual([ 1, 3, 2 ]);
  });

  test('rotate()', () => {
    const list = new CircularLinkedList([ 1, 2, 3, 4, 5, 6, 7 ]);
    list.rotate(3);
    expect([ ...list ]).toEqual([ 4, 5, 6, 7, 1, 2, 3]);
    const pointer1 = list.createPointer();
    list.rotate(-11);
    expect([ ...list ]).toEqual([ 7, 1, 2, 3, 4, 5, 6 ]);
    list.rotate(2, pointer1);
    expect([ ...list ]).toEqual([ 7, 1, 2, 3, 4, 5, 6 ]);
    expect([ ...list.iterator(pointer1) ]).toEqual([ 6, 7, 1, 2, 3, 4, 5 ]);
  });

  test('remove()', () => {
    const list = new CircularLinkedList([ 1, 2, 3, 4 ]);
    expect(list.remove()).toBe(1);
    expect(list.size).toBe(3);
    expect([ ...list ]).toEqual([ 2, 3, 4 ]);
    const pointer1 = list.createPointer();
    list.rotate(1, pointer1);
    list.rotate(2);
    expect(list.remove()).toBe(4);
    expect([ ...list ]).toEqual([ 2, 3 ]);
    expect(list.remove(pointer1)).toBe(3);
    expect(list.remove()).toBe(2);
    expect(list.empty).toBe(true);
  });

  test('Removing a node affects all pointers that point at it', () => {
    const list = new CircularLinkedList([ 1, 2, 3 ]);
    const pointer1 = list.createPointer();
    list.remove();
    expect(list.peek()).toBe(2);
    expect(list.peek(pointer1)).toBe(2);
  });

  test('subsequence()', () => {
    const list = new CircularLinkedList([ 1, 2, 3, 4, 5, 6, 7 ]);
    const pointer1 = list.createPointer();
    list.rotate(4);
    expect(list.subsequence(8)).toEqual([ 5, 6, 7, 1, 2, 3, 4, 5 ]);
    expect(list.subsequence(3, pointer1, true))
      .toEqual([ 1, 7, 6 ]);
  });

  test('Creating and deleting pointers', () => {
    const list = new CircularLinkedList([ 'a', 'b', 'c' ]);
    list.rotate(1);
    const pointer1 = list.createPointer();
    list.rotate(1, pointer1);
    const pointer2 = list.createPointer(pointer1);
    list.rotate(1, pointer2);
    expect(list.peek()).toBe('b');
    expect(list.peek(pointer1)).toBe('c');
    expect(list.peek(pointer2)).toBe('a');
    list.deletePointer(pointer1);
    expect(() => list.peek(pointer1)).toThrow(`No pointer with ID ${pointer1}`);
    expect(() => list.deletePointer(pointer1)).toThrow(`No pointer with ID ${pointer1}`);
    expect(() => list.deletePointer(0)).toThrow('Cannot delete pointer 0');
  });

  test('Reverse iteration', () => {
    const list = new CircularLinkedList([ 1, 2, 3, 4, 5, 6, 7 ]);
    const pointer1 = list.createPointer();
    list.rotate(3);
    expect([ ...list.iterator(0, true) ]).toEqual([ 4, 3, 2, 1, 7, 6, 5 ]);
    expect([ ...list.iterator(pointer1, true) ]).toEqual([ 1, 7, 6, 5, 4, 3, 2 ]);
  });
});
