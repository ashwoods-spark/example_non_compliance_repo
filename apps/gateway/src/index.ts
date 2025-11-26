import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { loadConfig } from '@repo/shared-config';
import { login } from './routes/auth.js';
import {
  createScan,
  listScans,
  getScan,
  getScanHeatmap,
} from './routes/scans.js';
import { getFinding } from './routes/findings.js';
import {
  listRulesets,
  getRuleset,
  updateRuleset,
  createRulesetFromUpload,
  getRulesetDiff,
  exportRuleset,
} from './routes/rulesets.js';
import {
  uploadFile,
  getUpload,
  exportReport,
  getSummaryStats,
} from './routes/misc.js';

const config = loadConfig();

const fastify = Fastify({
  logger: true,
});

// Register plugins
await fastify.register(cors, {
  origin: true,
});

await fastify.register(jwt, {
  secret: config.jwtSecret,
});

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', service: 'gateway' };
});

// Auth routes
fastify.post('/api/login', login);

// Scan routes
fastify.post('/api/scans', createScan);
fastify.get('/api/scans', listScans);
fastify.get('/api/scans/:id', getScan);
fastify.get('/api/scans/:id/heatmap', getScanHeatmap);

// Finding routes
fastify.get('/api/findings/:id', getFinding);

// Ruleset routes
fastify.get('/api/rulesets', listRulesets);
fastify.post('/api/rulesets/from-upload/:uploadId', createRulesetFromUpload);
fastify.get('/api/rulesets/:id', getRuleset);
fastify.put('/api/rulesets/:id', updateRuleset);
fastify.get('/api/rulesets/:id/diff', getRulesetDiff);
fastify.get('/api/rulesets/:id/export', exportRuleset);

// Upload routes
fastify.post('/api/uploads', uploadFile);
fastify.get('/api/uploads/:id', getUpload);

// Report routes
fastify.post('/api/reports/:id/export', exportReport);

// Stats
fastify.get('/api/stats/summary', getSummaryStats);

const start = async () => {
  try {
    await fastify.listen({ port: config.port, host: '0.0.0.0' });
    console.log(`Gateway listening on port ${config.port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

