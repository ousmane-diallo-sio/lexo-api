import { Response } from "express";
import { ServerResponse } from "../../types/response.js";

export const formatResponse = <T>(res: Response, resData: ServerResponse<T>) => {
  const { status, data, messages, jwt, code } = resData;

  return res.status(status).json({
    status,
    data,
    messages,
    code,
    jwt,
  });
}

export enum ServerCode {
  GOOGLE_USER_WITH_EMAIL_ALREADY_EXISTS = "GOOGLE_USER_WITH_EMAIL_ALREADY_EXISTS",
}