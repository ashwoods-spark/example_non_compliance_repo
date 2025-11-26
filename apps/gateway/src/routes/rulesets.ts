import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@repo/shared-db';
import { CreateRulesetFromUploadSchema } from '@repo/shared-types';

export async function listRulesets(request: FastifyRequest, reply: FastifyReply) {
  const rulesets = await prisma.ruleset.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      rules: true,
    },
  });
  
  return rulesets;
}

export async function getRuleset(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  
  const ruleset = await prisma.ruleset.findUnique({
    where: { id },
    include: {
      rules: true,
    },
  });
  
  if (!ruleset) {
    return reply.code(404).send({ error: 'Ruleset not found' });
  }
  
  return ruleset;
}

export async function updateRuleset(
  request: FastifyRequest<{ Params: { id: string }; Body: unknown }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  const body = request.body as any;
  
  const ruleset = await prisma.ruleset.update({
    where: { id },
    data: {
      status: body.status || undefined,
      version: body.version || undefined,
    },
    include: {
      rules: true,
    },
  });
  
  return ruleset;
}

export async function createRulesetFromUpload(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const result = CreateRulesetFromUploadSchema.safeParse(request.body);
  
  if (!result.success) {
    return reply.code(400).send({ error: 'Invalid request', details: result.error });
  }
  
  // Call compliance engine service
  const complianceUrl = process.env.SVC_COMPLIANCE_URL || 'http://localhost:3003';
  const response = await fetch(`${complianceUrl}/internal/rulesets/fromUpload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result.data),
  });
  
  if (!response.ok) {
    return reply.code(500).send({ error: 'Failed to create ruleset from upload' });
  }
  
  return response.json();
}

export async function getRulesetDiff(
  request: FastifyRequest<{ Params: { id: string }; Querystring: { from?: string; to?: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  const { from, to } = request.query;
  
  const complianceUrl = process.env.SVC_COMPLIANCE_URL || 'http://localhost:3003';
  const url = new URL(`${complianceUrl}/internal/rulesets/${id}/diff`);
  if (from) url.searchParams.set('from', from);
  if (to) url.searchParams.set('to', to);
  
  const response = await fetch(url.toString());
  
  if (!response.ok) {
    return reply.code(response.status).send({ error: 'Failed to generate diff' });
  }
  
  return response.json();
}

export async function exportRuleset(
  request: FastifyRequest<{ Params: { id: string }; Querystring: { format?: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  const { format } = request.query;
  
  const ruleset = await prisma.ruleset.findUnique({
    where: { id },
    include: {
      rules: true,
    },
  });
  
  if (!ruleset) {
    return reply.code(404).send({ error: 'Ruleset not found' });
  }
  
  let content = '';
  
  if (format === 'json') {
    content = JSON.stringify(ruleset, null, 2);
  } else if (format === 'yaml') {
    // Simplified YAML export
    content = `name: ${ruleset.name}\nversion: ${ruleset.version}\nstatus: ${ruleset.status}\nrules:\n`;
    ruleset.rules.forEach((rule) => {
      content += `  - section: ${rule.sectionRef}\n    title: ${rule.title}\n`;
    });
  } else {
    // Plain text
    content = `${ruleset.name} (v${ruleset.version})\n\n`;
    ruleset.rules.forEach((rule) => {
      content += `${rule.sectionRef}: ${rule.title}\n`;
      content += `  When: ${rule.whenText}\n`;
      content += `  Then: ${rule.thenText}\n\n`;
    });
  }
  
  // Return data URL
  const dataUrl = `data:text/plain;base64,${Buffer.from(content).toString('base64')}`;
  
  return { url: dataUrl };
}

