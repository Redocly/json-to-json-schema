# json-to-json-schema

Convert JSON examples into JSON schema.

Supports JSON Schema Draft 5 used in Swagger 2.0 and OpenAPI 3.0 and new draft `draft-2020-12` used in OpenAPI 3.1.

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
