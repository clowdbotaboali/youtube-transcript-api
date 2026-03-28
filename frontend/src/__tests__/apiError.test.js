import { describe, it, expect } from 'vitest';
import { parseApiError, formatApiErrorMessage } from '../utils/apiError';

// ── parseApiError ───────────────────────────────────────────────────
describe('parseApiError', () => {
  it('returns empty result for null payload', () => {
    const result = parseApiError(null);
    expect(result).toEqual({ code: '', message: '', details: null });
  });

  it('returns empty result for non-object payload', () => {
    expect(parseApiError('string')).toEqual({ code: '', message: '', details: null });
  });

  it('parses string error field', () => {
    const result = parseApiError({ error: 'Something went wrong' });
    expect(result.message).toBe('Something went wrong');
    expect(result.code).toBe('');
  });

  it('parses object error with code and message', () => {
    const result = parseApiError({
      error: {
        code: 'LIMIT_EXCEEDED',
        message: 'Daily limit reached'
      }
    });
    expect(result.code).toBe('LIMIT_EXCEEDED');
    expect(result.message).toBe('Daily limit reached');
  });

  it('parses object error with details', () => {
    const result = parseApiError({
      error: {
        code: 'LIMIT_EXCEEDED',
        message: 'Limit reached',
        details: { required: 5, available: 0 }
      }
    });
    expect(result.details).toEqual({ required: 5, available: 0 });
  });

  it('returns null details for non-object details', () => {
    const result = parseApiError({
      error: { code: 'ERR', message: 'msg', details: 'string-details' }
    });
    expect(result.details).toBeNull();
  });
});

// ── formatApiErrorMessage ───────────────────────────────────────────
describe('formatApiErrorMessage', () => {
  it('returns English fallback for unknown error', () => {
    const result = formatApiErrorMessage({
      payload: {},
      status: 500,
      lang: 'en'
    });
    expect(result).toBe('Unexpected error.');
  });

  it('returns Arabic fallback for unknown error', () => {
    const result = formatApiErrorMessage({
      payload: {},
      status: 500,
      lang: 'ar'
    });
    expect(result).toContain('خطأ');
  });

  it('returns localized message for LIMIT_EXCEEDED with required credits', () => {
    const result = formatApiErrorMessage({
      payload: {
        error: {
          code: 'LIMIT_EXCEEDED',
          message: 'Limit reached',
          details: { required: 1 }
        }
      },
      status: 403,
      lang: 'en'
    });
    expect(result).toContain('Insufficient video balance');
  });

  it('returns localized message for LIMIT_EXCEEDED with dailyLimit', () => {
    const result = formatApiErrorMessage({
      payload: {
        error: {
          code: 'LIMIT_EXCEEDED',
          message: 'Limit reached',
          details: { dailyLimit: 5 }
        }
      },
      status: 403,
      lang: 'en'
    });
    expect(result).toContain('Daily limit reached (5)');
  });

  it('returns localized message for INVALID_VIDEO_ID', () => {
    const result = formatApiErrorMessage({
      payload: { error: { code: 'INVALID_VIDEO_ID', message: 'bad id' } },
      status: 400,
      lang: 'en'
    });
    expect(result).toContain('Invalid YouTube');
  });

  it('returns localized message for TRANSCRIPT_UNAVAILABLE', () => {
    const result = formatApiErrorMessage({
      payload: { error: { code: 'TRANSCRIPT_UNAVAILABLE', message: 'no transcript' } },
      status: 404,
      lang: 'en'
    });
    expect(result).toContain('does not expose');
  });

  it('returns localized message for TRANSCRIPT_PROVIDER_EXHAUSTED', () => {
    const result = formatApiErrorMessage({
      payload: { error: { code: 'TRANSCRIPT_PROVIDER_EXHAUSTED', message: 'provider credits exhausted' } },
      status: 503,
      lang: 'en'
    });
    expect(result).toContain('exhausted its credits');
  });

  it('returns localized message for TRANSCRIPT_PROVIDER_UNAVAILABLE', () => {
    const result = formatApiErrorMessage({
      payload: { error: { code: 'TRANSCRIPT_PROVIDER_UNAVAILABLE', message: 'provider unavailable' } },
      status: 503,
      lang: 'en'
    });
    expect(result).toContain('temporarily unavailable');
  });

  it('returns session expired for 401', () => {
    const result = formatApiErrorMessage({
      payload: { error: { code: 'UNAUTHENTICATED', message: 'unauth' } },
      status: 401,
      lang: 'en'
    });
    expect(result).toContain('Session expired');
  });

  it('returns rate limit message for 429', () => {
    const result = formatApiErrorMessage({
      payload: { error: { code: 'RATE_LIMITED', message: 'slow down' } },
      status: 429,
      lang: 'en'
    });
    expect(result).toContain('Too many requests');
  });

  it('returns blocked account message', () => {
    const result = formatApiErrorMessage({
      payload: {
        error: {
          code: 'ACCOUNT_BLOCKED',
          message: 'blocked',
          details: { access: { status: 'blocked', reason: 'Violation' } }
        }
      },
      status: 403,
      lang: 'en'
    });
    expect(result).toContain('blocked');
    expect(result).toContain('Violation');
  });

  it('returns suspended account message', () => {
    const result = formatApiErrorMessage({
      payload: {
        error: {
          code: 'ACCOUNT_SUSPENDED',
          message: 'suspended',
          details: { access: { status: 'suspended' } }
        }
      },
      status: 403,
      lang: 'en'
    });
    expect(result).toContain('suspended');
  });

  it('returns raw message for unrecognized error codes', () => {
    const result = formatApiErrorMessage({
      payload: { error: { code: 'UNKNOWN_CODE', message: 'Custom error message' } },
      status: 400,
      lang: 'en'
    });
    expect(result).toBe('Custom error message');
  });

  it('handles QUOTA_EXCEEDED code', () => {
    const result = formatApiErrorMessage({
      payload: { error: { code: 'QUOTA_EXCEEDED', message: 'quota done' } },
      status: 403,
      lang: 'en'
    });
    expect(result).toContain('Monthly free video quota');
  });

  it('handles insufficient credits in raw message', () => {
    const result = formatApiErrorMessage({
      payload: { error: 'Insufficient video balance remaining' },
      status: 403,
      lang: 'en'
    });
    expect(result).toContain('Insufficient video balance');
  });
});
