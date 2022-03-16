export type JSONSchema = {
  type: 'string' | 'number' | 'integer' | 'object' | 'array' | 'boolean' | 'null';
  [k: string]: any;
};

export type ConvertTarget = 'draft-05-oas' | 'draft-2020-12';

export interface ConvertOptions {
  targetSchema?: ConvertTarget;
  includeExamples?: boolean;
  disableAdditionalProperties?: boolean;
  inferRequired?: boolean;
}
