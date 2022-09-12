/**
 * A `PriorityQueue` enqueues items according to a comparator function provided
 * to the constructor. The comparator function receives two elements and
 * returns a number: a negative number if the first argument should have
 * priority over the second one, a positive number if the second argument
 * should have priority over the first one, or zero if the two arguments have
 * equal priority. Elements with higher priority are dequeued before items with
 * lower priority; elements with equal priority are dequeued in the order in
 * which they were enqueued. Note that the comparator is executed on insertion;
 * no attempt is made to keep items in order which may have changed after
 * insertion.
 */
class PriorityQueue {
  #items = [];
  #comparator;

  /**
   * Creates a new `PriorityQueue` instance using the given comparator
   * function.
   *
   * @param {Function} comparator - the comparator function to use
   */
  constructor(comparator) {
    if (typeof comparator !== 'function') {
      throw new TypeError('The comparator must be a function');
    }

    this.#comparator = comparator;
  }

  /**
   * Enqueues the given element into the queue.
   *
   * @param {*} element - the element to enqueue
   */
  enqueue(element) {
    for (let i = 0; i < this.#items.length; i++) {
      if (this.#comparator(element, this.#items[i]) < 0) {
        this.#items.splice(i, 0, element);
        return;
      }
    }

    this.#items.push(element);
  }

  /**
   * Enqueues all the elements in the given iterable object into the queue.
   *
   * @param {Object} iterable - the items to enqueue
   */
  enqueueAll(iterable) {
    for (const item of iterable) {
      this.enqueue(item);
    }
  }

  /**
   * Dequeues the element with the highest priority from the queue. If the
   * queue is empty, this method returns `undefined`.
   *
   * @returns {*} - the dequeued element, if any
   */
  dequeue() {
    return this.#items.shift();
  }

