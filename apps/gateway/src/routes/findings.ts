import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@repo/shared-db';

export async function getFinding(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  
  const finding = await prisma.finding.findUnique({
    where: { id },
  });
  
  if (!finding) {
    return reply.code(404).send({ error: 'Finding not found' });
  }
  
  return finding;
}

