export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }

  static badRequest(message = 'Invalid request', code = 'BAD_REQUEST') {
    return new ApiError(400, code, message);
  }

  static unauthorized(message = 'Authentication required', code = 'UNAUTHORIZED') {
    return new ApiError(401, code, message);
  }

  static forbidden(message = 'Not allowed', code = 'FORBIDDEN') {
    return new ApiError(403, code, message);
  }

  static notFound(message = 'Not found', code = 'NOT_FOUND') {
    return new ApiError(404, code, message);
  }
}
