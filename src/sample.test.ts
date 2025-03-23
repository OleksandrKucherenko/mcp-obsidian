import { describe, it, expect } from 'vitest';

// This is a simple sample test to verify Vitest is working
describe('Sample test suite', () => {
  it('should pass a simple test', () => {
    expect(true).toBe(true);
  });

  it('should handle basic math', () => {
    expect(1 + 1).toBe(2);
  });
});
