import Fastify from 'fastify';
import { calculateBenefit } from './formula.js';
import { BenefitCalcSchema, BenefitResult } from '@repo/shared-types';

const fastify = Fastify({
  logger: true,
});

fastify.post<{ Body: unknown }>('/internal/benefits/calc', async (request, reply) => {
  const result = BenefitCalcSchema.safeParse(request.body);
  
  if (!result.success) {
    return reply.code(400).send({ error: 'Invalid request', details: result.error });
  }
  
  const calcResult = calculateBenefit(result.data);
  
  const response: BenefitResult = {
    amount: calcResult.amount,
    reduction: calcResult.reduction,
    capped: calcResult.capped,
  };
  
  return response;
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

