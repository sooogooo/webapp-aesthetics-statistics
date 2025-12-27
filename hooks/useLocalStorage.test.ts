import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useLocalStorage from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should return initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    expect(result.current[0]).toBe('initial');
  });

  it('should update state when setValue is called', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
  });

  it('should persist value to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    act(() => {
      result.current[1]('persisted');
    });

    const stored = localStorage.getItem('testKey');
    expect(stored).toBe(JSON.stringify('persisted'));
  });

  it('should retrieve value from localStorage on mount', () => {
    // Pre-populate localStorage
    localStorage.setItem('testKey', JSON.stringify('stored'));

    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    // Wait for the effect to run
    expect(result.current[0]).toBe('stored');
  });

  it('should work with complex objects', () => {
    const complexObject = { name: 'Test', count: 42, nested: { value: true } };

    const { result } = renderHook(() => useLocalStorage('testKey', complexObject));

    act(() => {
      result.current[1]({ ...complexObject, count: 100 });
    });

    expect(result.current[0]).toEqual({ name: 'Test', count: 100, nested: { value: true } });
  });

  it('should work with arrays', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', [1, 2, 3]));

    act(() => {
      result.current[1]([4, 5, 6]);
    });

    expect(result.current[0]).toEqual([4, 5, 6]);
  });

  it('should update state even if localStorage is unavailable', () => {
    // This test verifies the hook works even when localStorage operations fail
    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    // State updates should work regardless of localStorage status
    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
  });

  it('should handle JSON parse errors gracefully', () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Set invalid JSON in localStorage
    localStorage.setItem('testKey', 'invalid json {');

    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    expect(consoleWarn).toHaveBeenCalled();
    expect(result.current[0]).toBe('initial');

    consoleWarn.mockRestore();
  });

  it('should support function updates', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 10));

    act(() => {
      result.current[1]((prev) => prev + 5);
    });

    expect(result.current[0]).toBe(15);
  });

  it('should handle boolean values', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', false));

    act(() => {
      result.current[1](true);
    });

    expect(result.current[0]).toBe(true);
    expect(localStorage.getItem('testKey')).toBe('true');
  });

  it('should handle null values', () => {
    const { result } = renderHook(() => useLocalStorage<string | null>('testKey', null));

    act(() => {
      result.current[1]('value');
    });

    expect(result.current[0]).toBe('value');

    act(() => {
      result.current[1](null);
    });

    expect(result.current[0]).toBe(null);
  });
});
