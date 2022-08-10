"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoError = exports.APIError = exports.ExtendableError = void 0;
const http_status_1 = __importDefault(require("http-status"));
/**
 * @extends Error
 */
class ExtendableError extends Error {
    constructor(message, status, code) {
        super(message);
        this.name = this.constructor.name;
        this.message = message;
        this.status = status;
        this.code = code;
    }
}
exports.ExtendableError = ExtendableError;
/**
 * Class representing an API error.
 * @extends ExtendableError
 */
class APIError extends ExtendableError {
    /**
     * Creates an API error.
     * @param {string} message - Error message.
     * @param {number} status - HTTP status code of error.
     */
    constructor(message, status = http_status_1.default.INTERNAL_SERVER_ERROR, code = 400) {
        super(message, status, code);
    }
}
exports.APIError = APIError;
/**
 * Class representing an Mongo error.
 * @extends ExtendableError
 */
class MongoError extends ExtendableError {
    /**
     * Creates an Mongo error.
     * @param {string} message - Error message.
     * @param {number} status - HTTP status code of error.
     */
    constructor(message, status = http_status_1.default.INTERNAL_SERVER_ERROR, code = 500) {
        super(message, status, code);
    }
}
exports.MongoError = MongoError;
exports.default = APIError;
