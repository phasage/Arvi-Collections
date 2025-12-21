// Error Handler Utility
// Centralized error handling for production

export class AppError extends Error {
  constructor(message, code, statusCode = 500) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export const ErrorCodes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

export const handleApiError = (error) => {
  // Network errors
  if (error.message === 'Network request failed' || !navigator.onLine) {
    return new AppError(
      'No internet connection. Please check your network.',
      ErrorCodes.NETWORK_ERROR,
      0
    );
  }

  // Timeout errors
  if (error.message.includes('timeout')) {
    return new AppError(
      'Request timed out. Please try again.',
      ErrorCodes.TIMEOUT_ERROR,
      408
    );
  }

  // Authentication errors
  if (error.statusCode === 401 || error.statusCode === 403) {
    return new AppError(
      'Authentication failed. Please login again.',
      ErrorCodes.AUTH_ERROR,
      error.statusCode
    );
  }

  // Validation errors
  if (error.statusCode === 400 || error.statusCode === 422) {
    return new AppError(
      error.message || 'Invalid request. Please check your input.',
      ErrorCodes.VALIDATION_ERROR,
      error.statusCode
    );
  }

  // Server errors
  if (error.statusCode >= 500) {
    return new AppError(
      'Server error. Please try again later.',
      ErrorCodes.SERVER_ERROR,
      error.statusCode
    );
  }

  // Unknown errors
  return new AppError(
    error.message || 'An unexpected error occurred.',
    ErrorCodes.UNKNOWN_ERROR,
    500
  );
};

export const logError = (error, context = {}) => {
  if (__DEV__) {
    console.error('Error:', error);
    console.error('Context:', context);
  } else {
    // In production, send to error tracking service (Sentry, Bugsnag, etc.)
    // Example: Sentry.captureException(error, { extra: context });
  }
};

export const getUserFriendlyMessage = (error) => {
  if (error instanceof AppError) {
    return error.message;
  }

  const errorMap = {
    [ErrorCodes.NETWORK_ERROR]: 'Please check your internet connection and try again.',
    [ErrorCodes.AUTH_ERROR]: 'Your session has expired. Please login again.',
    [ErrorCodes.VALIDATION_ERROR]: 'Please check your input and try again.',
    [ErrorCodes.SERVER_ERROR]: 'Something went wrong on our end. Please try again later.',
    [ErrorCodes.TIMEOUT_ERROR]: 'The request took too long. Please try again.',
    [ErrorCodes.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
  };

  return errorMap[error.code] || errorMap[ErrorCodes.UNKNOWN_ERROR];
};
