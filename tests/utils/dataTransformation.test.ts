import {
  formatJson,
  minifyJson,
  filterJsonKeys,
  extractFields,
  replaceText,
  jsonToCsv,
  jsonToXml,
  applyTransformations,
  TRANSFORMATION_TEMPLATES
} from '../../src/utils/dataTransformation';

describe('Data Transformation Utils', () => {
  const sampleJson = '{"name":"John","age":30,"email":"john@example.com","password":"secret123"}';
  const sampleArrayJson = '[{"id":1,"name":"John","active":true},{"id":2,"name":"Jane","active":false}]';

  describe('formatJson', () => {
    it('should format valid JSON with proper indentation', () => {
      const result = formatJson(sampleJson, 2);
      expect(result).toContain('"name": "John"');
      expect(result).toContain('"age": 30');
    });

    it('should return original string for invalid JSON', () => {
      const invalidJson = 'not a json';
      const result = formatJson(invalidJson);
      expect(result).toBe(invalidJson);
    });
  });

  describe('minifyJson', () => {
    it('should minify valid JSON', () => {
      const result = minifyJson(sampleJson);
      expect(result).not.toContain(' ');
      expect(result).not.toContain('\n');
    });

    it('should return original string for invalid JSON', () => {
      const invalidJson = 'not a json';
      const result = minifyJson(invalidJson);
      expect(result).toBe(invalidJson);
    });
  });

  describe('filterJsonKeys', () => {
    it('should include only specified keys', () => {
      const result = filterJsonKeys(sampleJson, ['name', 'age']);
      const parsed = JSON.parse(result);
      expect(parsed).toHaveProperty('name');
      expect(parsed).toHaveProperty('age');
      expect(parsed).not.toHaveProperty('email');
      expect(parsed).not.toHaveProperty('password');
    });

    it('should exclude specified keys', () => {
      const result = filterJsonKeys(sampleJson, [], ['password', 'email']);
      const parsed = JSON.parse(result);
      expect(parsed).toHaveProperty('name');
      expect(parsed).toHaveProperty('age');
      expect(parsed).not.toHaveProperty('email');
      expect(parsed).not.toHaveProperty('password');
    });
  });

  describe('extractFields', () => {
    it('should extract specified fields', () => {
      const result = extractFields(sampleJson, ['name', 'age']);
      const parsed = JSON.parse(result);
      expect(parsed).toEqual({ name: 'John', age: 30 });
    });

    it('should handle nested fields', () => {
      const nestedJson = '{"user":{"name":"John","profile":{"age":30}}}';
      const result = extractFields(nestedJson, ['user.name', 'user.profile.age']);
      const parsed = JSON.parse(result);
      expect(parsed).toEqual({ user: { name: 'John', profile: { age: 30 } } });
    });
  });

  describe('replaceText', () => {
    it('should replace text with simple string', () => {
      const result = replaceText('Hello World', 'World', 'Universe');
      expect(result).toBe('Hello Universe');
    });

    it('should replace text with regex', () => {
      const result = replaceText('Hello World', '\\b\\w+', 'X', true);
      expect(result).toBe('X X');
    });
  });

  describe('jsonToCsv', () => {
    it('should convert JSON array to CSV', () => {
      const result = jsonToCsv(sampleArrayJson);
      expect(result).toContain('id,name,active');
      expect(result).toContain('1,John,true');
      expect(result).toContain('2,Jane,false');
    });

    it('should handle empty array', () => {
      const result = jsonToCsv('[]');
      expect(result).toBe('');
    });
  });

  describe('jsonToXml', () => {
    it('should convert JSON to XML', () => {
      const result = jsonToXml(sampleJson, 'person');
      expect(result).toContain('<person>');
      expect(result).toContain('<name>John</name>');
      expect(result).toContain('<age>30</age>');
    });
  });

  describe('applyTransformations', () => {
    it('should apply multiple transformation rules', () => {
      const rules = [
        {
          id: 'format',
          name: 'Format JSON',
          type: 'format' as const,
          enabled: true,
          config: { action: 'beautify', indent: 2 }
        },
        {
          id: 'filter',
          name: 'Filter Keys',
          type: 'filter' as const,
          enabled: true,
          config: { includeKeys: ['name', 'age'], excludeKeys: [] }
        }
      ];

      const result = applyTransformations(sampleJson, rules);
      expect(result.appliedRules).toContain('Format JSON');
      expect(result.appliedRules).toContain('Filter Keys');
      expect(result.errors).toHaveLength(0);
    });

    it('should handle transformation errors gracefully', () => {
      const rules = [
        {
          id: 'invalid',
          name: 'Invalid Rule',
          type: 'custom' as const,
          enabled: true,
          config: { function: () => { throw new Error('Test error'); } }
        }
      ];

      const result = applyTransformations(sampleJson, rules);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Test error');
    });
  });

  describe('TRANSFORMATION_TEMPLATES', () => {
    it('should have predefined templates', () => {
      expect(TRANSFORMATION_TEMPLATES).toHaveLength(5);
      expect(TRANSFORMATION_TEMPLATES[0].name).toBe('Beautify JSON');
      expect(TRANSFORMATION_TEMPLATES[1].name).toBe('Minify JSON');
    });
  });
});
