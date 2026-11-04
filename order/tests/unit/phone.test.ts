import { describe, expect, it } from 'vitest';
import { normalizeEgyptMobile } from '@/lib/phone';

describe('normalizeEgyptMobile', () => {
  it.each([
    ['01001234567', '+201001234567'],
    ['010 0123 4567', '+201001234567'],
    ['+20 100-123-4567', '+201001234567'],
    ['00201112345678', '+201112345678'],
    ['201223334445', '+201223334445'],
    ['1501234567', '+201501234567'],
    ['٠١٠٠١٢٣٤٥٦٧', '+201001234567'],
  ])('normalizes %s', (input, expected) => {
    expect(normalizeEgyptMobile(input)).toBe(expected);
  });

  it.each(['0100123456', '010012345678', '01301234567', '0221234567', '+441234567890', 'abc', ''])(
    'rejects %s',
    (input) => {
      expect(normalizeEgyptMobile(input)).toBeNull();
    },
  );
});
