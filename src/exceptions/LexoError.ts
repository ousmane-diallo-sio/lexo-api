import { Response } from "express";
import { formatResponse } from "../lib/utils/response.js";
import { ServerMessage } from "../types/response.js";

export class LexoError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  static sendFormatedResponse(res: Response, error?: unknown, args?: { status?: number, fallBackErrorMsg?: string }) {
    console.error(`❌ ${res.req?.method} ${res.req?.url} : \n${error}\n`);
    if (error instanceof LexoError) {
      return formatResponse(res, { 
        status: error.statusCode, 
        messages: [{ type: "error", message: error.message ?? args?.fallBackErrorMsg ?? "An error occurred" }],
      });
    }
    return formatResponse(res, {
      status: args?.status ?? 500,
      messages: [{ type: "error", message: args?.fallBackErrorMsg ?? "An error occurred" }]
    });
  }

}

export class NotFoundError extends LexoError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

export class ValidationError extends LexoError {
  constructor(message = "Validation failed") {
    super(message, 400);
  }
}

export class UnauthorizedError extends LexoError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

export class ForbiddenError extends LexoError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}