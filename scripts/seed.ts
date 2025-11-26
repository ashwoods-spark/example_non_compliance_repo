import { prisma } from '@repo/shared-db';
import * as fs from 'fs';
import * as path from 'path';

async function seed() {
  console.log('Seeding database...');
  
  // Clear existing data
  await prisma.finding.deleteMany();
  await prisma.report.deleteMany();
  await prisma.scan.deleteMany();
  await prisma.rule.deleteMany();
  await prisma.ruleset.deleteMany();
  await prisma.upload.deleteMany();
  
  console.log('Creating baseline ruleset from legislation...');
  
  // Load legislation rules
  const legislationPath = path.resolve(process.cwd(), '../legislation/DEFGLIS_rules.json');
  const legislationRules = JSON.parse(fs.readFileSync(legislationPath, 'utf-8'));
  
  // Create baseline ruleset from legislation
  const baselineRuleset = await prisma.ruleset.create({
    data: {
      name: 'DEFGLIS Baseline',
      source: 'legislation',
      version: 2,
      status: 'active',
      rules: {
        create: legislationRules.sections.map((section: any) => ({
          sectionRef: section.id,
          title: section.title,
          whenText: section.when,
          thenText: section.then,
          citations: [section.id],
        })),
      },
    },
  });
  
  console.log(`Created ruleset: ${baselineRuleset.id}`);
  
  // Create a mock upload
  const upload = await prisma.upload.create({
    data: {
      fileName: 'policy-document-2024.pdf',
      mimeType: 'application/pdf',
      size: 524288,
      status: 'completed',
    },
  });
  
  console.log(`Created upload: ${upload.id}`);
  
  // Create draft ruleset from upload
  const draftRuleset = await prisma.ruleset.create({
    data: {
      name: 'Extracted Policy Rules (Draft)',
      source: 'upload',
      version: 1,
      status: 'draft',
      rules: {
        create: [
          {
            sectionRef: 'POL-2024-01',
            title: 'Extracted eligibility rule',
            whenText: 'applicant meets criteria',
            thenText: 'proceed with assessment',
            citations: ['policy-document-2024.pdf', 'page 15'],
          },
        ],
      },
    },
  });
  
  console.log(`Created draft ruleset: ${draftRuleset.id}`);
  
  // Create completed scan with findings
  console.log('Creating completed scan with findings...');
  
  const completedScan = await prisma.scan.create({
    data: {
      repoUrl: 'https://github.com/example/benefits-app',
      branch: 'main',
      status: 'completed',
      startedAt: new Date(Date.now() - 600000), // 10 min ago
      finishedAt: new Date(Date.now() - 300000), // 5 min ago
      coveragePct: 72.5,
    },
  });
  
  // Create findings for completed scan (reflecting the mismatches in the code)
  await prisma.finding.createMany({
    data: [
      {
        scanId: completedScan.id,
        severity: 'high',
        confidence: 90,
        lawSection: 'DEFGLIS s.19',
        lawExcerpt: 'Minimum 90 days continuous service required for rehabilitation benefits',
        filePath: 'src/eligibility/service.ts',
        lineStart: 5,
        lineEnd: 7,
        rationale: 'Service period check requires 120 days instead of the legislated 90 days. This creates a more restrictive barrier than intended by DEFGLIS s.19, potentially excluding eligible defence members.',
        recommendation: 'Update hasMinimumService() function to check serviceDays >= 90 to align with DEFGLIS s.19. This will extend eligibility to members with 90-119 days of service.',
      },
      {
        scanId: completedScan.id,
        severity: 'high',
        confidence: 85,
        lawSection: 'DEFGLIS s.68',
        lawExcerpt: 'Permanent impairment compensation payable at 10+ impairment points',
        filePath: 'src/eligibility/impairment.ts',
        lineStart: 4,
        lineEnd: 7,
        rationale: 'Impairment threshold check uses 15 points instead of the legislated 10 points. This excludes members with 10-14 impairment points who should be eligible for lump sum compensation.',
        recommendation: 'Change meetsImpairmentThreshold() to check impairmentPoints >= 10 per DEFGLIS s.68. This ensures members at the lower threshold receive entitled benefits.',
      },
      {
        scanId: completedScan.id,
        severity: 'critical',
        confidence: 95,
        lawSection: 'DEFGLIS s.27',
        lawExcerpt: 'Medical costs exceeding $5,000 require prior approval',
        filePath: 'src/config/thresholds.json',
        lineStart: 2,
        lineEnd: 2,
        rationale: 'Medical cost cap configured at $6,000 but legislation prescribes $5,000. This means approvals are only triggered at $6k when they should occur at $5k, creating potential unauthorized expenditure.',
        recommendation: 'Update medicalCostCap in thresholds.json to 5000 to match DEFGLIS s.27 prescribed amount.',
      },
      {
        scanId: completedScan.id,
        severity: 'high',
        confidence: 92,
        lawSection: 'DEFGLIS s.24(1)',
        lawExcerpt: 'Weekly compensation at 85% of normal weekly earnings',
        filePath: 'src/config/thresholds.json',
        lineStart: 3,
        lineEnd: 3,
        rationale: 'Weekly compensation rate configured at 82% instead of legislated 85%. This systematically underpays defence members by 3% of their weekly compensation entitlement.',
        recommendation: 'Update weeklyCompensationRate in thresholds.json from 0.82 to 0.85 to comply with DEFGLIS s.24(1).',
      },
      {
        scanId: completedScan.id,
        severity: 'medium',
        confidence: 80,
        lawSection: 'DEFGLIS s.27',
        lawExcerpt: 'All monetary calculations shall use round-half-up methodology to 2 decimal places',
        filePath: 'src/benefits/formula.ts',
        lineStart: 45,
        lineEnd: 46,
        rationale: 'Compensation calculations use floor() rounding instead of round-half-up. This systematically underpays members by small amounts on each calculation.',
        recommendation: 'Replace floor(amount, 2) with roundHalfUp(amount, 2) in compensation calculations. A roundHalfUp utility already exists at src/utils/rounding.ts.',
      },
      {
        scanId: completedScan.id,
        severity: 'medium',
        confidence: 75,
        lawSection: 'DEFGLIS s.27',
        lawExcerpt: 'Medical costs exceeding $5,000 require prior approval',
        filePath: 'src/api/handlers/summary.ts',
        lineStart: 23,
        lineEnd: 23,
        rationale: 'Summary endpoint uses hardcoded medical cap of $6,500, inconsistent with both legislation ($5,000) and main config ($6,000). This creates conflicting information across the system.',
        recommendation: 'Remove hardcoded value and reference centralized configuration. Ultimately align all cap values to the legislated $5,000.',
      },
      {
        scanId: completedScan.id,
        severity: 'low',
        confidence: 70,
        lawSection: 'DEFGLIS s.19',
        lawExcerpt: 'Minimum service period calculation',
        filePath: 'src/eligibility/service.ts',
        lineStart: 24,
        lineEnd: 26,
        rationale: 'Service hint helper returns 100 days, inconsistent with both code implementation (120) and legislation (90). This stale value may appear in documentation or UI tooltips.',
        recommendation: 'Update getMinServiceDaysHint() to return 90 to match DEFGLIS s.19, or derive value from configuration to prevent future drift.',
      },
    ],
  });
  
  console.log(`Created ${completedScan.id} with findings`);
  
  // Create running scan
  const runningScan = await prisma.scan.create({
    data: {
      repoUrl: 'https://github.com/example/pension-calculator',
      branch: 'develop',
      status: 'running',
      startedAt: new Date(Date.now() - 120000), // 2 min ago
      coveragePct: 45.0,
    },
  });
  
  console.log(`Created running scan: ${runningScan.id}`);
  
  // Create queued scan
  const queuedScan = await prisma.scan.create({
    data: {
      repoUrl: 'https://github.com/example/welfare-system',
      branch: 'main',
      status: 'queued',
    },
  });
  
  console.log(`Created queued scan: ${queuedScan.id}`);
  
  console.log('\nSeed completed successfully!');
  console.log(`- ${3} scans created`);
  console.log(`- ${7} findings created`);
  console.log(`- ${2} rulesets created`);
  console.log(`- ${1} upload created`);
}

seed()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

