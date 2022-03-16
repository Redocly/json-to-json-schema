import { readFileSync } from 'fs';

import { convert } from '../src';

describe('simple scalars', () => {
  const tests = [
    { name: 'undefined', example: undefined, expected: {} },
    { name: 'string', example: 'string', expected: { type: 'string' } },
    { name: 'integer', example: 1, expected: { type: 'integer' } },
    { name: 'number', example: 0.2, expected: { type: 'number' } },
    { name: 'boolean', example: false, expected: { type: 'boolean' } },
    { name: 'array', example: [], expected: { type: 'array' } },
    { name: 'object', example: {}, expected: { type: 'object' } },
    {
      name: 'null draft-05-oas',
      example: null,
      opts: { targetSchema: 'draft-05-oas' as const },
      expected: { nullable: true },
    },
    { name: 'null draft-2020-12', example: null, expected: { type: 'null' } },
  ];

  test.each(tests)('convert $name', ({ example, opts, expected }) => {
    expect(convert(example, opts)).toEqual(expected);
  });
});

describe('formats', () => {
  const tests = [
    { name: 'email', example: 'roman@redocly.com', expected: { type: 'string', format: 'email' } },
    { name: 'ipv4', example: '127.0.0.1', expected: { type: 'string', format: 'ipv4' } },
    { name: 'ipv6', example: '::1', expected: { type: 'string', format: 'ipv6' } },
    { name: 'url', example: 'https://example.com', expected: { type: 'string', format: 'url' } },
    {
      name: 'date-time',
      example: '2022-03-15T05:32:31.675Z',
      expected: { type: 'string', format: 'date-time' },
    },
    { name: 'date', example: '2022-03-15', expected: { type: 'string', format: 'date' } },
    { name: 'time', example: '05:32:31+00:00', expected: { type: 'string', format: 'time' } },
    {
      name: 'uuid',
      example: 'ca761232-ed42-11ce-bacd-00aa0057b223',
      expected: { type: 'string', format: 'uuid' },
    },
  ];

  test.each(tests)('format "$name"', ({ example, expected }) => {
    expect(convert(example)).toEqual(expected);
  });
});

describe('nested objects', () => {
  test('nested object with single scalar', () => {
    expect(convert({ a: 'test' })).toEqual({
      type: 'object',
      properties: {
        a: { type: 'string' },
      },
      additionalProperties: false,
    });
  });

  test('nested object with multiple scalar', () => {
    expect(convert({ a: 'test', b: 25 })).toEqual({
      type: 'object',
      properties: {
        a: { type: 'string' },
        b: { type: 'integer' },
      },
      additionalProperties: false,
    });
  });

  test('nested object with nested object', () => {
    expect(convert({ a: 'test', b: 25, nested: { foo: 'test@example.com' } })).toEqual({
      type: 'object',
      properties: {
        a: { type: 'string' },
        b: { type: 'integer' },
        nested: {
          type: 'object',
          properties: {
            foo: { type: 'string', format: 'email' },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    });
  });
});

describe('arrays', () => {
  test('simple array of strings ', () => {
    expect(convert(['string', 'string2', 'string3'])).toEqual({
      type: 'array',
      items: {
        type: 'string',
      },
    });
  });

  test('simple array of integers ', () => {
    expect(convert([0])).toEqual({
      type: 'array',
      items: {
        type: 'integer',
      },
    });
  });

  test('simple array of strings and null ', () => {
    expect(convert(['string', null])).toEqual({
      type: 'array',
      items: {
        type: ['string', 'null'],
      },
    });

    expect(convert(['string', null], { targetSchema: 'draft-05-oas' })).toEqual({
      type: 'array',
      items: {
        type: 'string',
        nullable: true,
      },
    });
  });

  test('array of mixed scalars', () => {
    expect(convert(['test@example.com', null, 8, false])).toEqual({
      type: 'array',
      items: {
        type: ['string', 'integer', 'boolean', 'null'],
        format: 'email',
      },
    });

    expect(convert(['test@example.com', null, 8, false], { targetSchema: 'draft-05-oas' })).toEqual(
      {
        type: 'array',
        items: {
          nullable: true,
          anyOf: [{ type: 'string', format: 'email' }, { type: 'integer' }, { type: 'boolean' }],
        },
      },
    );
  });

  test('array of mixed scalars and objects', () => {
    expect(convert(['test@example.com', null, 8, false, { a: 'test' }])).toEqual({
      type: 'array',
      items: {
        anyOf: [
          { type: 'string', format: 'email' },
          { type: 'integer' },
          { type: 'boolean' },
          { type: 'object', properties: { a: { type: 'string' } }, additionalProperties: false },
          { type: 'null' },
        ],
      },
    });
  });

  test('array with nested objects', () => {
    expect(
      convert([
        {
          firstName: 'John',
          lastName: 'Doe',
          lastInvoice: null,
        },
        {
          firstName: 'James',
          lastName: 'Bond',
          lastInvoice: {
            amount: 100.01,
          },
          age: 25,
        },
      ]),
    ).toEqual({
      type: 'array',
      items: {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          lastInvoice: {
            type: ['object', 'null'],
            properties: {
              amount: { type: 'number' },
            },
            additionalProperties: false,
          },
          age: { type: 'integer' },
        },
        additionalProperties: false,
      },
    });
  });

  test('array with nested objects and infer required', () => {
    expect(
      convert(
        [
          {
            firstName: 'John',
            lastName: 'Doe',
            lastInvoice: null,
          },
          {
            firstName: 'James',
            lastName: 'Bond',
            lastInvoice: {
              amount: 100.01,
            },
            age: 25,
          },
        ],
        { inferRequired: true, targetSchema: 'draft-2020-12' },
      ),
    ).toEqual({
      type: 'array',
      items: {
        type: 'object',
        required: ['firstName', 'lastName', 'lastInvoice'],
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          lastInvoice: {
            type: ['object', 'null'],
            required: ['amount'],
            properties: {
              amount: { type: 'number' },
            },
            additionalProperties: false,
          },
          age: { type: 'integer' },
        },
        additionalProperties: false,
      },
    });
  });
});

const rebillyKyc = JSON.parse(readFileSync(__dirname + '/schemas/rebilly-kyc.json', 'utf-8'));
const rebillyTransaction = JSON.parse(
  readFileSync(__dirname + '/schemas/rebilly-transaction.json', 'utf-8'),
);
const euDocument = JSON.parse(readFileSync(__dirname + '/schemas/eu-document.json', 'utf-8'));

describe('complex schemas', () => {
  test('Rebilly KYC', () => {
    expect(
      convert(rebillyKyc, {
        inferRequired: true,
        includeExamples: true,
        targetSchema: 'draft-2020-12',
      }),
    ).toMatchSnapshot();
  });

  test('Rebilly Transaction', () => {
    expect(
      convert(rebillyTransaction, {
        inferRequired: true,
        includeExamples: true,
        targetSchema: 'draft-2020-12',
      }),
    ).toMatchSnapshot();
  });

  test('EU Document', () => {
    expect(
      convert(euDocument, {
        inferRequired: true,
        includeExamples: false,
        targetSchema: 'draft-2020-12',
      }),
    ).toMatchSnapshot();
  });
});
