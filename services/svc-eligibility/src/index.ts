import Fastify from 'fastify';
import { checkDutyStatus } from './age.js';
import { checkServiceEligibility } from './service.js';
import { checkImpairmentEligibility } from './impairment.js';
import { z } from 'zod';

const fastify = Fastify({
  logger: true,
});

const ClaimEligibilitySchema = z.object({
  serviceDays: z.number(),
  onDuty: z.boolean(),
  injuryDuringService: z.boolean(),
  impairmentPoints: z.number().optional(),
});

const ClaimEligibilityResult = z.object({
  eligible: z.boolean(),
  serviceOk: z.boolean(),
  dutyStatusOk: z.boolean(),
  impairmentOk: z.boolean().optional(),
  reasons: z.array(z.string()),
});

fastify.post<{ Body: unknown }>('/internal/eligibility/check', async (request, reply) => {
  const result = ClaimEligibilitySchema.safeParse(request.body);
  
  if (!result.success) {
    return reply.code(400).send({ error: 'Invalid request', details: result.error });
  }
  
  const { serviceDays, onDuty, injuryDuringService, impairmentPoints } = result.data;
  
  const serviceCheck = checkServiceEligibility(serviceDays);
  const dutyCheck = checkDutyStatus(onDuty, injuryDuringService);
  
  const reasons: string[] = [];
  if (!serviceCheck.eligible && serviceCheck.reason) {
    reasons.push(serviceCheck.reason);
  }
  if (!dutyCheck.eligible && dutyCheck.reason) {
    reasons.push(dutyCheck.reason);
  }
  
  let impairmentCheck = null;
  if (impairmentPoints !== undefined) {
    impairmentCheck = checkImpairmentEligibility(impairmentPoints);
    if (!impairmentCheck.eligible && impairmentCheck.reason) {
      reasons.push(impairmentCheck.reason);
    }
  }
  
  const response = {
    eligible: serviceCheck.eligible && dutyCheck.eligible,
    serviceOk: serviceCheck.eligible,
    dutyStatusOk: dutyCheck.eligible,
    impairmentOk: impairmentCheck?.eligible,
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

