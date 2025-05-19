import { NextFunction, Request, Response } from "express";
import { expressjwt } from "express-jwt";
import EnvConfig from "./config/EnvConfig.js";
import { formatResponse } from "./utils/response.js";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  res.on('finish', () => {
    if (req.originalUrl === '/') return;

    const yellow = '\x1b[33m';
    const reset = '\x1b[0m';
    console.log(`${yellow}${req.method}${reset} ${req.originalUrl} --> ${res.statusCode}`);
  });

  next();
}

export const jwt = expressjwt({ secret: EnvConfig.JWT_SECRET, algorithms: ['HS256'] });

export const authErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.name === 'UnauthorizedError') {
    return formatResponse(res, { status: 401, messages: [{ type: "error", message: "invalid-token" }] });
  }
  next();
}