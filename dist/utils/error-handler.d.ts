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
export declare function handleGoogleApiError(error: any, operation: string): ErrorResult;
/**
 * Validate required parameters before API calls
 */
export declare function validateRequired(params: Record<string, any>, required: string[]): string | null;
/**
 * Sanitize search query to prevent injection
 */
export declare function sanitizeQuery(query: string): string;
/**
 * Retry wrapper for transient errors with exponential backoff
 */
export declare function retryWithBackoff<T>(operation: () => Promise<T>, maxRetries?: number, initialDelay?: number): Promise<T>;
//# sourceMappingURL=error-handler.d.ts.map