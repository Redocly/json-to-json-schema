import { isNull, getJsonSchemaType, formatNull, formatExample } from '../utils';

describe('utils: isNull', () => {
  test('draft-05', () => {
    expect(isNull({ type: 'string', nullable: true }, 'draft-05-oas')).toBeTruthy();
    expect(isNull({ type: 'string' }, 'draft-05-oas')).toBeFalsy();
  });

  test('draft-2020-12', () => {
    expect(isNull({ type: 'null' }, 'draft-2020-12')).toBeTruthy();
    // @ts-ignore
    expect(isNull({ type: ['string', 'null'] }, 'draft-2020-12')).toBeTruthy();
    expect(isNull({ type: 'integer' }, 'draft-2020-12')).toBeFalsy();
  });

  test('invalid draft', () => {
    // @ts-expect-error
    expect(isNull({ type: ['string', 'null'], nullable: true }, 'wrong-draft')).toBeFalsy();
  });
});

describe('utils: getJsonSchemaType', () => {
  test('object which set', () => {
    expect(() => getJsonSchemaType(new Set())).toThrow();
  });

  test('object which function', () => {
    expect(() => getJsonSchemaType(() => {})).toThrow();
  });
});

describe('utils: formatNull', () => {
  test('invalid draft', () => {
    // @ts-expect-error
    expect(formatNull('wrong-draft')).toEqual({});
  });
});


describe('utils: formatExample', () => {
  test('invalid draft', () => {
    // @ts-expect-error
    expect(formatExample('test', 'wrong-draft')).toEqual({});
  });
});
