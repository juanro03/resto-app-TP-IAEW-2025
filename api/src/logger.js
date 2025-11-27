import winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';

const esTransportOpts = {
  level: 'info',
  clientOpts: { node: 'http://elasticsearch:9200' },
  indexPrefix: 'logs-resto'
};

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  // ETIQUETA PARA LA API:
  defaultMeta: { service: 'api-restaurante' }, 
  transports: [
    new winston.transports.Console(),
    new ElasticsearchTransport(esTransportOpts)
  ],
});