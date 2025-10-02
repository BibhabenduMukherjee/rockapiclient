/**
 * Data Transformation Utilities for Rock API Client
 * Provides response data manipulation capabilities
 */

export interface TransformationRule {
  id: string;
  name: string;
  type: 'format' | 'filter' | 'extract' | 'replace' | 'custom';
  enabled: boolean;
  config: any;
}

export interface TransformationResult {
  originalData: string;
  transformedData: string;
  appliedRules: string[];
  errors: string[];
}

/**
 * Basic JSON formatting and beautification
 */
export const formatJson = (data: string, indent: number = 2): string => {
  try {
    const parsed = JSON.parse(data);
    return JSON.stringify(parsed, null, indent);
  } catch (error) {
    return data; // Return original if not valid JSON
  }
};

/**
 * Minify JSON data
 */
export const minifyJson = (data: string): string => {
  try {
    const parsed = JSON.parse(data);
    return JSON.stringify(parsed);
  } catch (error) {
    return data; // Return original if not valid JSON
  }
};

/**
 * Filter JSON data based on key patterns
 */
export const filterJsonKeys = (data: string, includeKeys: string[], excludeKeys: string[] = []): string => {
  try {
    const parsed = JSON.parse(data);
    const filtered = filterObjectKeys(parsed, includeKeys, excludeKeys);
    return JSON.stringify(filtered, null, 2);
  } catch (error) {
    return data;
  }
};

/**
 * Extract specific fields from JSON response
 */
export const extractFields = (data: string, fields: string[]): string => {
  try {
    const parsed = JSON.parse(data);
    const extracted: any = {};
    
    fields.forEach(field => {
      if (field.includes('.')) {
        // Handle nested fields like "user.name"
        const value = getNestedValue(parsed, field);
        if (value !== undefined) {
          setNestedValue(extracted, field, value);
        }
      } else {
        if (parsed[field] !== undefined) {
          extracted[field] = parsed[field];
        }
      }
    });
    
    return JSON.stringify(extracted, null, 2);
  } catch (error) {
    return data;
  }
};

/**
 * Replace text patterns in response data
 */
export const replaceText = (data: string, searchPattern: string, replaceWith: string, useRegex: boolean = false): string => {
  try {
    if (useRegex) {
      const regex = new RegExp(searchPattern, 'g');
      return data.replace(regex, replaceWith);
    } else {
      return data.replace(new RegExp(escapeRegExp(searchPattern), 'g'), replaceWith);
    }
  } catch (error) {
    return data;
  }
};

/**
 * Convert JSON to CSV format
 */
export const jsonToCsv = (data: string, headers?: string[]): string => {
  try {
    const parsed = JSON.parse(data);
    const array = Array.isArray(parsed) ? parsed : [parsed];
    
    if (array.length === 0) return '';
    
    const keys = headers || Object.keys(array[0]);
    const csvHeaders = keys.join(',');
    const csvRows = array.map(row => 
      keys.map(key => {
        const value = getNestedValue(row, key);
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  } catch (error) {
    return data;
  }
};

/**
 * Convert JSON to XML format
 */
export const jsonToXml = (data: string, rootElement: string = 'root'): string => {
  try {
    const parsed = JSON.parse(data);
    return objectToXml(parsed, rootElement);
  } catch (error) {
    return data;
  }
};

/**
 * Apply multiple transformation rules
 */
export const applyTransformations = (
  data: string, 
  rules: TransformationRule[]
): TransformationResult => {
  let result = data;
  const appliedRules: string[] = [];
  const errors: string[] = [];
  
  for (const rule of rules) {
    if (!rule.enabled) continue;
    
    try {
      switch (rule.type) {
        case 'format':
          if (rule.config.action === 'beautify') {
            result = formatJson(result, rule.config.indent || 2);
          } else if (rule.config.action === 'minify') {
            result = minifyJson(result);
          }
          break;
          
        case 'filter':
          result = filterJsonKeys(result, rule.config.includeKeys, rule.config.excludeKeys);
          break;
          
        case 'extract':
          result = extractFields(result, rule.config.fields);
          break;
          
        case 'replace':
          result = replaceText(result, rule.config.search, rule.config.replace, rule.config.useRegex);
          break;
          
        case 'custom':
          // Custom transformation logic can be added here
          if (rule.config.function) {
            result = rule.config.function(result);
          }
          break;
      }
      
      appliedRules.push(rule.name);
    } catch (error) {
      errors.push(`Error in rule "${rule.name}": ${error}`);
    }
  }
  
  return {
    originalData: data,
    transformedData: result,
    appliedRules,
    errors
  };
};

// Helper functions

const filterObjectKeys = (obj: any, includeKeys: string[], excludeKeys: string[]): any => {
  if (Array.isArray(obj)) {
    return obj.map(item => filterObjectKeys(item, includeKeys, excludeKeys));
  }
  
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  const filtered: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const shouldInclude = includeKeys.length === 0 || includeKeys.some(pattern => 
      key.includes(pattern) || pattern.includes('*') && new RegExp(pattern.replace(/\*/g, '.*')).test(key)
    );
    const shouldExclude = excludeKeys.some(pattern => 
      key.includes(pattern) || pattern.includes('*') && new RegExp(pattern.replace(/\*/g, '.*')).test(key)
    );
    
    if (shouldInclude && !shouldExclude) {
      filtered[key] = typeof value === 'object' ? filterObjectKeys(value, includeKeys, excludeKeys) : value;
    }
  }
  
  return filtered;
};

const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

const setNestedValue = (obj: any, path: string, value: any): void => {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
};

const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const objectToXml = (obj: any, rootElement: string): string => {
  let xml = `<${rootElement}>`;
  
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      xml += `<item_${index}>${objectToXml(item, 'value')}</item_${index}>`;
    });
  } else if (typeof obj === 'object' && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        xml += objectToXml(value, key);
      } else {
        xml += `<${key}>${value}</${key}>`;
      }
    }
  } else {
    xml += obj;
  }
  
  xml += `</${rootElement}>`;
  return xml;
};

/**
 * Predefined transformation templates
 */
export const TRANSFORMATION_TEMPLATES: TransformationRule[] = [
  {
    id: 'beautify-json',
    name: 'Beautify JSON',
    type: 'format',
    enabled: true,
    config: { action: 'beautify', indent: 2 }
  },
  {
    id: 'minify-json',
    name: 'Minify JSON',
    type: 'format',
    enabled: false,
    config: { action: 'minify' }
  },
  {
    id: 'extract-ids',
    name: 'Extract IDs Only',
    type: 'extract',
    enabled: false,
    config: { fields: ['id', 'name', 'email'] }
  },
  {
    id: 'filter-sensitive',
    name: 'Remove Sensitive Data',
    type: 'filter',
    enabled: false,
    config: { 
      excludeKeys: ['password', 'token', 'secret', 'key', 'auth*'] 
    }
  },
  {
    id: 'convert-csv',
    name: 'Convert to CSV',
    type: 'custom',
    enabled: false,
    config: { 
      function: (data: string) => jsonToCsv(data)
    }
  }
];
