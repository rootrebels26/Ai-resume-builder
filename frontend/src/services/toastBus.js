/**
 * Minimal, dependency-free pub/sub used to surface global notifications
 * (e.g. connectivity failures) without threading a context through every page.
 */
const listeners = new Set();

let lastMessage = '';
let lastTimestamp = 0;

export function subscribeToast(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifyToast({ message, type = 'error', duration = 5000 }) {
  if (!message) return;

  // De-duplicate identical messages fired within a short window so a burst of
  // failed requests produces a single, readable notification.
  const now = Date.now();
  if (message === lastMessage && now - lastTimestamp < 4000) return;
  lastMessage = message;
  lastTimestamp = now;

  const toast = { id: `${now}-${Math.random().toString(36).slice(2, 8)}`, message, type, duration };
  listeners.forEach((listener) => listener(toast));
}
