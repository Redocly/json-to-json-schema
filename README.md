# json-to-json-schema

[![npm version](https://badgen.net/npm/v/@redocly/json-to-json-schema)](https://www.npmjs.com/package/@redocly/json-to-json-schema) [![bundle size](https://badgen.net/bundlephobia/min/@redocly/json-to-json-schema)](https://bundlephobia.com/package/@redocly/json-to-json-schema) [![dependency size](https://badgen.net/bundlephobia/dependency-count/@redocly/json-to-json-schema)](https://bundlephobia.com/package/@redocly/json-to-json-schema) [![Coverage Status](https://coveralls.io/repos/github/Redocly/json-to-json-schema/badge.svg?branch=main)](https://coveralls.io/github/Redocly/json-to-json-schema?branch=main)

Convert JSON examples into JSON schema.

Supports JSON Schema `draft-05` used in Swagger 2.0 and OpenAPI 3.0 and new draft `draft-2020-12` used in OpenAPI 3.1.

## Usage

```js
import { convert, format } from '@redocly/json-to-json-schema';

const example = { firstname: 'John', surname: 'Doe', birthday: '1990-02-23' };

const schema = convert(example, {
  target: 'draft-05-oas', // or draft-2020-12
  includeExamples: false,
  disableAdditionalProperties: false,
  inferRequired: false,
});
```

Output:

```yaml
firstname:
  type: string
surname:
  type: string
birthday:
  type: string
  format: date
```

## Similar tools

https://github.com/mohsen1/json-to-json-schema
