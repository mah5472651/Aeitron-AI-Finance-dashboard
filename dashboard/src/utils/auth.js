// Auth configuration
const SESSION_TIMEOUT_MS = 8 * 60 * 60 * 1000; // 8 hours
const VALID_EMAIL = 'ceo@aeitron.com';
// SHA-256 hash of "admin"
const VALID_PASSWORD_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';

export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function validateCredentials(email, password) {
  if (email !== VALID_EMAIL) return false;
  const hash = await hashPassword(password);
  return hash === VALID_PASSWORD_HASH;
}

export function isSessionValid(storage) {
  const authFlag = storage.getItem('aeitron_auth');
  if (authFlag !== 'true') return false;

  const timestamp = storage.getItem('aeitron_auth_ts');
  if (!timestamp) return false;

  return Date.now() - Number(timestamp) < SESSION_TIMEOUT_MS;
}

export function setSession(rememberMe) {
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem('aeitron_auth', 'true');
  storage.setItem('aeitron_auth_ts', String(Date.now()));
}

export function clearSession() {
  sessionStorage.removeItem('aeitron_auth');
  sessionStorage.removeItem('aeitron_auth_ts');
  localStorage.removeItem('aeitron_auth');
  localStorage.removeItem('aeitron_auth_ts');
}

export function getActiveStorage() {
  if (isSessionValid(localStorage)) return localStorage;
  if (isSessionValid(sessionStorage)) return sessionStorage;
  return null;
}
