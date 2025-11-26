import Fastify from 'fastify';
import { checkAgeEligibility } from './age.js';
import { checkResidencyEligibility } from './residency.js';
import { EligibilityCheckSchema, EligibilityResult } from '@repo/shared-types';

const fastify = Fastify({
  logger: true,
});

fastify.post<{ Body: unknown }>('/internal/eligibility/check', async (request, reply) => {
  const result = EligibilityCheckSchema.safeParse(request.body);
  
  if (!result.success) {
    return reply.code(400).send({ error: 'Invalid request', details: result.error });
  }
  
  const { age, residencyMonths } = result.data;
  
  const ageCheck = checkAgeEligibility(age);
  const residencyCheck = checkResidencyEligibility(residencyMonths);
  
  const reasons: string[] = [];
  if (!ageCheck.eligible && ageCheck.reason) {
    reasons.push(ageCheck.reason);
  }
  if (!residencyCheck.eligible && residencyCheck.reason) {
    reasons.push(residencyCheck.reason);
  }
  
  const response: EligibilityResult = {
    eligible: ageCheck.eligible && residencyCheck.eligible,
    isSenior: ageCheck.eligible,
    residencyOk: residencyCheck.eligible,
    reasons,
  };
  
  return response;
});

fastify.get('/health', async () => {
  return { status: 'ok', service: 'svc-eligibility' };
});

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001', 10);
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Eligibility service listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

