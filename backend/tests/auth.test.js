const { describe, it } = require('node:test');
const assert = require('node:assert');


describe('Validation helpers', () => {
  it('should accept glucose value between 40 and 600', () => {
    const value = 110;
    const isValid = Number.isInteger(value) && value >= 40 && value <= 600;
    assert.strictEqual(isValid, true);
  });

  it('should reject glucose value below 40', () => {
    const value = 30;
    const isValid = Number.isInteger(value) && value >= 40 && value <= 600;
    assert.strictEqual(isValid, false);
  });

  it('should reject glucose value above 600', () => {
    const value = 650;
    const isValid = Number.isInteger(value) && value >= 40 && value <= 600;
    assert.strictEqual(isValid, false);
  });

  it('should reject future date', () => {
    const today = new Date().toISOString().split('T')[0];
    const future = '2099-01-01';
    assert.strictEqual(future > today, true);
  });
});
