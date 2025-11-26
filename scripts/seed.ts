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
  const legislationPath = path.resolve(process.cwd(), '../legislation/SSA1991_rules.json');
  const legislationRules = JSON.parse(fs.readFileSync(legislationPath, 'utf-8'));
  
  // Create baseline ruleset from legislation
  const baselineRuleset = await prisma.ruleset.create({
    data: {
      name: 'SSA1991 Baseline',
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
        confidence: 85,
        lawSection: 'SSA1991 s.35(2)',
        lawExcerpt: 'Individuals aged 65 years or older qualify for the senior benefit rate',
        filePath: 'src/eligibility/age.ts',
        lineStart: 5,
        lineEnd: 7,
        rationale: 'Age threshold check uses 70 instead of the prescribed 65 years. This excludes individuals aged 65-69 who should be eligible for senior rates according to SSA1991 s.35(2).',
        recommendation: 'Update isSeniorAge() function to check age >= 65 to align with SSA1991 s.35(2). This change will extend senior rate eligibility to the correct age group.',
      },
      {
        scanId: completedScan.id,
        severity: 'high',
        confidence: 90,
        lawSection: 'SSA1991 s.12(3)',
        lawExcerpt: 'Minimum 10 months Australian residency required for eligibility',
        filePath: 'src/eligibility/residency.ts',
        lineStart: 12,
        lineEnd: 17,
        rationale: 'Residency requirement enforces 12 months minimum instead of the legislated 10 months. This creates a more restrictive barrier than intended by SSA1991 s.12(3), potentially excluding eligible applicants.',
        recommendation: 'Change minimum residency check from 12 to 10 months per SSA1991 s.12(3). Update the validation logic to accept residencyMonths >= 10.',
      },
      {
        scanId: completedScan.id,
        severity: 'critical',
        confidence: 95,
        lawSection: 'SSA1991 s.40',
        lawExcerpt: 'Income exceeding $85,000 triggers benefit reduction',
        filePath: 'src/config/thresholds.json',
        lineStart: 2,
        lineEnd: 2,
        rationale: 'Income cap configured at $90,000 but legislation prescribes $85,000 as per SSA1991 s.40. This allows overpayments for individuals with income between $85,000-$90,000, creating potential compliance and financial risk.',
        recommendation: 'Update incomeCap value in thresholds.json from 90000 to 85000 to match SSA1991 s.40 prescribed amount.',
      },
      {
        scanId: completedScan.id,
        severity: 'medium',
        confidence: 80,
        lawSection: 'SSA1991 s.40',
        lawExcerpt: 'All monetary calculations shall use round-half-up methodology to 2 decimal places',
        filePath: 'src/benefits/formula.ts',
        lineStart: 45,
        lineEnd: 46,
        rationale: 'Benefit calculations use floor() rounding instead of the legislated round-half-up method. This systematically underpays beneficiaries by small amounts, violating the rounding convention specified in the legislation.',
        recommendation: 'Replace floor(amount, 2) with roundHalfUp(amount, 2) in benefit calculations. A roundHalfUp utility already exists in the codebase at src/utils/rounding.ts.',
      },
      {
        scanId: completedScan.id,
        severity: 'medium',
        confidence: 75,
        lawSection: 'SSA1991 s.40',
        lawExcerpt: 'Income exceeding $85,000 triggers benefit reduction',
        filePath: 'src/api/handlers/summary.ts',
        lineStart: 23,
        lineEnd: 23,
        rationale: 'Summary endpoint uses hardcoded cap of $92,000, inconsistent with both legislation ($85,000) and main application config ($90,000). This creates conflicting information across the system.',
        recommendation: 'Remove hardcoded value and reference centralized configuration. Ultimately align all cap values to the legislated $85,000.',
      },
      {
        scanId: completedScan.id,
        severity: 'low',
        confidence: 70,
        lawSection: 'SSA1991 s.12(3)',
        lawExcerpt: 'Minimum 10 months Australian residency required',
        filePath: 'src/utils/date.ts',
        lineStart: 8,
        lineEnd: 12,
        rationale: 'Month calculation uses simplified 30 days/month instead of actual calendar month calculations. This approximation may incorrectly calculate residency periods in edge cases, potentially affecting eligibility determinations.',
        recommendation: 'Use a proper date library (e.g., date-fns) for accurate month calculations, or document the approximation and its acceptable margin of error.',
      },
      {
        scanId: completedScan.id,
        severity: 'info',
        confidence: 60,
        lawSection: 'SSA1991 s.35(2)',
        lawExcerpt: 'Senior rate threshold age 65',
        filePath: 'src/ui/components/EligibilityTooltip.tsx',
        lineStart: 34,
        lineEnd: 34,
        rationale: 'UI tooltip displays age 68 as senior threshold hint. This appears to be stale content that does not match either the current code implementation (70) or legislation (65).',
        recommendation: 'Update UI copy to reflect the legislated threshold of 65 years. Consider deriving UI text from configuration to prevent future drift.',
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

