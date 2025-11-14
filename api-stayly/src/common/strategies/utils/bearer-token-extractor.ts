import type { Request } from 'express';

export type RequestTokenExtractor = (req: Request) => string | null;

export const bearerTokenExtractor: RequestTokenExtractor = (req: Request) => {
  if (!req || typeof req !== 'object') {
    return null;
  }
  const authorizationHeader = req.headers?.authorization;
  if (typeof authorizationHeader !== 'string') {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');
  if (typeof token === 'string' && /^Bearer$/i.test(scheme)) {
    return token;
  }
  return null;
};
