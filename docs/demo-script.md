# Demo Script

This script walks through the key features of the AU Benefits Legacy Demo system.

## Prerequisites

Ensure the system is running:

```bash
pnpm install
docker compose up -d postgres redis
pnpm prisma:generate
pnpm prisma:migrate
pnpm seed
pnpm dev
```

## Demo Flow (15-20 minutes)

### 1. Introduction (2 min)

**Context**: "This is a demo of a legacy-style Australian government benefits platform implementing a subset of the Social Security Act 1991. The system includes eligibility checking, benefit calculations, and a compliance scanner that can detect drift from legislative requirements."

**Architecture**: "It's a TypeScript monorepo with React frontend, Fastify microservices, PostgreSQL database, and Redis-backed job queue."

### 2. Login & Dashboard (2 min)

1. Navigate to http://localhost:5173/login
2. Use pre-filled credentials:
   - Email: `demo@example.com`
   - Password: `password123`
3. Click "Sign In"

**Dashboard View**:
- Show **KPIs**: Total scans, findings, completed scans
- Point out **Environment info**: "Evaluation" environment with current income cap displayed
- Show **Recent Scans** list

**Talking point**: "The dashboard shows system activity. Notice the environment label shows we're in 'Evaluation' mode and displays the current income cap configuration."

### 3. Legislation Context (2 min)

Open file explorer, show `legislation/` folder:

**Files**:
- `SSA1991_excerpt.md` - Human-readable legislation summary
- `SSA1991_rules.json` - Machine-readable ruleset (the "ground truth")
- `CHANGELOG.md` - Legislative amendments

**Key points** from rules:
```json
{
  "sections": [
    { "id": "SSA1991 s.35(2)", "when": "age >= 65", ... },
    { "id": "SSA1991 s.12(3)", "when": "residency_months >= 10", ... },
    { "id": "SSA1991 s.40", "when": "annual_income > 85000", ... }
  ],
  "rounding": "round-half-up(2)"
}
```

**Talking point**: "These are the authoritative requirements the system should implement. The scanner compares actual code against these rules."

### 4. Create a Scan (3 min)

1. Click **"Scans"** in sidebar
2. In the "Create New Scan" form:
   - Repository URL: `https://github.com/example/benefits-app`
   - Branch: `main`
3. Click **"Create Scan"**
4. Observe scan appears in list with "Queued" status
5. Watch status change to "Running" (if you refresh or wait)
6. After ~5-10 seconds, status becomes "Completed"

**Talking point**: "The scan job is processed by a background worker using BullMQ. It analyzes the codebase looking for inconsistencies with legislative requirements."

### 5. Review Scan Results (5 min)

1. Click the completed scan to open details
2. Show **Summary cards**: Status, Coverage, Findings count, Duration

**Heatmap Section**:
- Show files with finding counts and severity badges
- Point out concentration in config and eligibility files

**Findings List** - Walk through each finding:

#### Finding 1: Age Threshold (High Severity)
- **File**: `src/eligibility/age.ts`
- **Issue**: Uses age >= 70 instead of legislated 65
- **Impact**: Excludes eligible individuals aged 65-69

#### Finding 2: Residency Requirement (High Severity)
- **File**: `src/eligibility/residency.ts`
- **Issue**: Enforces 12 months instead of legislated 10 months
- **Impact**: More restrictive than law requires

#### Finding 3: Income Cap (Critical Severity)
- **File**: `src/config/thresholds.json`
- **Issue**: Set to $90,000 instead of legislated $85,000
- **Impact**: Allows overpayments for $85k-$90k income bracket

#### Finding 4: Rounding Method (Medium Severity)
- **File**: `src/benefits/formula.ts`
- **Issue**: Uses floor() instead of round-half-up
- **Impact**: Systematic underpayment

#### Finding 5: Config Inconsistency (Medium Severity)
- **File**: `src/api/handlers/summary.ts`
- **Issue**: Hardcoded cap of $92,000
- **Impact**: Multiple sources of truth causing confusion

**Talking point**: "These findings represent realistic drift that happens in legacy systems - hardcoded values, config sprawl, stale documentation, and gradual divergence from requirements over time. Notice there are NO explicit 'non-compliance' markers in the code - this is organic drift."

