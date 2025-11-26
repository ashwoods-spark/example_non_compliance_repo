import Fastify from 'fastify';
import { calculateWeeklyCompensation, checkMedicalCostApproval } from './formula.js';
import { z } from 'zod';

const fastify = Fastify({
  logger: true,
});

const CompensationCalcSchema = z.object({
  normalWeeklyEarnings: z.number(),
});

const MedicalCostCheckSchema = z.object({
  totalCost: z.number(),
});

fastify.post<{ Body: unknown }>('/internal/compensation/calc', async (request, reply) => {
  const result = CompensationCalcSchema.safeParse(request.body);
  
  if (!result.success) {
    return reply.code(400).send({ error: 'Invalid request', details: result.error });
  }
  
  const calcResult = calculateWeeklyCompensation(result.data);
  
  return calcResult;
});

fastify.post<{ Body: unknown }>('/internal/medical/check', async (request, reply) => {
  const result = MedicalCostCheckSchema.safeParse(request.body);
  
  if (!result.success) {
    return reply.code(400).send({ error: 'Invalid request', details: result.error });
  }
  
  const checkResult = checkMedicalCostApproval(result.data);
  
  return checkResult;
});

fastify.get('/health', async () => {
  return { status: 'ok', service: 'svc-benefits' };
});

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3002', 10);
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Benefits service listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

