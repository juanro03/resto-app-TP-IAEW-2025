import 'dotenv/config';

export const config = {
  port: process.env.API_PORT || 3000,
  mongoUrl: process.env.MONGO_URL || 'mongodb://mongo:27017/resto?replicaSet=rs0',
  rabbitUrl: process.env.RABBIT_URL || 'amqp://rabbitmq',
  jwtIssuer: process.env.JWT_ISSUER || 'http://keycloak:8080/realms/resto',
  jwtAudience: process.env.JWT_AUDIENCE || 'resto-api'
};
