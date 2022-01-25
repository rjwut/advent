/**
 * A data structure containing elements linked in a circle. When you first
 * create an instance of this class, it is empty and has a single pointer.
 * When you add an element to an empty list, the pointer points to it. Each
 * element you insert has references to the previous and next elements in the
 * list. You can rotate the pointer around the list, examine or remove the
 * element at the pointer, and insert new elements before or after the element
 * at the pointer.
 *
 * The pointer you start out with has an ID of `0`, and by default all
 * operations work on this pointer. At any time, you can create a new pointer
 * at the same position as any existing pointer. The new pointer will be
 * assigned a unique ID, which you can use to refer to it. Any method which
 * does something involving a pointer accepts an optional `pointerId`
 * parameter; which defaults to `0`. You can also delete pointers when you're
 * done with them, except for pointer `0`. Pointers always point to some
 * element in the list as long as the list isn't empty.
 */
class CircularLinkedList {
  #pointers = new Map();
  #nextPointerId = 1;
  #size = 0;

  /**
   * Creates a new `CircularLinkedList` instance. If the `iterable` argument is
   * specified, all the values from `iterable` are inserted into the list in
   * order, and the pointer is set to the position of the first element.
   *
   * @param {Object} [iterable] - the values to insert into the list
   */
  constructor(iterable) {
    this.#pointers.set(0, null);

    if (iterable === undefined) {
      return;
    }

    for (const element of iterable) {
      this.insertAfter(element);
    }

    this.rotate(1, 0);
  }

  /**
   * Indicates whether the list is empty.
   *
   * @returns {boolean} - `true` if empty; `false` otherwise
   */
  get empty() {
    return this.#size === 0;
  }

  /**
   * Gives the number of elements in the list.
   *
   * @returns {number} - the number of elements in the list
   */
  get size() {
    return this.#size;
  }

  /**
   * Returns the pointer's current element, or `undefined` if the list is
   * empty.
   *
   * @param {number} [pointerId=0] - the ID of the pointer to use
   * @returns {*} - the element at the current pointer position
   * @throws {Error} - if `pointerId` is not a valid pointer ID
   */
  peek(pointerId = 0) {
    return this.#size === 0 ? undefined : this.#get(pointerId).value;
  }

  /**
   * Moves the pointer forward `offset` positions (backward if `offset` is
   * negative). If the list has less than two elements, nothing happens.
   *
   * @param {number} offset - the number of positions to move the pointer
   * @param {number} [pointerId=0] - the ID of the pointer to move
   * @throws {Error} - if `pointerId` is not a valid pointer ID
   */
  rotate(offset, pointerId = 0) {
    if (offset === 0 || this.#size < 2) {
      return;
    }

    const dir = Math.sign(offset) === 1 ? 'next' : 'prev';
    offset = Math.abs(offset) % this.#size;
    let node = this.#get(pointerId)

    for (let i = 0; i < offset; i++) {
      node = node[dir];
    }

    this.#pointers.set(pointerId, node);
  }

  /**
   * Inserts a new element after the element at the current pointer position.
   * After inserting an element, the pointer is moved to that new element. If
   * the list was empty, all pointers are moved to the new element.
   *
   * @param {*} element - the element to insert
   * @param {number} [pointerId=0] - the ID of the pointer to use
   * @throws {Error} - if `pointerId` is not a valid pointer ID
   */
  insertAfter(element, pointerId = 0) {
    const before = this.#get(pointerId);
    const after = before?.next;
    this.#insertBetween(element, before, after, pointerId);
  }

  /**
   * Inserts a new element before the element at the current pointer position.
   * After inserting an element, the pointer is moved to that new element. If
   * the list was empty, all pointers are moved to the new element.
   *
   * @param {*} element - the element to insert
   * @param {number} [pointerId=0] - the ID of the pointer to use
   * @throws {Error} - if `pointerId` is not a valid pointer ID
   */
  insertBefore(element, pointerId = 0) {
    const after = this.#get(pointerId);
    const before = after?.prev;
    this.#insertBetween(element, before, after, pointerId);
  }

  /**
   * Removes and returns the current element. All pointers that pointed at the
   * removed element are shifted to the next element. If the list is empty
   * after the removal, all pointers point at nothing. If the list was empty
   * before the removal, nothing happens and this method returns `undefined`.
   *
   * @param {number} [pointerId=0] - the ID of the pointer to use
   * @returns {*} - the removed element
   */
  remove(pointerId = 0) {
    if (this.#size === 0) {
      return undefined;
    }

    const removed = this.#get(pointerId);

    if (this.#size === 1) {
      for (let id of this.#pointers.keys()) {
        this.#pointers.set(id, null);
      }
    } else {
      removed.prev.next = removed.next;
      removed.next.prev = removed.prev;

      for (let [ id, node ] of this.#pointers.entries()) {
        if (node === removed) {
          this.#pointers.set(id, removed.next);
        }
      }
    }

    this.#size--;
    return removed.value;
  }

