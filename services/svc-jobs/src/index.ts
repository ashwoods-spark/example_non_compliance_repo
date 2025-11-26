import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { prisma } from '@repo/shared-db';
import manifest from '../fixtures/repo_manifest.json' assert { type: 'json' };

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const scanQueue = new Queue('scans', { connection });

interface ScanJobData {
  scanId: string;
  repoUrl: string;
  branch: string;
}

// Simulated findings that reflect the mismatches in the codebase
function generateMockFindings(scanId: string) {
  return [
    {
      scanId,
      severity: 'high',
      confidence: 85,
      lawSection: 'SSA1991 s.35(2)',
      lawExcerpt: 'Individuals aged 65 years or older qualify for the senior benefit rate',
      filePath: 'src/eligibility/age.ts',
      lineStart: 5,
      lineEnd: 7,
      rationale: 'Age threshold check uses 70 instead of the prescribed 65 years. This excludes individuals aged 65-69 who should be eligible for senior rates.',
      recommendation: 'Update isSeniorAge() function to check age >= 65 to align with SSA1991 s.35(2).',
    },
    {
      scanId,
      severity: 'high',
      confidence: 90,
      lawSection: 'SSA1991 s.12(3)',
      lawExcerpt: 'Minimum 10 months Australian residency required for eligibility',
      filePath: 'src/eligibility/residency.ts',
      lineStart: 12,
      lineEnd: 17,
      rationale: 'Residency requirement enforces 12 months minimum instead of the legislated 10 months, creating a more restrictive barrier than intended.',
      recommendation: 'Change minimum residency check from 12 to 10 months per SSA1991 s.12(3).',
    },
    {
      scanId,
      severity: 'critical',
      confidence: 95,
      lawSection: 'SSA1991 s.40',
      lawExcerpt: 'Income exceeding $85,000 triggers benefit reduction',
      filePath: 'src/config/thresholds.json',
      lineStart: 2,
      lineEnd: 2,
      rationale: 'Income cap configured at $90,000 but legislation prescribes $85,000. This allows overpayments for individuals with income between $85-90k.',
      recommendation: 'Update incomeCap in thresholds.json to 85000 to match SSA1991 s.40 prescribed amount.',
    },
    {
      scanId,
      severity: 'medium',
      confidence: 80,
      lawSection: 'SSA1991 s.40',
      lawExcerpt: 'All monetary calculations shall use round-half-up methodology to 2 decimal places',
      filePath: 'src/benefits/formula.ts',
      lineStart: 45,
      lineEnd: 46,
      rationale: 'Benefit calculations use floor() rounding instead of round-half-up. This systematically underpays beneficiaries by small amounts.',
      recommendation: 'Replace floor(amount, 2) with roundHalfUp(amount, 2) to comply with rounding convention.',
    },
    {
      scanId,
      severity: 'medium',
      confidence: 75,
      lawSection: 'SSA1991 s.40',
      lawExcerpt: 'Income exceeding $85,000 triggers benefit reduction',
      filePath: 'src/api/handlers/summary.ts',
      lineStart: 23,
      lineEnd: 23,
      rationale: 'Summary endpoint uses hardcoded cap of $92,000, inconsistent with both legislation ($85k) and main config ($90k). Creates conflicting information.',
      recommendation: 'Remove hardcoded value and reference centralized configuration aligned with legislation.',
    },
    {
      scanId,
      severity: 'low',
      confidence: 70,
      lawSection: 'SSA1991 s.12(3)',
      lawExcerpt: 'Minimum 10 months Australian residency required',
      filePath: 'src/utils/date.ts',
      lineStart: 8,
      lineEnd: 12,
      rationale: 'Month calculation uses 30 days/month instead of actual days, causing drift in edge cases. May incorrectly calculate residency period.',
      recommendation: 'Use date-fns or similar library for accurate month calculations, or document the approximation and its acceptable margin.',
    },
  ];
}

const worker = new Worker<ScanJobData>(
  'scans',
  async (job: Job<ScanJobData>) => {
    console.log(`Processing scan job ${job.id} for scan ${job.data.scanId}`);
    
    const { scanId } = job.data;
    
    // Update scan to running
    await prisma.scan.update({
      where: { id: scanId },
      data: {
        status: 'running',
        startedAt: new Date(),
      },
    });
    
    await job.updateProgress(10);
    
    // Simulate scanning phases
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await job.updateProgress(30);
    
    console.log(`Analyzing ${manifest.files.length} files...`);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await job.updateProgress(60);
    
    // Generate findings
    const findings = generateMockFindings(scanId);
    
    await job.updateProgress(80);
    
    // Insert findings
    for (const finding of findings) {
      await prisma.finding.create({
        data: finding,
      });
    }
    
    await job.updateProgress(95);
    
    // Calculate coverage
    const coveragePct = 72.5;
    
    // Mark scan complete
    await prisma.scan.update({
      where: { id: scanId },
      data: {
        status: 'completed',
        finishedAt: new Date(),
        coveragePct,
      },
    });
    
    await job.updateProgress(100);
    
    console.log(`Scan ${scanId} completed with ${findings.length} findings`);
    
    return { scanId, findingsCount: findings.length };
  },
  { connection }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

console.log('Job worker started');

// Graceful shutdown
process.on('SIGTERM', async () => {
  await worker.close();
  await connection.quit();
});

