/**
 * Custom error classes for the LessTokens SDK
 */

/**
 * Base error class for all LessTokens SDK errors
 */
export class LessTokensError extends Error {
  /** Error code */
  public readonly code: string;
  /** HTTP status code (if applicable) */
  public readonly statusCode?: number;
  /** Additional error details */
  public readonly details?: unknown;

  constructor(
    message: string,
    code: string,
    statusCode?: number,
    details?: unknown
  ) {
    super(message);
    this.name = 'LessTokensError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, LessTokensError);
    }
  }
}

/**
 * Error codes
 */
export const ErrorCodes = {
  INVALID_API_KEY: 'INVALID_API_KEY',
  INVALID_PROVIDER: 'INVALID_PROVIDER',
  COMPRESSION_FAILED: 'COMPRESSION_FAILED',
  LLM_API_ERROR: 'LLM_API_ERROR',
  TIMEOUT: 'TIMEOUT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

/**
 * Create error from error code
 */
export function createError(
  code: ErrorCode,
  message: string,
  statusCode?: number,
  details?: unknown
): LessTokensError {
  return new LessTokensError(message, code, statusCode, details);
}

