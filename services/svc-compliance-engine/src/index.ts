import Fastify from 'fastify';
import { prisma } from '@repo/shared-db';
import { loadLegislationRules, parseRulesToRuleset, generateDiffText } from './legislation.js';

const fastify = Fastify({
  logger: true,
});

fastify.get('/internal/legislation/rules', async () => {
  try {
    const rules = loadLegislationRules();
    return rules;
  } catch (error) {
    return { error: 'Failed to load legislation rules' };
  }
});

fastify.post<{ Body: { uploadId: string; name: string } }>(
  '/internal/rulesets/fromUpload',
  async (request, reply) => {
    const { uploadId, name } = request.body;
    
    // Mock extraction - in reality would parse uploaded document
    const upload = await prisma.upload.findUnique({
      where: { id: uploadId },
    });
    
    if (!upload) {
      return reply.code(404).send({ error: 'Upload not found' });
    }
    
    // Create draft ruleset from upload
    const ruleset = await prisma.ruleset.create({
      data: {
        name,
        source: 'upload',
        version: 1,
        status: 'draft',
        rules: {
          create: [
            {
              sectionRef: 'Extracted-1',
              title: 'Sample extracted rule',
              whenText: 'condition from document',
              thenText: 'action from document',
              citations: [],
            },
          ],
        },
      },
      include: {
        rules: true,
      },
    });
    
    return ruleset;
  }
);

fastify.get<{ Params: { id: string }; Querystring: { from?: string; to?: string } }>(
  '/internal/rulesets/:id/diff',
  async (request, reply) => {
    const { id } = request.params;
    const { from, to } = request.query;
    
    const ruleset = await prisma.ruleset.findUnique({
      where: { id },
    });
    
    if (!ruleset) {
      return reply.code(404).send({ error: 'Ruleset not found' });
    }
    
    const fromVersion = from ? parseInt(from.replace('v', ''), 10) : 1;
    const toVersion = to ? parseInt(to.replace('v', ''), 10) : ruleset.version;
    
    const diffText = generateDiffText(fromVersion, toVersion);
    
    return { diffText };
  }
);

fastify.get('/health', async () => {
  return { status: 'ok', service: 'svc-compliance-engine' };
});

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3003', 10);
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Compliance engine service listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

