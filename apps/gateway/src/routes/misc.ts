import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@repo/shared-db';
import defaultsConfig from '../config/defaults.json' assert { type: 'json' };

export async function uploadFile(request: FastifyRequest, reply: FastifyReply) {
  // Mock file upload
  const upload = await prisma.upload.create({
    data: {
      fileName: 'document.pdf',
      mimeType: 'application/pdf',
      size: 12345,
      status: 'completed',
    },
  });
  
  return upload;
}

export async function getUpload(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  
  const upload = await prisma.upload.findUnique({
    where: { id },
  });
  
  if (!upload) {
    return reply.code(404).send({ error: 'Upload not found' });
  }
  
  return upload;
}

export async function exportReport(
  request: FastifyRequest<{ Params: { id: string }; Body: unknown }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  const body = request.body as any;
  
  const scan = await prisma.scan.findUnique({
    where: { id },
    include: {
      findings: true,
    },
  });
  
  if (!scan) {
    return reply.code(404).send({ error: 'Scan not found' });
  }
  
  // Generate mock export
  let content = '';
  
  if (body.format === 'json') {
    content = JSON.stringify({ scan, findings: scan.findings }, null, 2);
  } else if (body.format === 'csv') {
    content = 'ID,Severity,Law Section,File Path,Line\n';
    scan.findings.forEach((f) => {
      content += `${f.id},${f.severity},${f.lawSection},${f.filePath},${f.lineStart}\n`;
    });
  } else {
    // PDF placeholder
    content = `Scan Report: ${scan.repoUrl}\nFindings: ${scan.findings.length}`;
  }
  
  const dataUrl = `data:text/plain;base64,${Buffer.from(content).toString('base64')}`;
  
  return { url: dataUrl };
}

// IMPLICIT MISMATCH: This summary endpoint uses cap from defaults.json (92000)
export async function getSummaryStats(request: FastifyRequest, reply: FastifyReply) {
  const totalScans = await prisma.scan.count();
  const completedScans = await prisma.scan.count({
    where: { status: 'completed' },
  });
  const totalFindings = await prisma.finding.count();
  
  // Using cap from gateway defaults (92k) - another source of truth
  const configuredCap = defaultsConfig.cap;
  
  return {
    totalScans,
    completedScans,
    totalFindings,
    environment: defaultsConfig.environment,
    region: defaultsConfig.region,
    incomeCap: configuredCap, // 92000 - inconsistent with legislation (85k) and service config (90k)
  };
}

