/**
 * Production-grade error handling for Google API operations
 */

export interface ErrorResult {
  status: 'error';
  error: string;
  code?: string;
  details?: any;
  retryable?: boolean;
}

/**
 * Handle Google API errors with appropriate user messages and retry hints
 */
export function handleGoogleApiError(error: any, operation: string): ErrorResult {
  // Extract error details from Google API error structure
  const statusCode = error?.code || error?.response?.status || error?.status;
  const message = error?.message || error?.errors?.[0]?.message || 'Unknown error';
  
  // Quota exceeded / Rate limit errors
  if (statusCode === 429 || message.includes('quota') || message.includes('rate limit')) {
    return {
      status: 'error',
      error: `Rate limit exceeded for ${operation}. Please try again in a few moments.`,
      code: 'RATE_LIMIT_EXCEEDED',
      retryable: true,
      details: { statusCode, originalMessage: message }
    };
  }
  
  // Authentication errors
  if (statusCode === 401 || statusCode === 403) {
    return {
      status: 'error',
      error: `Authentication failed for ${operation}. Please re-authenticate with Google.`,
      code: 'AUTH_FAILED',
      retryable: false,
      details: { statusCode, originalMessage: message }
    };
  }
  
  // Not found errors
  if (statusCode === 404) {
    return {
      status: 'error',
      error: `Resource not found for ${operation}. Please check the ID and try again.`,
      code: 'NOT_FOUND',
      retryable: false,
      details: { statusCode, originalMessage: message }
    };
  }
  
  // Invalid request errors
  if (statusCode === 400) {
    return {
      status: 'error',
      error: `Invalid request for ${operation}: ${message}`,
      code: 'INVALID_REQUEST',
      retryable: false,
      details: { statusCode, originalMessage: message }
    };
  }
  
  // Server errors (retryable)
  if (statusCode >= 500) {
    return {
      status: 'error',
      error: `Google server error for ${operation}. Please try again.`,
      code: 'SERVER_ERROR',
      retryable: true,
      details: { statusCode, originalMessage: message }
    };
  }
  
  // Generic error
  return {
    status: 'error',
    error: `Failed to ${operation}: ${message}`,
    code: 'UNKNOWN_ERROR',
    retryable: false,
    details: { statusCode, originalMessage: message }
  };
}

/**
 * Validate required parameters before API calls
 */
export function validateRequired(params: Record<string, any>, required: string[]): string | null {
  for (const field of required) {
    if (!params[field]) {
      return `Missing required parameter: ${field}`;
    }
  }
  return null;
}

/**
 * Sanitize search query to prevent injection
 */
export function sanitizeQuery(query: string): string {
  // Escape single quotes for Google Drive API queries
  return query.replace(/'/g, "\\'");
}

/**
 * Retry wrapper for transient errors with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Check if error is retryable
      const statusCode = error?.code || error?.response?.status;
      const isRetryable = statusCode === 429 || statusCode >= 500 || statusCode === 503;
      
      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = initialDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

