import { describe, it, expect } from 'vitest';
import { getBaseProcessingType } from '../utils/processingType';

describe('getBaseProcessingType', () => {
  it('returns empty string for empty input', () => {
    expect(getBaseProcessingType('')).toBe('');
    expect(getBaseProcessingType(null)).toBe('');
    expect(getBaseProcessingType(undefined)).toBe('');
  });

  it('returns "chat" for chat-prefixed types', () => {
    expect(getBaseProcessingType('chat:question')).toBe('chat');
    expect(getBaseProcessingType('chat:follow-up')).toBe('chat');
  });

  it('returns base type for colon-separated types', () => {
    expect(getBaseProcessingType('extract:full')).toBe('extract');
    expect(getBaseProcessingType('ai:summary')).toBe('ai');
  });

  it('returns the type itself when no colon', () => {
    expect(getBaseProcessingType('summary')).toBe('summary');
    expect(getBaseProcessingType('extract')).toBe('extract');
  });

  it('handles case insensitively', () => {
    expect(getBaseProcessingType('Chat:Question')).toBe('chat');
    expect(getBaseProcessingType('EXTRACT')).toBe('extract');
  });

  it('trims whitespace', () => {
    expect(getBaseProcessingType('  summary  ')).toBe('summary');
  });
});
