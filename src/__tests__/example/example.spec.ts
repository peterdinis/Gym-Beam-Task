/**
 * Returns the sum of two numbers.
 *
 * @param {number} a - The first number to add.
 * @param {number} b - The second number to add.
 * @returns {number} The result of adding `a` and `b`.
 */
function sum(a: number, b: number): number {
    return a + b;
}

/**
 * Unit test for the `sum` function.
 *
 * This test ensures that calling `sum(1, 2)` correctly returns `3`.
 */
test('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
});
