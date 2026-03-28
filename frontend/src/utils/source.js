export const MANUAL_SOURCE_PREFIX = 'manual_';

const MANUAL_SOURCE_REGEX = /^manual_[A-Za-z0-9_-]{8,80}$/;

export function isManualSourceId(value) {
  return MANUAL_SOURCE_REGEX.test(String(value || '').trim());
}

export function createManualSourceId() {
  const randomPart =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 20)
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;

  return `${MANUAL_SOURCE_PREFIX}${randomPart}`;
}

