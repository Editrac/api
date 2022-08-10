import httpStatus from 'http-status';

/**
 * @extends Error
 */
export class ExtendableError extends Error {
  status: number;
  code: number;
  constructor(message: string, status: number, code: number) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.status = status;
    this.code = code;
  }
}

/**
 * Class representing an API error.
 * @extends ExtendableError
 */
export class APIError extends ExtendableError {
  /**
   * Creates an API error.
   * @param {string} message - Error message.
   * @param {number} status - HTTP status code of error.
   */
  constructor(message: string, status: number = httpStatus.INTERNAL_SERVER_ERROR, code: number = 400) {
    super(message, status, code);
  }
}

/**
 * Class representing an Mongo error.
 * @extends ExtendableError
 */
export class MongoError extends ExtendableError {
  /**
   * Creates an Mongo error.
   * @param {string} message - Error message.
   * @param {number} status - HTTP status code of error.
   */
  constructor(message: any, status: number = httpStatus.INTERNAL_SERVER_ERROR, code: number = 500) {
    super(message, status, code);
  }
}

export default APIError;
