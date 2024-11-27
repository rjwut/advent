/**
 * `PriorityQueue` sorts elements on insertion according to a provided comparator function. This
 * function receives two elements and returns a number: a negative number if the first argument
 * should have priority over the second one, a positive number if the second argument should have
 * priority over the first one, or zero if the two arguments have equal priority. Elements with
 * higher priority are dequeued before items with lower priority. The dequeue order of elements
 * with equal priority is undefined. Note that element priority is not monitored for changes after
 * insertion.
 *
 * This class was implemented using a [binary heap](https://en.wikipedia.org/wiki/Binary_heap).
 * This has performance advantages: values can be enqueued or dequeued with a worst case time
 * complexity of O(log n).
 */
class PriorityQueue {
  #comparator;
  #heap;

  /**
   * Creates a new `PriorityQueue` instance using the given comparator function.
   *
   * @param {Function} comparator - the comparator function to use
   */
  constructor(comparator) {
    if (typeof comparator !== 'function') {
      throw new TypeError('The comparator must be a function');
    }

    this.#comparator = comparator;
    this.#heap = [ null ];
  }

  /**
   * @returns {boolean} - `true` if the queue is empty, `false` otherwise
   */
  get empty() {
    return this.#heap.length === 1;
  }

  /**
   * @returns {number} - the number of elements in the queue
   */
  get size() {
    return this.#heap.length - 1;
  }

  /**
   * Empties the queue.
   */
  clear() {
    this.#heap = [ null ];
  }

  /**
   * Produces a shallow copy of this `PriorityQueue`. The order of elements is not changed, even if
   * their priorities have changed since insertion. If you wish to re-order elements because of
   * priority changes, create a new `PriorityQueue` and pass this `PriorityQueue` into its
   * `enqueueAll()` method.
   *
   * @returns {PriorityQueue} - the clone
   */
  clone() {
    const clone = new PriorityQueue(this.#comparator);
    clone.#heap = [ ...this.#heap ];
    return clone;
  }

  /**
   * Dequeues the element with the highest priority from the queue. If the queue is empty, this
   * method returns `undefined`.
   *
   * @returns {*} - the dequeued element, if any
   */
  dequeue() {
    if (this.#heap.length === 1) {
      return undefined;
    }

    const toReturn = this.#heap[1];
    const element = this.#heap.pop();

    if (this.#heap.length === 1) {
      return toReturn;
    }

    this.#heap[1] = element;
    this.#siftDown(1);
    return toReturn;
  }

  /**
   * Dequeues all elements from this `PriorityQueue` and returns them in an array in the order they
   * were dequeued.
   *
   * @returns {Array} - the dequeued elements
   */
  dequeueAll() {
    const dequeued = [];

    while (this.size) {
      dequeued.push(this.dequeue());
    }

    return dequeued;
  }

  /**
   * Conditionally dequeues the next element if it passes the given predicate. If the queue is
   * empty or the element does not pass the predicate, this method returns `undefined`.
   *
   * @param {Function} predicate - the predicate to use to test the next element
   * @returns {*} - the dequeued element, or `undefined` if no element was dequeued
   */
  dequeueIf(predicate) {
    if (this.#heap.length === 1 || !predicate(this.#heap[1])) {
      return undefined;
    }

    return this.dequeue();
  }

  /**
   * Enqueues the given element into the queue.
   *
   * @param {*} element - the element to enqueue
   * @throws {TypeError} - if `element` is `undefined`
   * @throws {Error} - if the comparator function throws an error
   */
  enqueue(element) {
    if (element === undefined) {
      throw new TypeError('Cannot enqueue undefined');
    }

    this.#heap.push(element);
    this.#siftUp(this.#heap.length - 1);
  }

  /**
   * Enqueues all the elements in the given `Iterable` into the queue.
   *
   * @param {Iterable} iterable - the `Iterable` containing the items to enqueue
   * @throws {TypeError} - if `interable` contains `undefined`
   * @throws {Error} - if the comparator function throws an error
   */
  enqueueAll(iterable) {
    for (const item of iterable) {
      this.enqueue(item);
    }
  }

  /**
   * Returns the highest priority element that matches the given predicate.
   *
   * @param {Function} predicate - the predicate to use to test the elements
   * @returns {*} - the found element, or `undefined` if no matching element is found
   */
  find(predicate) {
    for (const element of this) {
      if (predicate(element)) {
        return element;
      }
    }

    return undefined;
  }

  /**
   * Returns the element with the highest priority in the queue, without dequeuing it. If the queue
   * is empty, this method returns `undefined`.
   *
   * @returns {*} - the highest priority element, if any
   */
  peek() {
    return this.#heap[1];
  }

  /**
   * Removes the given element from the `PriorityQueue` if it exists.
   *
   * @param {*} element - the element to remove
   * @returns {boolean} - `true` if the element was removed, `false` if it wasn't present
   */
  remove(element) {
    const i = this.#heap.indexOf(element);

    if (i === -1) {
      return false;
    }

    if (i === this.#heap.length - 1) {
      this.#heap.pop();
      return true;
    }

    this.#heap[i] = this.#heap.pop();
    this.#sift(i);
    return true;
  }

  /**
   * Returns an iterator that iterates all elements in the queue in priority order. The elements
   * are not dequeued.
   *
   * @returns {Iterator} - the iterator
   */
  values() {
    return this[Symbol.iterator]();
  }

  /**
   * Returns an iterator that iterates all elements in the queue in priority order. The elements
   * are not dequeued.
   *
   * @returns {Iterator} - the iterator
   */
  [Symbol.iterator]() {
    const clone = this.clone();

    return {
      next: () => ({
        done: clone.empty,
        value: clone.dequeue(),
      }),
    };
  }

  /**
   * Moves the node at the given index to its correct position.
   *
   * @param {number} i - the index of the element to move
   */
  #sift(i) {
    if (i !== 1 && this.#comparator(this.#heap[i >> 1], this.#heap[i]) > 0) {
      i = this.#siftUp(i);
    }

    this.#siftDown(i);
  }

  /**
   * Sifts the node at the given index down the heap until it is in the correct position. Assumes
   * that it is either already in the correct position, or that the correct position is lower in
   * the heap.
   *
   * @param {number} i - the index of the element to move
   * @returns {number} - the index it ended up at
   */
  #siftDown(i) {
    const element = this.#heap[i];

    while (true) {
      const iLeft = i << 1;

      if (iLeft >= this.#heap.length) {
        break;
      }

      let j;
      const iRight = iLeft + 1;

      if (iRight >= this.#heap.length || this.#comparator(this.#heap[iLeft], this.#heap[iRight]) < 0) {
        j = iLeft;
      } else {
        j = iRight;
      }

      if (this.#comparator(element, this.#heap[j]) < 0) {
        break;
      }

      this.#heap[i] = this.#heap[j];
      i = j;
    }

    this.#heap[i] = element;
    return i;
  }

  /**
   * Sifts the node at the given index up the heap until it is in the correct position. Assumes
   * that it is either already in the correct position, or that the correct position is higher in
   * the heap.
   *
   * @param {number} i - the index of the element to move
   * @returns {number} - the index it ended up at
   */
  #siftUp(i) {
    const element = this.#heap[i];

    while (true) {
      const j = i >> 1;

      if (i === 1 || this.#comparator(this.#heap[j], element) <= 0) {
        this.#heap[i] = element;
        break;
      }

      this.#heap[i] = this.#heap[j];
      i = j;
    }

    return i;
  }
}

module.exports = PriorityQueue;
