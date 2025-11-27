import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { logger } from "../logger.js";


// Construimos jwksUri a partir del issuer del realm
const issuer = process.env.KEYCLOAK_ISSUER;
const jwksUri = process.env.KEYCLOAK_JWKS_URL;


const client = jwksClient({
  jwksUri
});

// Keycloak usa firmas RS256 con kid dinámico
function getKey(header, callback) {
  client.getSigningKey(header.kid, function(err, key) {
    if (err) return callback(err);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

/**
 * Middleware flexible:
 * - Si no pasás requiredRole → solo valida token
 * - Si pasás requiredRole → también valida roles
 */
export function auth(requiredRole) {

  return (req, res, next) => {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.substring(7) : null;

    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }

    jwt.verify(
      token,
      getKey,
      {
        algorithms: ["RS256"],
        issuer: issuer // VALIDAMOS EMISOR (muy importante)
      },
      (err, payload) => {
        if (err) {
          logger.warn({ msg: "JWT inválido", err });
          return res.status(401).json({ error: "Invalid token", detail: err.message });
        }

        // Keycloak: roles del realm
        const roles = payload?.realm_access?.roles || [];

        if (requiredRole && !roles.includes(requiredRole)) {
          return res.status(403).json({ error: "Forbidden: missing role", requiredRole });
        }

        req.user = payload;
        next();
      }
    );
  };
}
