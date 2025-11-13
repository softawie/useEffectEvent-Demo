// React 19.2 has useEffectEvent built-in, but we keep this as a polyfill/fallback
// and for educational purposes. In production, prefer importing from 'react' directly.
import { useCallback, useRef } from 'react';

/**
 * Polyfill implementation of useEffectEvent
 * 
 * Note: React 19.2 includes useEffectEvent built-in.
 * This polyfill is kept for:
 * - Educational purposes (showing how it works)
 * - Fallback compatibility
 * - Understanding the implementation pattern
 * 
 * For production code, prefer: import { useEffectEvent } from 'react';
 */
export function useEffectEvent<T extends (...args: any[]) => any>(fn: T): T {
  const ref = useRef<T>(fn);
  ref.current = fn;
  
  return useCallback((...args: any[]) => {
    return ref.current(...args);
  }, []) as T;
}
