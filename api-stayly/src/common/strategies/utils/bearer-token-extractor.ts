import type { JwtFromRequestFunction } from 'passport-jwt';

export const bearerTokenExtractor: JwtFromRequestFunction = (req) => {
  const authorizationHeader = req?.headers?.authorization;
  if (!authorizationHeader || typeof authorizationHeader !== 'string') {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');
  if (typeof token === 'string' && /^Bearer$/i.test(scheme)) {
    return token;
  }
  return null;
};
