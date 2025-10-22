# ADR 0002 — Base de datos: MongoDB (NoSQL)

## Contexto
Se requiere almacenar `pedidos` con sus `items` embebidos y productos con stock.

## Decisión
Usar **MongoDB 6** en modo Replica Set (permite transacciones).  
ORM: **Mongoose**.

## Consecuencias
- ✅ Estructura flexible y veloz.
- ✅ Permite rollback con transacciones.
- ⚠️ Integridad referencial gestionada a nivel aplicación.
