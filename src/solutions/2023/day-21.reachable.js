const Directions = [
  { dr: -1, dc:  0 },
  { dr:  1, dc:  0 },
  { dr:  0, dc: -1 },
  { dr:  0, dc:  1 },
];

/**
 * Compute how many positions are reachable in the given `SimpleGrid` in the indicated number of
 * steps.
 *
 * @param {SimpleGrid} grid - the grid to evaluate
 * @param {Object} start - the start position (`{r, c}`)
 * @param {Array<number>} steps - the step counts to report on
 * @returns {Array<number>} - the number of reachable positions corresponding to each `steps` entry
 */
module.exports = (grid, start, steps) => {
  const maxSteps = Math.max(...steps);
  const reached = new Array(steps.length).fill(null);
  const reachedSoFar = [ 1, 0 ];
  const visited = new Set();
  visited.add(`${start.r},${start.c}`);
  let frontier = [ start ];
  let step = 0;

  do {
    const parity = ++step % 2;
    const nextFrontier = [];

    for (const { r, c } of frontier) {
      Directions.forEach(({ dr, dc }) => {
        const nr = r + dr;
        const nc = c + dc;

        if (!grid.inBounds(nr, nc) || grid.get(nr, nc) === '#') {
          return;
        }

        const key = `${nr},${nc}`;

        if (visited.has(key)) {
          return;
        }

        reachedSoFar[parity]++;
        visited.add(key);
        nextFrontier.push({ r: nr, c: nc });
      });
    }

    const stepIndex = steps.indexOf(step);

    if (stepIndex !== -1) {
      reached[stepIndex] = reachedSoFar[parity];
    }

    frontier = nextFrontier;
  } while (step < maxSteps);

  return reached;
};
