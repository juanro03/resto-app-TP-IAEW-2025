import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa'; // si querés automatizar claves (opcional)
import { logger } from '../logger.js';

const client = jwksClient({
  jwksUri: process.env.JWKS_URI // url de JWKS de tu realm de Keycloak
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function(err, key) {
    if (err) return callback(err);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

export function authMiddleware(requiredRole) {
  return (req, res, next) => {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.substring(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Missing token' });
    }

    jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, payload) => {
      if (err) {
        logger.warn({ msg: 'JWT inválido', err });
        return res.status(401).json({ error: 'Invalid token' });
      }

      // roles de Keycloak: realm_access.roles
      const roles = payload?.realm_access?.roles || [];

      if (requiredRole && !roles.includes(requiredRole)) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      req.user = payload;
      next();
    });
  };
}
