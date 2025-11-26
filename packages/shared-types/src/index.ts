import { z } from 'zod';

// Auth
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const LoginResponseSchema = z.object({
  token: z.string(),
  displayName: z.string(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// Scan
export const ScanStatusSchema = z.enum(['queued', 'running', 'completed', 'failed']);

export const ScanSchema = z.object({
  id: z.string(),
  repoUrl: z.string(),
  branch: z.string(),
  status: ScanStatusSchema,
  startedAt: z.string().datetime().nullable(),
  finishedAt: z.string().datetime().nullable(),
  coveragePct: z.number().nullable(),
  createdAt: z.string().datetime(),
});

export const CreateScanSchema = z.object({
  repoUrl: z.string().url(),
  branch: z.string().default('main'),
});

export type Scan = z.infer<typeof ScanSchema>;
export type ScanStatus = z.infer<typeof ScanStatusSchema>;
export type CreateScanInput = z.infer<typeof CreateScanSchema>;

// Finding
export const SeveritySchema = z.enum(['critical', 'high', 'medium', 'low', 'info']);

export const FindingSchema = z.object({
  id: z.string(),
  scanId: z.string(),
  severity: SeveritySchema,
  confidence: z.number().min(0).max(100),
  lawSection: z.string(),
  lawExcerpt: z.string(),
  filePath: z.string(),
  lineStart: z.number(),
  lineEnd: z.number(),
  rationale: z.string(),
  recommendation: z.string(),
  createdAt: z.string().datetime(),
});

export type Finding = z.infer<typeof FindingSchema>;
export type Severity = z.infer<typeof SeveritySchema>;

// Heatmap
export const HeatBinSchema = z.object({
  file: z.string(),
  findingCount: z.number(),
  severity: SeveritySchema,
});

export type HeatBin = z.infer<typeof HeatBinSchema>;

// Upload
export const UploadStatusSchema = z.enum(['pending', 'processing', 'completed', 'failed']);

export const UploadSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  mimeType: z.string(),
  size: z.number(),
  status: UploadStatusSchema,
  createdAt: z.string().datetime(),
});

export type Upload = z.infer<typeof UploadSchema>;
export type UploadStatus = z.infer<typeof UploadStatusSchema>;

// Ruleset
export const RulesetStatusSchema = z.enum(['draft', 'active', 'archived']);

export const RuleSchema = z.object({
  id: z.string(),
  rulesetId: z.string(),
  sectionRef: z.string(),
  title: z.string(),
  whenText: z.string(),
  thenText: z.string(),
  citations: z.array(z.string()),
});

export const RulesetSchema = z.object({
  id: z.string(),
  name: z.string(),
  source: z.string(),
  version: z.number(),
  status: RulesetStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  rules: z.array(RuleSchema).optional(),
});

export const CreateRulesetFromUploadSchema = z.object({
  uploadId: z.string(),
  name: z.string(),
});

export type Rule = z.infer<typeof RuleSchema>;
export type Ruleset = z.infer<typeof RulesetSchema>;
export type RulesetStatus = z.infer<typeof RulesetStatusSchema>;
export type CreateRulesetFromUploadInput = z.infer<typeof CreateRulesetFromUploadSchema>;

// Report
export const ReportTypeSchema = z.enum(['pdf', 'csv', 'json']);

export const ReportSchema = z.object({
  id: z.string(),
  scanId: z.string(),
  type: ReportTypeSchema,
  url: z.string(),
});

export const ExportReportSchema = z.object({
  format: ReportTypeSchema,
});

export type Report = z.infer<typeof ReportSchema>;
export type ReportType = z.infer<typeof ReportTypeSchema>;
export type ExportReportInput = z.infer<typeof ExportReportSchema>;

// Internal service DTOs
export const EligibilityCheckSchema = z.object({
  age: z.number(),
  residencyMonths: z.number(),
});

export const EligibilityResultSchema = z.object({
  eligible: z.boolean(),
  isSenior: z.boolean(),
  residencyOk: z.boolean(),
  reasons: z.array(z.string()),
});

export type EligibilityCheckInput = z.infer<typeof EligibilityCheckSchema>;
export type EligibilityResult = z.infer<typeof EligibilityResultSchema>;

export const BenefitCalcSchema = z.object({
  annualIncome: z.number(),
  base: z.number(),
});

export const BenefitResultSchema = z.object({
  amount: z.number(),
  reduction: z.number(),
  capped: z.boolean(),
});

export type BenefitCalcInput = z.infer<typeof BenefitCalcSchema>;
export type BenefitResult = z.infer<typeof BenefitResultSchema>;