  /**
   * If the queue is not empty, and the highest priority element passes the
   * given `predicate`, that element will be dequeued and returned. Otherwise,
   * the queue is unmodified and `undefined` is returned.
   *
   * @param {Function} predicate - the predictate to use to test the element
   * @returns {*} - the dequeued element, if any
   */
  dequeueIf(predicate) {
    if (!this.#items.length) {
      return undefined;
    }

    return predicate(this.#items[0]) ? this.#items.shift() : undefined;
  }

  /**
   * Returns the element with the highest priority in the queue, without
   * dequeuing it. If the queue is empty, this method returns `undefined`.
   *
   * @returns {*} - the highest priority element, if any
   */
  peek() {
    return this.#items[0];
  }

  /**
   * Reports whether the queue is empty.
   *
   * @returns {boolean} - `true` if the queue is empty, `false` otherwise
   */
  get empty() {
    return this.#items.length === 0;
  }

  /**
   * Returns the number of elements in the queue.
   *
   * @returns {number} - the number of elements in the queue
   */
  get size() {
    return this.#items.length;
  }

  /**
   * Empties the queue.
   */
  clear() {
    this.#items = [];
  }

  /**
   * Returns an iterator that iterates all the items in the queue in priority
   * order.
   *
   * @returns {Iterator} - the iterator
   */
  *[Symbol.iterator]() {
    yield *this.#items.values();
  }

  /**
   * Reports whether the given element is present in the queue.
   *
   * @param {*} element - the element to find
   * @returns {boolean} - `true` if the element is present; `false` otherwise
   */
  includes(element) {
    return this.#items.includes(element);
  }

  /**
   * Removes the given element from the queue.
   *
   * @param {*} element - the element to remove
   * @returns {boolean} - whether the element was present in the queue
   */
  remove(element) {
    const index = this.#items.indexOf(element);

    if (index === -1) {
      return false;
    }

    return this.#items.splice(index, 1)[0];
  }

  /**
   * Iterates the contents of the queue in priority order, invoking the given
   * callback function for each element.
   *
   * @param {Function} callback - the callback function
   */
  forEach(callback) {
    for (let i = 0; i < this.#items.length; i++) {
      callback(this.#items[i], i, this);
    }
  }

  /**
   * Determines whether all elements in the queue pass the given predicate.
   *
   * @param {Function} predicate - the predicate function
   * @returns {boolean} - `true` if all elements pass; `false` otherwise
   */
  every(predicate) {
    for (let i = 0; i < this.#items.length; i++) {
      if (!predicate(this.#items[i], i, this)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Determines whether any element in the queue passes the given predicate.
   *
   * @param {Function} predicate - the predicate function
   * @returns {boolean} - `true` if any element passes; `false` otherwise
   */
   some(predicate) {
    for (let i = 0; i < this.#items.length; i++) {
      if (predicate(this.#items[i], i, this)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Produces a new `PriorityQueue` instance containing only the elements from
   * this `PriorityQueue` that pass the given predicate. The new
   * `PriorityQueue` uses the same comparator function as this one.
   *
   * @param {Function} predicate - the predicate function
   * @returns {PriorityQueue} - the new `PriorityQueue` instance
   */
  filter(predicate) {
    const clone = new PriorityQueue(this.#comparator);

    for (let i = 0; i < this.#items.length; i++) {
      const item = this.#items[i];

      if (predicate(item, i, this)) {
        clone.#items.push(item);
      }
    }

    return clone;
  }

  /**
   * Returns the first element in the queue that passes the given predicate, or
   * `undefined` if no element passes.
   *
   * @param {Function} predicate - the predicate function
   * @returns {*} - the first element that passes the predicate, or `undefined`
   * if no element passes
   */
  find(predicate) {
    for (let i = 0; i < this.#items.length; i++) {
      const item = this.#items[i];

      if (predicate(item, i, this)) {
        return item;
      }
    }

    return undefined;
  }

  /**
   * Returns the elements in the `PriorityQueue` concatenated into a string,
   * delimited by the given separator. If `separator` is not provided, `','` is
   * used by default.
   *
   * @param {string} [separator=','] - the separator to use 
   * @returns {string} - the concatenated string
   */
  join(separator = ',') {
    return this.#items.join(separator);
  }

  /**
   * Returns a new `PriorityQueue` instance and populates it with the results
   * of passing each element through the given `callback` function. Note that
   * the resulting values may be reordered by the new `PriorityQueue`'s
   * comparator. You may specify a different comparator for the new
   * `PriorityQueue`; if you do not, it will use the same comparator as this
   * `PriorityQueue`.
   *
   * @param {Function} callback - the callback function
   * @param {Function} [comparator] - the comparator to use for the new
   * `PriorityQueue`
   * @returns {PriorityQueue} - the new `PriorityQueue` instance
   */
  map(callback, comparator) {
    const mapped = new PriorityQueue(comparator ?? this.#comparator);

    for (let i = 0; i < this.#items.length; i++) {
      mapped.enqueue(callback(this.#items[i], i, this));
    }

    return mapped;
  }

  /**
   * Returns a new array populated with the results of passing each element
   * through the given `callback` function. The resulting values will be in the
   * same order as their corresponding values in the original `PriorityQueue`.
   *
   * @param {Function} callback - the callback function
   * @returns {Array} - the new array
   */
  mapToArray(callback) {
    const mapped = new Array(this.#items.length);

    for (let i = 0; i < this.#items.length; i++) {
      mapped[i] = callback(this.#items[i], i, this);
    }

    return mapped;
  }

  /**
   * Processes each element in the queue in priority order, calling the given
   * `callback` function for each element. The `callback` function receives an
   * accumulator value (initialized to `initialValue`) and the current element,
   * and returns the new accumulator value. When iteration is complete, the
   * final accumulator value is returned.
   *
   * If `initialValue` is not specified, the first element in the queue is used
   * as the first accumulator value, and iteration starts with the second
   * element. An `Error` will be thrown if no `initialValue` is provided when
   * invoking `reduce()` on an empty `PriorityQueue`.
   *
   * @param {Function} callback - the callback function
   * @param {*} initialValue - the initial accumulator value
   * @returns {*} - the final accumulator value
   */
  reduce(callback, initialValue) {
    let accumulator = initialValue;
    let i = 0;

    if (initialValue === undefined) {
      if (this.#items.length === 0) {
        throw new Error('Reduce of empty queue with no initial value');
      }

      accumulator = this.#items[0];
      i = 1;
    }

    for ( ; i < this.#items.length; i++) {
      accumulator = callback(accumulator, this.#items[i], i, this);
    }

    return accumulator;
  }
}

module.exports = PriorityQueue;
