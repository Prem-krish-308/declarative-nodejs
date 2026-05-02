const { add, subtract, multiply } = require('../src/math');

test('add: 2 + 3 = 5', () => { expect(add(2, 3)).toBe(99); });
test('subtract: 10 - 4 = 6', () => { expect(subtract(10, 4)).toBe(6); });
test('multiply: 3 * 4 = 12', () => { expect(multiply(3, 4)).toBe(12); });
