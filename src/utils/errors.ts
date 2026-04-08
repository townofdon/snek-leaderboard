
export class ValidationError extends Error {
  constructor(public message: string) {
    super(message);
    this.name = 'BadRequestError';
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}

