import { combineSchemas } from './combine';
import { detectFormat } from './format';
import { mapObjectValues } from './js-utils';
import { JSONSchema, ConvertOptions } from './types';
import { formatExample, formatNull, getJsonSchemaType } from './utils';

export function convert(example: any, options: ConvertOptions = { targetSchema: 'draft-2020-12' }): JSONSchema {
  return convertValue(example, { targetSchema: 'draft-2020-12', ...options });
}

function convertValue(value: any, options: ConvertOptions) {
  if (value === undefined) return {};

  const type = getJsonSchemaType(value);
  const exampleObj = options.includeExamples ? formatExample(value, options.targetSchema) : {};

  switch (type) {
    case 'string':
      const format = detectFormat(value);
      return { type, ...exampleObj, ...(format ? { format } : null) };
    case 'number':
    case 'integer':
    case 'boolean':
      return { type, ...exampleObj };
    case 'null':
      return formatNull(options.targetSchema);
    case 'array':
      return {
        type,
        items: value.length
          ? combineSchemas(
              value.map(v => convertValue(v, options)),
              options
            )
          : undefined,
      };
    case 'object':
      const propsLength = Object.keys(value).length;
      const additionalPropertiesObj =
        options.disableAdditionalProperties || !propsLength ? {} : { additionalProperties: false };
      return {
        type,
        properties: propsLength
          ? mapObjectValues(value, (_key, fieldValue) => {
              return convertValue(fieldValue, options);
            })
          : undefined,
        ...additionalPropertiesObj,
        // required: [],
      };
  }
}