  /**
   * Returns an array containing `count` elements, starting at the pointer's
   * current element, and continuing forward (or backward if `reverse` is true)
   * until `count` elements have been collected. The same element will appear
   * multiple times if `count` is larger than the list's `size`. If the list is
   * empty, `subsequence()` will throw an `Error`.
   *
   * @param {number} count - the number of elements to collect
   * @param {number} [pointerId=0] - the ID of the pointer to use
   * @param {boolean} reverse - whether to navigate the list backwards
   */
  subsequence = (count, pointerId = 0, reverse = false) => {
    if (this.#size === 0) {
      throw new Error('Cannot get subsequence of empty list');
    }

    const dir = reverse ? 'prev' : 'next';
    let node = this.#get(pointerId);
    const subsequence = [];

    for (let i = 0; i < count; i++) {
      subsequence.push(node.value);
      node = node[dir];
    }

    return subsequence;
  }

  /**
   * Creates a new pointer at the same position as the pointer with the given
   * ID.
   *
   * @param {number} fromId - the ID of an existing pointer to copy
   * @returns {number} - the ID of the new pointer
   */
  createPointer(fromId = 0) {
    this.#pointers.set(this.#nextPointerId, this.#pointers.get(fromId));
    return this.#nextPointerId++;
  }

  /**
   * Deletes the pointer with the given ID. The element to which it points is
   * left untouched. An `Error` will be thrown if you attempt to delete pointer
   * 0.
   *
   * @param {number} pointerId - the ID of the pointer to delete
   * @throws {Error} - if `pointerId` is not a valid pointer ID
   * @throws {Error} - if `pointerId` is `0`
   */
  deletePointer(pointerId) {
    if (pointerId === 0) {
      throw new Error('Cannot delete pointer 0');
    }

    if (!this.#pointers.has(pointerId)) {
      throw new Error(`No pointer with ID ${pointerId}`);
    }

    this.#pointers.delete(pointerId);
  }

  /**
   * Method for standard iterable protocol. This will iterate each element in
   * the list, starting from the current position of pointer 0, and moving
   * forward around the list until all elements have been visited.
   *
   * @returns {Iterator} - an iterator that yields the elements in the list
   */
  *[Symbol.iterator]() {
    yield *this.iterator();
  }

  /**
   * Iterator function that allows you to iterate over the circular list from
   * any pointer and in either direction.
   *
   * @param {number} [pointerId=0] - the ID of the pointer to use
   * @param {boolean} [reverse=false] - whether to iterate in reverse
   * @returns {Iterator} - an iterator that yields the elements in the list
   * @throws {Error} - if `pointerId` is not a valid pointer ID
   */
  *iterator(pointerId = 0, reverse = false) {
    if (this.#size === 0) {
      return;
    }

    const startNode = this.#get(pointerId);
    let node = startNode;

    do {
      yield node.value;
      node = node[reverse ? 'prev' : 'next'];
    } while (node !== startNode);
  }

  /**
   * Returns the node at which the pointer with the given ID points. If there's
   * no such pointer, an `Error` is thrown.
   *
   * @param {number} pointerId - the ID of the pointer 
   * @returns {Object|null} - the pointer's node, or `null` if the list is
   * empty
   */
  #get(pointerId) {
    const node = this.#pointers.get(pointerId);

    if (node === undefined) {
      throw new Error(`No pointer with ID ${pointerId}`);
    }

    return node;
  }

  /**
   * Creates a new node for the given element, inserts it between the two given
   * nodes, and points the pointer with the given ID at it. If the insertion
   * happens while the list is empty, all pointers are moved to the new node.
   *
   * @param {*} element - the element to insert
   * @param {Object} before - the node before the new node
   * @param {Object} after - the node after the new node
   * @param {number} pointerId - the ID of the pointer used to insert
   */
  #insertBetween(element, before, after, pointerId) {
    const node = { value: element };

    if (before) {
      node.prev = before;
      node.next = after;
      before.next = node;
      after.prev = node;
      this.#pointers.set(pointerId, node);
    } else {
      for (let id of this.#pointers.keys()) {
        this.#pointers.set(id, node);
      }

      node.next = node;
      node.prev = node;
    }

    this.#size++;
  }
}

module.exports = CircularLinkedList;
