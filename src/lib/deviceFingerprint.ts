/**
 * Simple device fingerprint utility for Kiosk sessions.
 * Stores a UUID in localStorage under the key 'kioskDeviceFp'.
 * Returns a fingerprint string composed of the stored UUID and the user's navigator.userAgent.
 */
export function getDeviceFingerprint(): string {
  const storageKey = 'kioskDeviceFp';
  let fp = localStorage.getItem(storageKey);
  if (!fp) {
    fp = crypto.randomUUID?.() ?? Math.random().toString(36).substring(2);
    localStorage.setItem(storageKey, fp);
  }
  return `${navigator.userAgent}::${fp}`;
}
