import { groupByField, intersect } from './js-utils';
import { JSONSchema, ConvertOptions } from './types';
import { isNull, isScalarType } from './utils';

export function combineSchemas(schemas: JSONSchema[], options: ConvertOptions) {
  const withoutNulls = schemas.filter(schema => !isNull(schema, options.targetSchema));
  const hasNull = withoutNulls.length < schemas.length;

  const groups = groupByField(withoutNulls, 'type');

  let res: any = {};

  if (groups.length === 1) {
    res = simpleCombine(groups[0].values, options);
  } else if (groups.length > 1) {
    if (groups.every(g => isScalarType(g.group)) && options.targetSchema === 'draft-2020-12') {
      res = simpleCombine(withoutNulls, options);
    } else {
      res = {
        anyOf: groups.map(g => simpleCombine(g.values, options)),
      };
    }
  }

  if (hasNull) {
    switch (options.targetSchema) {
      case 'draft-05-oas':
        res.nullable = true;
        break;
      case 'draft-2020-12':
        if (res.anyOf) {
          res.anyOf.push({ type: 'null' });
        } else if (res.type) {
          res.type = Array.isArray(res.type) ? [...res.type, 'null'] : [res.type, 'null'];
        } else {
          res.type = ['null'];
        }
    }
  }

  return res;
}

function simpleCombine(schemas: JSONSchema[], options: ConvertOptions) {
  const typeObj = combineType(schemas);
  const formatObj = combineFormat(schemas);
  const exampleObj = combineExamples(schemas, options);
  const propertiesObj = combineProperties(schemas, options);
  const required = inferRequired(schemas, options);

  const additionalPropertiesObj =
    options.disableAdditionalProperties || !propertiesObj.properties
      ? {}
      : { additionalProperties: false };

  return {
    ...typeObj,
    ...formatObj,
    ...exampleObj,
    ...required,
    ...propertiesObj,
    ...additionalPropertiesObj,
  };
}

function combineType(schemas: JSONSchema[]) {
  const typesSet = new Set(schemas.flatMap(s => s.type));
  const types = Array.from(typesSet.values());

  if (types.length === 1) {
    return { type: types[0] };
  }

  return { type: types };
}

function combineFormat(schemas: JSONSchema[]) {
  const uniqueFormats = new Set(schemas.filter(s => s.type === 'string').map(s => s.format));
  if (uniqueFormats.size !== 1 || (uniqueFormats.size === 1 && uniqueFormats.has(undefined))) {
    return {};
  }

  return { format: uniqueFormats.values().next().value };
}

function combineExamples(schemas: JSONSchema[], options: ConvertOptions) {
  switch (options.targetSchema) {
    case 'draft-2020-12':
      const examples = schemas.flatMap(s => s.examples).filter(s => s !== undefined);
      return examples.length ? { examples } : {};
    case 'draft-05-oas':
      const example = schemas.find(s => s.example !== undefined)?.example;
      return example !== undefined ? { example } : {};
  }
}

function combineProperties(schemas: JSONSchema[], options: ConvertOptions) {
  const properties = {};
  const allPropertyNames = new Set(schemas.flatMap(s => Object.keys(s.properties || {})));

  if (allPropertyNames.size === 0) {
    return {};
  }

  for (const propName of allPropertyNames.values()) {
    const propSchemas = schemas.map(s => s.properties[propName]).filter(Boolean);
    properties[propName] = combineSchemas(propSchemas, options);
  }

  return { properties };
}

function inferRequired(schemas: JSONSchema[], options: ConvertOptions) {
  if (!options.inferRequired) return {};
  const firstSchema = schemas[0];

  if (firstSchema.type !== 'object') return {};

  const requiredSet = intersect(schemas.map(s => new Set(Object.keys(s.properties || {}))));
  if (requiredSet.size > 0) {
    return { required: Array.from(requiredSet.values()) };
  }

  return {};
}
