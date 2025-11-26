import * as fs from 'fs';
import * as path from 'path';

interface LegislationRule {
  id: string;
  title: string;
  when: string;
  then: string;
  description?: string;
}

interface LegislationRules {
  name: string;
  version: number;
  lastUpdated: string;
  jurisdiction: string;
  sections: LegislationRule[];
  rounding: string;
  currency: string;
}

export function loadLegislationRules(): LegislationRules {
  // Load from legislation directory
  const rulesPath = path.resolve(process.cwd(), '../../legislation/SSA1991_rules.json');
  
  if (!fs.existsSync(rulesPath)) {
    throw new Error(`Legislation rules not found at ${rulesPath}`);
  }
  
  const content = fs.readFileSync(rulesPath, 'utf-8');
  return JSON.parse(content);
}

export function parseRulesToRuleset(legislation: LegislationRules) {
  return {
    name: legislation.name,
    source: 'legislation',
    version: legislation.version,
    rules: legislation.sections.map((section) => ({
      sectionRef: section.id,
      title: section.title,
      whenText: section.when,
      thenText: section.then,
      citations: [section.id],
    })),
    metadata: {
      rounding: legislation.rounding,
      currency: legislation.currency,
      jurisdiction: legislation.jurisdiction,
      lastUpdated: legislation.lastUpdated,
    },
  };
}

export function generateDiffText(fromVersion: number, toVersion: number): string {
  // Simplified diff generation
  return `
Ruleset Diff: v${fromVersion} -> v${toVersion}

Changes:
- Section SSA1991 s.40: Income cap updated
- Rounding convention clarified to round-half-up(2)

See legislation/CHANGELOG.md for full details.
  `.trim();
}

