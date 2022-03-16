import { ConvertTarget, JSONSchema } from './types';

export function getJsonSchemaType(value: any): string {
  if (typeof value === 'function') {
    throw new Error('Invalid JSON input, functions are not supported');
  }

  if (typeof value === 'object') {
    if (Array.isArray(value)) return 'array';
    if (value === null) return 'null';
    return 'object';
  }

  if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      return 'integer';
    } else {
      return 'number';
    }
  }

  return typeof value;
}

export function formatExample(example: any, target: ConvertTarget) {
  switch (target) {
    case 'draft-2020-12':
      return { examples: [example] };
    case 'draft-05-oas':
      return { example: example };
    default:
      return {};
  }
}

export function formatNull(target: ConvertTarget) {
  switch (target) {
    case 'draft-2020-12':
      return { type: 'null' };
    case 'draft-05-oas':
      return { nullable: true };
    default:
      return {};
  }
}

export function isNull(schema: JSONSchema, target: ConvertTarget) {
  switch (target) {
    case 'draft-2020-12':
      const { type } = schema;
      return type === 'null' || (Array.isArray(type) && type.some(t => t === 'null'));
    case 'draft-05-oas':
      return !!schema.nullable;
    default:
      return false;
  }
}

export function isScalarType(type: string): boolean {
  return ['string', 'number', 'integer', 'boolean', 'null'].includes(type);
}