/**
 * Industrial-Strength Input Validation & Sanitization Engine
 * Prevents Cross-Site Scripting (XSS), SQL Injection payloads, NoSQL Injection,
 * Path Traversal, and Payload DoS attacks across STRIKE IQ.
 */

// Strip HTML tags and dangerous event handlers (<script>, onload=, javascript:, etc.)
const XSS_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const TAG_REGEX = /<[^>]*>?/gm;
const DANGEROUS_ATTRIBUTES = /on\w+\s*=\s*(['"][^'"]*['"]|[^\s>]+)/gi;
const PROTOCOL_REGEX = /(javascript|data|vbscript):/gi;

/**
 * Sanitizes a string input by removing potential XSS scripts, HTML tags, and dangerous protocols.
 * Also truncates strings that exceed maxLength to prevent DoS attacks.
 */
export function sanitizeString(input: any, maxLength = 2000): string {
  if (input === null || input === undefined) return '';
  if (typeof input !== 'string') {
    return String(input).slice(0, maxLength);
  }

  let sanitized = input
    .replace(XSS_REGEX, '')
    .replace(DANGEROUS_ATTRIBUTES, '')
    .replace(PROTOCOL_REGEX, '')
    .replace(TAG_REGEX, ''); // Strip remaining HTML tags

  // Trim and enforce maximum length
  sanitized = sanitized.trim().slice(0, maxLength);

  return sanitized;
}

/**
 * Recursively sanitizes all string properties in an object or array.
 * Safe to pass raw JSON request bodies into this function before database storage or processing.
 */
export function sanitizePayload<T>(payload: T): T {
  if (payload === null || payload === undefined) {
    return payload;
  }

  if (typeof payload === 'string') {
    return sanitizeString(payload) as unknown as T;
  }

  if (typeof payload === 'number' || typeof payload === 'boolean') {
    return payload;
  }

  if (Array.isArray(payload)) {
    return payload.map(item => sanitizePayload(item)) as unknown as T;
  }

  if (typeof payload === 'object') {
    const sanitizedObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(payload)) {
      // Ensure property names are safe alphanumeric strings
      const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 100);
      sanitizedObj[safeKey] = sanitizePayload(value);
    }
    return sanitizedObj as T;
  }

  return payload;
}

/**
 * Validates identifier formats (UUID, alphanumeric, transaction refs, etc.)
 * Prevents directory traversal (../../) and SQL injection in URL parameters or ID fields.
 */
export function isValidId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  // Allow alphanumeric, hyphens, underscores, and dots up to 128 characters
  const ID_REGEX = /^[a-zA-Z0-9_.-]{1,128}$/;
  return ID_REGEX.test(id);
}

/**
 * Validates email address syntax and length.
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string' || email.length > 255) return false;
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return EMAIL_REGEX.test(email);
}

/**
 * Enforces safe numeric boundaries (e.g., confidence percentages between 0 and 100).
 */
export function sanitizeNumber(input: any, min = 0, max = 1000000, fallback = 0): number {
  const num = Number(input);
  if (isNaN(num) || !isFinite(num)) return fallback;
  return Math.min(Math.max(num, min), max);
}