### 6. Finding Detail View (3 min)

1. Click on the **Age Threshold** finding
2. Show detailed view:
   - **Severity badge** with confidence score
   - **Legislative Requirement** box (excerpt from SSA1991)
   - **Code Location** (file path and line numbers)
   - **Rationale** (detailed explanation)
   - **Recommendation** (specific remediation steps)

3. Point out **action buttons**:
   - "Propose Fix (PR)" - Would generate PR with correction
   - "Mark as False Positive" - For managing results

**Talking point**: "Each finding includes the legal context, explains why it's a problem, and suggests how to fix it. This makes it actionable for developers."

### 7. Export Report (1 min)

1. Go back to scan detail
2. Click **"Export JSON"** button
3. Opens data URL with findings in JSON format
4. Show CSV export option as well

**Talking point**: "Reports can be exported for auditing, tracking, or integration with other systems."

### 8. Ruleset Management (2 min)

1. Click **"Rulesets"** in sidebar
2. Show two rulesets:
   - **SSA1991 Baseline** (Active) - Derived from legislation
   - **Extracted Policy Rules** (Draft) - From uploaded document

3. Click **SSA1991 Baseline**
4. Show:
   - Version number
   - List of rules with section references
   - Export options (JSON/YAML/Plain Text)

**Talking point**: "The system can manage multiple rulesets - from legislation, policy documents, or manual entry. This supports versioning and change tracking."

### 9. Settings & Configuration (1 min)

1. Click **"Settings"** in sidebar
2. Show environment configuration:
   - Environment: "Evaluation"
   - Region: "AU-East"
   - Income Cap: $92,000 (or whatever is shown)

**Talking point**: "The settings page shows current system configuration. Notice the income cap here might differ from what's in the scan findings - that's part of the configuration sprawl we're detecting."

### 10. Code Walkthrough (Optional, 3-5 min)

If time permits, show actual code with mismatches:

**Age Check** (`services/svc-eligibility/src/age.ts`):
```typescript
export function isSeniorAge(age: number): boolean {
  return age >= 70;  // Should be 65 per legislation
}
```

**Residency Check** (`services/svc-eligibility/src/residency.ts`):
```typescript
if (residencyMonths < 12) {  // Should be 10
  return { eligible: false, reason: 'Minimum residency requirement not met' };
}
```

**Income Cap Config** (`services/svc-benefits/src/config/thresholds.json`):
```json
{
  "incomeCap": 90000  // Should be 85000
}
```

**Gateway Summary** (`apps/gateway/config/defaults.json`):
```json
{
  "cap": 92000  // Yet another value!
}
```

**Talking point**: "See how these discrepancies are subtle and unmarked - they look like normal code. The scanner detects them by comparing against the authoritative legislation rules."

## Key Takeaways

1. **Realistic Drift**: System demonstrates how legacy codebases diverge from requirements through organic evolution
2. **Multi-source Truth**: Configuration scattered across code, JSON files, env vars, and hardcoded values
3. **Automated Detection**: Compliance scanner identifies issues without explicit markers
4. **Actionable Results**: Findings include legislative context, rationale, and remediation steps
5. **Full Stack**: Complete system from React UI to microservices to background jobs

## Questions & Discussion

**Q: How does the scanner work?**  
A: In this demo, it's simulated - findings are pre-generated based on known mismatches. A real implementation would parse code, extract constants/logic, and compare against rules using AST analysis or pattern matching.

**Q: Are the mismatches intentional?**  
A: Yes, for demo purposes. But they represent realistic scenarios: config drift, hardcoded values, calculation errors, and documentation staleness.

**Q: Can it auto-fix issues?**  
A: The "Propose Fix (PR)" button is a placeholder, but a production version could generate PRs with corrections.

**Q: What about false positives?**  
A: The confidence score (shown as %) helps prioritize findings. Manual review workflow would include false positive marking.

## Next Steps

- Run legislation tests: `pnpm test:legislation` (will show failures)
- Explore codebase structure
- Modify thresholds and re-scan
- Add new rules to legislation files
- Experiment with Docker deployment

