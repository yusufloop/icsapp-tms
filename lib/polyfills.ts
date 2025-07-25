// Polyfill for structuredClone
if (typeof global !== 'undefined' && !global.structuredClone) {
  global.structuredClone = function<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    // Handle Date objects
    if (obj instanceof Date) {
      return new Date(obj) as T;
    }
    
    // Handle Arrays
    if (Array.isArray(obj)) {
      return obj.map(item => global.structuredClone(item)) as T;
    }
    
    // Handle regular objects
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        (cloned as any)[key] = global.structuredClone((obj as any)[key]);
      }
    }
    return cloned;
  };
}

// Also add to window for web environments
if (typeof window !== 'undefined' && !window.structuredClone) {
  (window as any).structuredClone = global?.structuredClone || function<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    // Handle Date objects
    if (obj instanceof Date) {
      return new Date(obj) as T;
    }
    
    // Handle Arrays
    if (Array.isArray(obj)) {
      return obj.map(item => (window as any).structuredClone(item)) as T;
    }
    
    // Handle regular objects
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        (cloned as any)[key] = (window as any).structuredClone((obj as any)[key]);
      }
    }
    return cloned;
  };
}