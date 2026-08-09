import { describe, expect, it } from 'vitest';
import { QUICK_DISCOVERY_QUESTIONS } from '../src/data/questions';

const INITIAL_CONTEXT_AUDIT = {
  UNIVERSAL: ['BEH05', 'EVD01', 'EVD02', 'EVD03', 'EVD05', 'ENG02', 'ENG05', 'ENG07', 'INT01', 'INT02', 'INT04'],
  MINOR_REWRITE: ['SJT02', 'SJT03', 'SJT04', 'FC01', 'FC03', 'FC05', 'BEH01', 'BEH02', 'BEH03', 'EVD04', 'ENG01', 'ENG03', 'ENG04', 'ENG06', 'ENG08', 'ENG10', 'INT05', 'ENV01', 'ENV03', 'ENV04', 'ENV05', 'VAL01', 'VAL02', 'VAL03'],
  MAJOR_REWRITE: ['SJT01', 'SJT05', 'FC02', 'FC04', 'BEH04', 'ENG09', 'INT03', 'ENV02', 'VAL04', 'VAL05'],
  JOB_SPECIFIC: [],
} as const;

const questionText = QUICK_DISCOVERY_QUESTIONS.map((question) => [
  question.prompt,
  question.description ?? '',
  ...question.options.map(({ label, description }) => `${label} ${description ?? ''}`),
].join(' ')).join('\n');

const specializedWorkContext = /project|stakeholder|meeting|presentation|deadline|client|manager|coworker|team|office|report|strategy|department|proposal|workplace|專案|跨部門|主管|同事(?!件)|客戶|會議|提案|報告|交付|策略|團隊|規格|時程|關係人|升遷|部門|工作經驗/i;

const contextPersonas = [
  { id: 'student_18', description: '18 years old; no formal work, project-management, or management experience' },
  { id: 'hospitality_service_worker', description: 'service work without office, presentation, or stakeholder routines' },
  { id: 'skilled_technical_worker', description: 'hands-on technical work without project or meeting assumptions' },
  { id: 'healthcare_care_worker', description: 'care activity without client, proposal, or department assumptions' },
] as const;

function signalContractHash() {
  const payload = QUICK_DISCOVERY_QUESTIONS.map(({ id, type, options }) => ({
    id,
    type,
    options: options.map(({
      id: optionId,
      talentSignals,
      energySignals,
      interestSignals,
      talentInterestSignals,
      environmentSignals,
      workStyleSignals,
      valueSignals,
    }) => ({
      id: optionId,
      talentSignals,
      energySignals,
      interestSignals,
      talentInterestSignals,
      environmentSignals,
      workStyleSignals,
      valueSignals,
    })),
  }));
  let hash = 2166136261;
  for (const character of JSON.stringify(payload)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

describe('Quick Discovery context neutrality', () => {
  it('audits every question exactly once', () => {
    const audited = Object.values(INITIAL_CONTEXT_AUDIT).flat();
    expect(audited).toHaveLength(45);
    expect(new Set(audited).size).toBe(45);
    expect(new Set(audited)).toEqual(new Set(QUICK_DISCOVERY_QUESTIONS.map(({ id }) => id)));
    expect(INITIAL_CONTEXT_AUDIT.UNIVERSAL).toHaveLength(11);
    expect(INITIAL_CONTEXT_AUDIT.MINOR_REWRITE).toHaveLength(24);
    expect(INITIAL_CONTEXT_AUDIT.MAJOR_REWRITE).toHaveLength(10);
    expect(INITIAL_CONTEXT_AUDIT.JOB_SPECIFIC).toHaveLength(0);
  });

  it('contains no specialized workplace context in stems, helpers, or option labels', () => {
    expect(questionText).not.toMatch(specializedWorkContext);
  });

  it('avoids vague wording that asks users to translate an abstract scenario', () => {
    expect(questionText).not.toMatch(/你傾向如何|面對複雜情境|多方利害關係人|假設你是上班族/);
  });

  it.each(contextPersonas)('$id can read all 45 questions without assumed experience', ({ description }) => {
    expect(description.length).toBeGreaterThan(20);
    expect(QUICK_DISCOVERY_QUESTIONS).toHaveLength(45);
    expect(QUICK_DISCOVERY_QUESTIONS.every(({ prompt, options }) => prompt.length > 0 && options.every(({ label }) => label.length > 0))).toBe(true);
    expect(questionText).not.toMatch(specializedWorkContext);
  });

  it('preserves the complete pre-rewrite signal contract', () => {
    expect(signalContractHash()).toBe('7fb2bf31');
  });
});
