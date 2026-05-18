/**
 * Performance utility functions to optimize common operations
 */

/**
 * Indexes an array of items by a property, creating a Map for O(1) lookups
 * instead of O(n) filter operations
 */
export const indexBy = <T, K extends string | number>(
  items: T[],
  keyFn: (item: T) => K
): Map<K, T[]> => {
  const map = new Map<K, T[]>();
  items.forEach((item) => {
    const key = keyFn(item);
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.push(item);
  });
  return map;
};

/**
 * Creates a debounced version of a function that delays execution
 * Useful for search, auto-save, etc.
 */
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Creates a throttled version of a function that limits execution frequency
 * Useful for scroll events, resize handlers, etc.
 */
export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
};

/**
 * Memoizes a pure function result based on arguments
 * Useful for expensive computations
 */
export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map();
  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};
