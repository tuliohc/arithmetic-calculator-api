import dotenv from 'dotenv';
dotenv.config();

interface EnvConfig {
  [key: string]: string;
}

export const environment: EnvConfig = {
  PORT: process.env.PORT || '3000',
  API_VERSION: process.env.API_VERSION || 'v1',
  JWT_SECRET: process.env.JWT_SECRET || 'truenorth',
  JWT_TOKEN_EXPIRATION_TIME: process.env.JWT_TOKEN_EXPIRATION_TIME || '120',
  MONGO_URL: process.env.MONGO_URL || 'mongodb://db:27017/truenorth',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3001'
};