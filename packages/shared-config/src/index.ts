import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config();

export interface AppConfig {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  redisUrl: string;
  jwtSecret: string;
  featureFlags: {
    useLegacyRounding: boolean;
    enableComplianceEngine: boolean;
  };
}

export function loadConfig(): AppConfig {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/benefits_db',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    jwtSecret: process.env.JWT_SECRET || 'demo-secret-key-change-in-production',
    featureFlags: {
      useLegacyRounding: process.env.USE_LEGACY_ROUNDING === 'true',
      enableComplianceEngine: process.env.ENABLE_COMPLIANCE_ENGINE !== 'false',
    },
  };
}

export function loadJsonConfig<T>(filePath: string): T {
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Config file not found: ${fullPath}`);
  }
  return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
}

