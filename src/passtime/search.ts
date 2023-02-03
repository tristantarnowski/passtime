/**
 * Find all local maxima of a function f in the interval [x1, x2]
 *
 * @param f The function to maximize
 * @param x1 Lower bound of the search interval
 * @param x2 Upper bound of the search interval
 * @returns An array of (x, y) values
 */
export function findMaxima(f: Function, x1: number, x2: number): [x: number, y: number][] {
    let maxima = [];

    // Naive implementation
    // TODO implement a better search function
    const stepSize = 500;

    let x = x1;

    let y = f(x),
        yPrev = f(x - stepSize),
        yNext = f(x + stepSize);

    while (x <= x2) {
        yNext = f(x + stepSize);

        if (y > yPrev && y > yNext) {
            maxima.push([x, y]);
        }

        yPrev = y;
        y = yNext;
        x += stepSize;
    }

    return maxima;
}

/**
 *
 * @param f The function
 * @param x1
 * @param x2
 * @param val
 */
export function findX(f: Function, x1: number, x2: number, val: number): number[] {
    let results = [];

    const stepSize = 100;

    let x = x1;
    let xPrev = 0,
        yPrev = f(x);

    while (x <= x2) {

        let y = f(x);

        if ((yPrev > val && val > y) || (yPrev < val && val < y)) {
            // TODO check if val is closer to y or yPrev
            results.push(x);
        }

        xPrev = x;
        x += stepSize;
        yPrev = y;
    }

    return results;
}