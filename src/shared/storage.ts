export const storageKey = 'studyfrog.local-state.v2';

export function readStorageValue() {
  try {
    return window.localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

export function writeStorageValue(value: string) {
  try {
    window.localStorage.setItem(storageKey, value);
    return true;
  } catch {
    return false;
  }
}

export function removeStorageValue() {
  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // Storage can be unavailable in privacy-restricted web views.
  }
}
