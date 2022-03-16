import { intersect, groupBy, mapObjectValues } from '../js-utils';

describe('js-utils: intersect', () => {
  test('intersect 0 sets', () => {
    const res = intersect([]);
    expect(res).toBeInstanceOf(Set);
    expect(res.size).toEqual(0);
  });

  test('intersect sets', () => {
    const res = intersect([new Set([1, 2, 3]), new Set([1]), new Set([1, 3])]);
    expect(res).toBeInstanceOf(Set);
    expect(Array.from(res.values())).toEqual([1]);
  });
});

describe('js-utils: groupBy', () => {
  test('simple groupBy', () => {
    const res = groupBy([{ type: 'string' }, { type: 'string' }, { type: 'number' }], 'type');
    expect(Object.keys(res)).toEqual(['string', 'number']);
    expect(res.number).toHaveLength(1);
    expect(res.string).toHaveLength(2);
  });
});

describe('js-utils: mapObjectValues', () => {
  test('undefined', () => {
    expect(mapObjectValues(undefined, () => {})).toBeUndefined();
  });

  test('simple map', () => {
    expect(mapObjectValues({ a: 'test' }, (k, v) => k + '_' + v)).toEqual({ a: 'a_test' });
  });
});
