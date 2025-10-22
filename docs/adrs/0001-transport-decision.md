# ADR 0001 — Estilo de Interfaz: REST sobre HTTP

## Contexto
La API debe exponer endpoints CRUD y contrato OpenAPI 3.1.  
Se busca compatibilidad con Postman y pruebas HTTP simples.

## Decisión
Implementar **API REST (HTTP/JSON)** con contrato **OpenAPI 3.1**.

## Consecuencias
- ✅ Sencillo de probar.
- ✅ Amplio soporte de herramientas.
- ⚠️ Para comunicación en tiempo real se complementa con WebSocket.
