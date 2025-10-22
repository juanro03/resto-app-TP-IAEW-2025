# resto-app-TP-IAEW-2025
# Sistema de Pedidos del Restaurante — Etapa 1

## Diagramas C4
- Context: [docs/c4-context.png](docs/c4-context.png)
- Containers: [docs/c4-containers.png](docs/c4-containers.png)
- Components: [docs/c4-components.png](docs/c4-components.png)

## Decisiones de arquitectura
Ver ADRs en [docs/adrs/](docs/adrs/)

## Contrato de API
[openapi/api.yaml](openapi/api.yaml)

## Modelo de datos
- MongoDB (Replica Set)
- Script de migración y seed: [scripts/migrate-and-seed.js](scripts/migrate-and-seed.js)

## 🐳 Ejecución local
```bash
docker compose up -d
curl http://localhost:3000  
