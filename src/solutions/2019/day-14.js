const { split } = require('../util');

/**
 * # [Advent of Code 2019 Day 14](https://adventofcode.com/2019/day/14)
 *
 * I created a factory object that keeps a running inventory of materials. I
 * initially stock it with `ORE` (`Infinity` for part one, `1000000000000` for
 * part two). I can then submit requests to the factory. The `request()` method
 * accepts the name and quantity of material requested and returns the amount
 * ore consumed by the request. It follows this procedure:
 *
 * 1. Withdraw the requested quantity of the material from the inventory. If
 *    the inventory has the entire requested amount, stop (returning the
 *    quantity if the requested material was `'ORE'`). If the inventory has
 *    less than the requested amount, take out what is available and continue.
 * 2. If the requested material is `'ORE'`, throw an error.
 * 3. Look up the recipe for the requested material.
 * 4. Compute how many times the recipe must be made to produce at least the
 *    remaining amount of the requested material.
 * 5. Compute how much of the material will be produced and how much will be
 *    left over after the material request is fulfilled.
 * 6. For each ingredient in the recipe, request it from the factory in the
 *    amount needed to make the recipe batch. Sum the returned ore consumption
 *    numbers and return the total.
 *
 * For part one, I simply request 1 FUEL from the factory and return the amount
 * of ORE consumed. Part two asks how many FUEL can be made with 1 trillion
 * ORE. You might think this is simply 1 trillion divided by the answer to part
 * one (rounded down), but this figure will actually be low. This is because
 * the production of that first unit of FUEL is done with no materials other
 * than ORE in the inventory. Subsequent units may be cheaper because they can
 * draw from "lefovers" in inventory, so after making that much fuel, there
 * will still be some ORE left over.
 *
 * The solution is to repeat the procedure: estimate how much fuel can be made
 * from the remaining ORE (rounding down) and request that much. If rounding
 * down results in zero FUEL being requested, bump it up to 1. Keep going until
 * the factory throws an error because the remaining ore is inadequate to
 * fulfill the request.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const recipes = parse(input);
  const costPerFuel = computeCostPerFuel(recipes);
  const totalFuel = makeAllFuel(recipes, costPerFuel);
  return [ costPerFuel, totalFuel ];
};

/**
 * Parses the input and produces a `Map` keyed on the names of materials. Each
 * value is an object that contains the `quantity` of the material produced by
 * recipe and an `ingredients` array containing the names and quantities of
 * each ingredient needed to produce the material.
 *
 * @param {string} input - the puzzle input
 * @returns {Map} - the parsed recipes
 */
const parse = input => {
  return split(input).reduce((recipes, line) => {
    let [ ingredients, material ] = line.split(' => ');
    ingredients = ingredients.split(', ').map(parseQuantity);
    material = parseQuantity(material);
    recipes.set(material.name, {
      quantity: material.quantity,
      ingredients,
    });
    return recipes;
  }, new Map());
};

/**
 * Produces the answer to part one: the amount of ORE needed to produce the
 * first unit of FUEL.
 *
 * @param {Map} recipes - the recipes
 * @returns {number} - the amount of ORE needed to produce the first unit of
 * fuel
 */
const computeCostPerFuel = recipes => {
  const factory = buildFactory(recipes, Infinity);
  return factory.request('FUEL', 1);  
};

/**
 * Produces the answer to part two: the amount of FUEL that can be made with
 * 1 trillion ORE. Note that the first unit of FUEL is the most expensive
 * because we start with no leftover materials in inventory.
 *
 * @param {Map} recipes - the recipes
 * @param {number} costPerFuel - the answer from part one, which is the amount
 * of ORE needed to produce the first unit of FUEL
 * @returns {number} - the amount of FUEL produced with 1 trillion ORE
 */
const makeAllFuel = (recipes, costPerFuel) => {
  const factory = buildFactory(recipes, 1000000000000);
  let fuel = 0;

  do {
    let estimatedFuel = Math.floor(factory.getRemainingOre() / costPerFuel);

    if (estimatedFuel === 0) {
      estimatedFuel = 1;
    }

    try {
      factory.request('FUEL', estimatedFuel);
      fuel += estimatedFuel;
    } catch (err) {
      break;
    }
  } while (true);

  return fuel;
};

/**
 * Parses a string in the format `{quantity} {name}` into an object.
 *
 * @param {string} input - the input string
 * @returns {Object} - the parsed object
 */
const parseQuantity = input => {
  const [ quantity, name ] = input.split(' ');
  return { quantity: parseInt(quantity, 10), name };
};

/**
 * Returns a factory object that can produce materials and keep a running
 * inventory of "leftovers".
 *
 * @param {Map} recipes - the recipes
 * @param {number} oreReserves - the starting amount of ORE
 * @returns {Object} - the factory object
 */
const buildFactory = (recipes, oreReserves) => {
  const inventory = new Map();
  inventory.set('ORE', oreReserves);

  /**
   * Requests the given quantity of the named product from inventory. If there
   * isn't enough in stock, it will return whatever is available.
   *
   * @param {string} name - the name of the product to request
   * @param {number} quantity - the quantity of the product to request
   * @returns {number} - the quantity of the product actually received
   */
  const takeInventory = (name, quantity) => {
    const onHand = inventory.get(name) || 0;

    if (onHand >= quantity) {
      inventory.set(name, onHand - quantity);
      return quantity;
    }

    inventory.set(name, 0);
    return onHand;
  };

  /**
   * Stores the given amount of the named product in inventory, in addition to
   * what may already be there.
   *
   * @param {string} name - the name of the product to store
   * @param {number} quantity - the quantity of the product to store
   */
  const storeInventory = (name, quantity) => {
    inventory.set(
      name,
      (inventory.get(name) || 0) + quantity,
    );
  }

  /**
   * Attempts to take the given amount of the named product from inventory. If
   * there isn't enough and the requested product is not `'ORE'`, it will
   * attempt to make more.
   *
   * @param {string} material - the name of the desired product
   * @param {number} qty - the quantity of the desired product
   * @returns {number} - the amount of ore consumed
   * @throws {Error} - if there isn't enough ore
   * @throws {Error} - if there isn't a recipe for the requested product
   */
  const request = (material, qty) => {
    // How many do we have in stock?
    const received = takeInventory(material, qty);

    if (received === qty) {
      // We have enough; just use it.
      if (material === 'ORE') {
        return qty;
      }

      return 0;
    }

    // We need more.
    if (material === 'ORE') {
      // We've run out of ore.
      throw new Error('No more ore');
    }

    qty -= received;
    const recipe = recipes.get(material);

    if (!recipe) {
      throw Error(`No recipe for ${material}`);
    }

    const multiplier = Math.ceil(qty / recipe.quantity);
    const totalMade = multiplier * recipe.quantity;
    const leftOver = totalMade - qty;
    storeInventory(material, leftOver);
    return recipe.ingredients.reduce((oreSpent, ingredient) => {
      const ingredientQty = multiplier * ingredient.quantity;
      oreSpent += request(ingredient.name, ingredientQty);
      return oreSpent;
    }, 0);
  };

  /**
   * Returns the amount of ORE remaining.
   *
   * @returns {number} - the amount of ORE
   */
  const getRemainingOre = () => {
    return inventory.get('ORE');
  };

  return { request, getRemainingOre };
};
