export interface JWTPayloadDTO {
  id: string;
  email: string;
}

export interface JWTPayload {
  id: string;
  email: string;
  iat: number;
  exp: number;
}