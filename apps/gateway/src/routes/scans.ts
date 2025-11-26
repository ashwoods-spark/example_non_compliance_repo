import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@repo/shared-db';
import { CreateScanSchema } from '@repo/shared-types';
import { Queue } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

const scanQueue = new Queue('scans', { connection });

export async function createScan(request: FastifyRequest, reply: FastifyReply) {
  const result = CreateScanSchema.safeParse(request.body);
  
  if (!result.success) {
    return reply.code(400).send({ error: 'Invalid request', details: result.error });
  }
  
  const { repoUrl, branch } = result.data;
  
  const scan = await prisma.scan.create({
    data: {
      repoUrl,
      branch,
      status: 'queued',
    },
  });
  
  // Queue the scan job
  await scanQueue.add('scan-repo', {
    scanId: scan.id,
    repoUrl: scan.repoUrl,
    branch: scan.branch,
  });
  
  return scan;
}

export async function listScans(request: FastifyRequest, reply: FastifyReply) {
  const scans = await prisma.scan.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  
  return scans;
}

export async function getScan(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  
  const scan = await prisma.scan.findUnique({
    where: { id },
    include: {
      findings: true,
    },
  });
  
  if (!scan) {
    return reply.code(404).send({ error: 'Scan not found' });
  }
  
  return scan;
}

export async function getScanHeatmap(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  
  const findings = await prisma.finding.findMany({
    where: { scanId: id },
  });
  
  // Group by file and severity
  const heatmap = findings.reduce((acc, finding) => {
    const existing = acc.find((item) => item.file === finding.filePath);
    
    if (existing) {
      existing.findingCount++;
      // Escalate severity if needed
      const severities = ['info', 'low', 'medium', 'high', 'critical'];
      const currentIndex = severities.indexOf(existing.severity);
      const newIndex = severities.indexOf(finding.severity);
      if (newIndex > currentIndex) {
        existing.severity = finding.severity;
      }
    } else {
      acc.push({
        file: finding.filePath,
        findingCount: 1,
        severity: finding.severity,
      });
    }
    
    return acc;
  }, [] as Array<{ file: string; findingCount: number; severity: string }>);
  
  return heatmap;
}

