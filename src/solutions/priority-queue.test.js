const PriorityQueue = require('./priority-queue');

const SORT_ASC = (a, b) => a - b;
const SORT_DESC = (a, b) => b - a;

test('Test basic functionality', () => {
  const LENGTH = 50;

  // Create new queue
  let queue = new PriorityQueue(SORT_ASC);
  expect(queue.empty).toBe(true);
  expect(queue.size).toBe(0);
  expect(queue.peek()).toBeUndefined(undefined);

  // Load it up with values in ascending order
  const values = new Array(LENGTH).fill(0).map((_, i) => i);
  queue.enqueueAll(values);
  expect(queue.empty).toBe(false);
  expect(queue.size).toBe(LENGTH);
  expect(queue.peek()).toBe(0);

  // Dequeue all values; should be in the same order
  expect(queue.dequeueAll()).toEqual(values);
  expect(queue.empty).toBe(true);
  expect(queue.size).toBe(0);
  expect(queue.peek()).toBeUndefined();

  // Enqueue in descending order; should still dequeue in ascending order
  queue.enqueueAll(values.sort(SORT_DESC));
  expect(queue.peek()).toBe(0);
  expect(queue.dequeueAll()).toEqual(values.sort(SORT_ASC));

  // Create a PriorityQueue that sorts in descending order; should dequeue in that order
  queue = new PriorityQueue(SORT_DESC);
  queue.enqueueAll(values);
  expect(queue.peek()).toBe(LENGTH - 1);
  expect(queue.dequeueAll()).toEqual(values.sort(SORT_DESC));

  // Empty the queue with clear()
  queue.clear();
  expect(queue.empty).toBe(true);
  expect(queue.size).toBe(0);
  expect(queue.peek()).toBeUndefined();
});

test('Removing elements', () => {
  const queue = new PriorityQueue(SORT_ASC);
  queue.enqueueAll([ 9, 8, 7, 6, 5, 4, 3, 2, 1, 0 ]);
  queue.remove(7);
  queue.remove(1);
  expect(queue.size).toBe(8);
  expect(queue.dequeueAll()).toEqual([ 0, 2, 3, 4, 5, 6, 8, 9 ]);
});

test('Cloning a queue should produce an identical but separate queue', () => {
  const queue = new PriorityQueue(SORT_ASC);
  queue.enqueueAll([ 0, 1, 2, 3, 4 ]);
  const clone = queue.clone();
  expect(clone).not.toBe(queue);
  expect(clone.dequeueAll()).toEqual(queue.dequeueAll());
});

test('Conditional dequeue', () => {
  const queue = new PriorityQueue(SORT_ASC);
  queue.enqueueAll([ 0, 1 ]);
  const isOdd = value => value % 2 === 1;
  expect(queue.dequeueIf(isOdd)).toBeUndefined();
  expect(queue.size).toBe(2);
  queue.dequeue();
  expect(queue.dequeueIf(isOdd)).toBe(1);
  expect(queue.empty).toBe(true);
});

test('Queue is iterable', () => {
  const values = [ 0, 1, 2, 3, 4 ];
  const queue = new PriorityQueue(SORT_ASC);
  queue.enqueueAll(values);
  expect([ ...queue ]).toEqual(values);
  expect(queue.size).toBe(values.length);
});

test('Iterate queue with values()', () => {
  const values = [ 0, 1, 2, 3, 4 ];
  const queue = new PriorityQueue(SORT_ASC);
  queue.enqueueAll(values);
  const iterator = queue.values();
  let next, iterated = [];

  do {
    next = iterator.next();

    if (next.done) {
      break;
    }

    iterated.push(next.value);
  } while (true);

  expect(iterated).toEqual(values);
});

test('find()', () => {
  const values = [ 4, 3, 2, 1, 0 ];
  const isOdd = value => value % 2 === 1;
  const alwaysFail = () => false;
  const queue = new PriorityQueue(SORT_ASC);
  queue.enqueueAll(values);
  expect(queue.find(isOdd)).toBe(1);
  expect(queue.find(alwaysFail)).toBeUndefined();
  expect(queue.size).toBe(values.length);
});
