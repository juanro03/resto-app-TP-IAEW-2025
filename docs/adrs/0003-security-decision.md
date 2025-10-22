# ADR 0003 — Seguridad: OAuth2 + JWT

## Contexto
La rúbrica exige OAuth2 con JWT, expiración y roles.

## Decisión
Usar **Keycloak** como servidor OAuth2 y JWT, con middleware de verificación en la API.

## Consecuencias
- ✅ Cumple estándar de seguridad.
- ✅ Tokens verificables sin conexión a Keycloak.
- ⚠️ Requiere configuración del realm en Docker Compose.
