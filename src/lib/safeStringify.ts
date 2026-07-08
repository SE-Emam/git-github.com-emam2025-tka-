
/**
 * Safe JSON.stringify that handles circular references and complex native objects.
 * This version is extremely defensive to prevent "Converting circular structure to JSON" errors.
 */
export function safeStringify(obj: any, indent: number | string = 2): string {
  const cache = new WeakSet();
  
  // Internal function to check if an object is likely a problematic Firebase class
  const isFirebaseObject = (val: any) => {
    if (!val || typeof val !== 'object') return false;
    try {
      const name = val.constructor?.name;
      // Firebase minified names like Y2, Ka, etc.
      return name === 'UserImpl' || name === 'FirebaseUser' || name === 'Y2' || name === 'Ka' || name === 'Qa';
    } catch {
      return false;
    }
  };

  /**
   * Recursively sanitizes an object BEFORE calling JSON.stringify.
   * This prevents circular toJSON() calls which are a common source of errors.
   */
  const sanitize = (value: any): any => {
    // 1. Handle primitives and null early
    if (value === null) return null;
    if (typeof value !== 'object' && typeof value !== 'function') return value;
    
    // 2. Defensive check for circularity using WeakSet
    if (cache.has(value)) {
      return "[Circular]";
    }
    cache.add(value);

    // 2.5 Early Firebase object detection to prevent recursing into problematic internal structures
    if (isFirebaseObject(value)) {
      return {
        uid: (value as any).uid || 'unknown',
        email: (value as any).email || 'hidden',
        displayName: (value as any).displayName || 'user'
      };
    }

    // 3. Handle Functions/Symbols
    if (typeof value === 'function') return `[Function: ${value.name || 'anonymous'}]`;
    if (typeof value === 'symbol') return value.toString();

    // 4. Handle specific problematic types
    try {
      if (value instanceof Date) return value.toISOString();
      
      if (value instanceof Error) {
        return {
          name: value.name,
          message: value.message,
          code: (value as any).code,
          stack: value.stack?.split('\n').slice(0, 3).join('\n') + '\n...'
        };
      }

      // React element detection
      if (value.$$typeof === Symbol.for('react.element')) {
        return {
          type: typeof value.type === 'string' ? value.type : (value.type?.name || 'ReactComponent'),
          props: "[Props]",
          key: value.key
        };
      }

      // DOM related objects
      if (typeof window !== 'undefined' && value === window) return "[Window]";
      if (typeof document !== 'undefined' && value === document) return "[Document]";
      if (value.nodeType && value.nodeName) return `[DOM ${value.nodeName}]`;

      // Firestore Timestamps
      if (typeof value.toDate === 'function') {
        return value.toDate().toISOString();
      }

    } catch (err) {
      return "[Serialization Error]";
    }

    // 5. Recursively process Arrays and Objects
    if (Array.isArray(value)) {
      return value.map(item => sanitize(item));
    }

    const result: any = {};
    try {
      // Use Object.keys to avoid non-enumerable complex properties if possible
      const keys = Object.keys(value);
      for (const key of keys) {
        // Skip potentially dangerous keys in deep objects
        if (key === 'internal' || key === 'auth' || key === '_delegate') {
          result[key] = "[Internal]";
          continue;
        }
        result[key] = sanitize(value[key]);
      }
    } catch (e) {
      return "[Complexity Error]";
    }

    return result;
  };

  try {
    const sanitized = sanitize(obj);
    return JSON.stringify(sanitized, null, indent);
  } catch (e) {
    return `{"error": "Failed to stringify object securely", "type": "${typeof obj}"}`;
  }
}

/**
 * Creates a safe clone of an object.
 */
export function safeClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  
  try {
    const stringified = safeStringify(obj, 0);
    // If it's a summary or circular tag, don't try to parse it, return a shallow copy
    if (stringified.startsWith('[') && (stringified.endsWith(']') || stringified.includes(':'))) {
       if (Array.isArray(obj)) return [...(obj as any)] as any;
       return { ...(obj as any) } as any;
    }
    return JSON.parse(stringified);
  } catch (e) {
    if (Array.isArray(obj)) return [...(obj as any)] as any;
    return { ...(obj as any) } as any;
  }
}
