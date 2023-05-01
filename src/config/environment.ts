import dotenv from 'dotenv';
dotenv.config();

interface EnvConfig {
  [key: string]: string;
}

export const environment: EnvConfig = {
  PORT: process.env.PORT || '3000',
  API_VERSION: process.env.API_VERSION || 'v1',
  JWT_SECRET: process.env.JWT_SECRET || 'truenorth',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/truenorth'
};