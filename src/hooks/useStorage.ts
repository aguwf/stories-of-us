// import { useState, useCallback } from 'react';
//
// // Type definitions for better type safety
// type StorageValue = string | number | boolean | object | null;
//
// interface StorageData<T> {
//   timestamp: number;
//   value: T;
// }
//
// // Custom error class for better error handling
// class StorageError extends Error {
//   constructor(message: string, public readonly key?: string) {
//     super(message);
//     this.name = 'StorageError';
//   }
// }
//
// // Memoized parser utility
// const safeJsonParse = <T>(json: string): { data: T | null; error: Error | null } => {
//   try {
//     const data = JSON.parse(json) as T;
//     return { data, error: null };
//   } catch (error) {
//     return {
//       data: null,
//       error: error instanceof Error ? error : new Error('JSON parse error')
//     };
//   }
// };
//
// // Check if localStorage is available
// const isStorageAvailable = (): boolean => {
//   try {
//     const test = '__storage_test__';
//     localStorage.setItem(test, test);
//     localStorage.removeItem(test);
//     return true;
//   } catch (err) {
//     console.log(err);
//     return false;
//   }
// };
//
// const useStorage = () => {
//   const [isAvailable] = useState(isStorageAvailable());
//
//   // Memoized setItem with timestamp
//   const setItem = useCallback(<T extends StorageValue>(
//     key: string,
//     value: T,
//     // expiryHours?: number
//   ): void => {
//     if (!isAvailable) {
//       console.warn('localStorage is not available');
//       return;
//     }
//
//     try {
//       const storageData: StorageData<T> = {
//         timestamp: Date.now(),
//         value
//       };
//       const serializedValue = JSON.stringify(storageData);
//       localStorage.setItem(key, serializedValue);
//
//       // Dispatch storage event for cross-tab communication
//       window.dispatchEvent(new StorageEvent('storage', {
//         key,
//         newValue: serializedValue
//       }));
//     } catch (error) {
//       throw new StorageError(`Error saving to localStorage: ${error}`, key);
//     }
//   }, [isAvailable]);
//
//   // Memoized getItem with expiry check
//   const getItem = useCallback(<T extends StorageValue>(
//     key: string,
//     defaultValue?: T,
//     expiryHours?: number
//   ): T | null => {
//     if (!isAvailable) {
//       console.warn('localStorage is not available');
//       return defaultValue ?? null;
//     }
//
//     try {
//       const item = localStorage.getItem(key);
//       if (item === null) {
//         return defaultValue ?? null;
//       }
//
//       const { data, error } = safeJsonParse<StorageData<T>>(item);
//
//       if (error || !data) {
//         throw new StorageError('Invalid storage data format', key);
//       }
//
//       // Check if data has expired
//       if (expiryHours) {
//         const expiryTime = data.timestamp + (expiryHours * 60 * 60 * 1000);
//         if (Date.now() > expiryTime) {
//           removeItem(key);
//           return defaultValue ?? null;
//         }
//       }
//
//       return data.value ?? defaultValue ?? null;
//     } catch (error) {
//       console.error(new StorageError(`Error reading from localStorage: ${error}`, key));
//       return defaultValue ?? null;
//     }
//   }, [isAvailable]);
//
//   // Memoized removeItem
//   const removeItem = useCallback((key: string): void => {
//     if (!isAvailable) return;
//
//     try {
//       localStorage.removeItem(key);
//       // Dispatch storage event for cross-tab communication
//       window.dispatchEvent(new StorageEvent('storage', {
//         key,
//         newValue: null
//       }));
//     } catch (error) {
//       throw new StorageError(`Error removing from localStorage: ${error}`, key);
//     }
//   }, [isAvailable]);
//
//   // Clear all items with optional prefix
//   const clear = useCallback((prefix?: string): void => {
//     if (!isAvailable) return;
//
//     try {
//       if (prefix) {
//         Object.keys(localStorage)
//           .filter(key => key.startsWith(prefix))
//           .forEach(key => localStorage.removeItem(key));
//       } else {
//         localStorage.clear();
//       }
//     } catch (error) {
//       throw new StorageError(`Error clearing localStorage: ${error}`);
//     }
//   }, [isAvailable]);
//
//   return {
//     setItem,
//     getItem,
//     removeItem,
//     clear,
//     isAvailable,
//   };
// };
//
// export default useStorage;
