export function getBaseProcessingType(type) {
  const normalized = String(type || '').trim().toLowerCase();
  if (!normalized) return '';
  if (normalized.startsWith('chat:')) return 'chat';
  const [base] = normalized.split(':');
  return base || normalized;
}

