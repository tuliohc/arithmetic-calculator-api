import dotenv from 'dotenv';
dotenv.config();

interface EnvConfig {
  [key: string]: string;
}

export const environment: EnvConfig = {
  PORT: process.env.PORT || '3000',
  API_VERSION: process.env.API_VERSION || 'v1',
  JWT_SECRET: process.env.JWT_SECRET || 'truenorth',
  MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017/truenorth',
  JWT_TOKEN_EXPIRATION_TIME: process.env.JWT_TOKEN_EXPIRATION_TIME || '5m'
};