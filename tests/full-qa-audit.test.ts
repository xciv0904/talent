import { describe, expect, it } from 'vitest';
import { CAREER_PROFILES } from '../src/data/careers';
import { QUICK_DISCOVERY_QUESTIONS } from '../src/data/questions';
import { BASE_TALENTS, COMPOSITE_TALENTS } from '../src/data/talents';
import { CAREER_MATCH_WEIGHTS, categorizeCareerResults, matchCareer, matchCareers, runCareerDiscoveryPipeline } from '../src/engine';
import {
  CAREER_MATCH_VALUE_DIMENSIONS,
  ENVIRONMENT_DIMENSIONS,
  INTEREST_DIMENSIONS,
  VALUE_DIMENSIONS,
  WORK_STYLE_DIMENSIONS,
  type CareerMatchInput,
} from '../src/types';
import { auditCareerVectors, getQuestionCoverage } from '../src/utils';
import { GOLDEN_PERSONAS } from './fixtures/golden-personas';
import { SYNTHETIC_PROFILES } from './fixtures/synthetic-profiles';

const normalize = (value: string) => value.toLocaleLowerCase().replace(/[\s、，。；：:,.!?！？／/()（）「」『』_-]/g, '');
const expectUnique = (values: string[]) => expect(new Set(values.map(normalize)).size).toBe(values.length);
const expectUnit = (value: number, label: string) => {
  expect(Number.isFinite(value), `${label} must be finite`).toBe(true);
  expect(value, `${label} must be >= 0`).toBeGreaterThanOrEqual(0);
  expect(value, `${label} must be <= 1`).toBeLessThanOrEqual(1);
};

describe('complete data QA', () => {
  it('has no duplicate questions, options, careers, aliases, talents, or composites', () => {
    expectUnique(QUICK_DISCOVERY_QUESTIONS.map(({ id }) => id));
    expectUnique(QUICK_DISCOVERY_QUESTIONS.map(({ scenario, prompt }) => `${scenario} ${prompt}`));
    for (const question of QUICK_DISCOVERY_QUESTIONS) {
      expectUnique(question.options.map(({ id }) => id));
      expectUnique(question.options.map(({ label }) => label));
    }
    expectUnique(CAREER_PROFILES.map(({ id }) => id));
    expectUnique(CAREER_PROFILES.map(({ titleZh }) => titleZh));
    expectUnique(CAREER_PROFILES.map(({ titleEn }) => titleEn));
    expectUnique(BASE_TALENTS.map(({ id }) => id));
    expectUnique(COMPOSITE_TALENTS.map(({ id }) => id));
  });

  it('contains only defined signal keys and finite signal values', () => {
    const talentIds = new Set(BASE_TALENTS.map(({ id }) => id));
    const contractedSignals = {
      talentSignals: talentIds,
      energySignals: talentIds,
      talentInterestSignals: talentIds,
      interestSignals: new Set(INTEREST_DIMENSIONS),
      workStyleSignals: new Set(WORK_STYLE_DIMENSIONS),
      environmentSignals: new Set(ENVIRONMENT_DIMENSIONS),
      valueSignals: new Set(VALUE_DIMENSIONS),
    } as const;
    for (const question of QUICK_DISCOVERY_QUESTIONS) {
      for (const option of question.options) {
        for (const [field, validKeys] of Object.entries(contractedSignals)) {
          const signals = option[field as keyof typeof option] as Record<string, number> | undefined;
          for (const [key, value] of Object.entries(signals ?? {})) {
            expect(validKeys.has(key as never), `${question.id}/${option.id}/${field}/${key}`).toBe(true);
            expect(Number.isFinite(value), `${question.id}/${option.id}/${field}/${key}`).toBe(true);
            expect(value).not.toBeUndefined();
          }
        }
      }
    }
  });

  it('keeps exact balanced talent coverage across three independent methods', () => {
    const coverage = getQuestionCoverage(QUICK_DISCOVERY_QUESTIONS);
    expect(coverage).toHaveLength(20);
    for (const item of coverage) {
      expect(item.signalCount).toBe(3);
      expect(new Set(item.questionIds).size).toBe(3);
      expect(new Set(item.questionTypes).size).toBe(3);
    }
  });

  it('has complete, finite 0..1 career vectors and no overly similar pair', () => {
    const dimensionGroups = [
      ['interestProfile', INTEREST_DIMENSIONS],
      ['workStyle', WORK_STYLE_DIMENSIONS],
      ['environmentProfile', ENVIRONMENT_DIMENSIONS],
      ['valuesProfile', CAREER_MATCH_VALUE_DIMENSIONS],
    ] as const;
    const talentIds = new Set(BASE_TALENTS.map(({ id }) => id));
    for (const career of CAREER_PROFILES) {
      for (const [group, dimensions] of dimensionGroups) {
        const vector = career[group] as Record<string, number>;
        expect(Object.keys(vector).sort()).toEqual([...dimensions].sort());
        for (const dimension of dimensions) expectUnit(vector[dimension], `${career.id}/${group}/${dimension}`);
      }
      for (const [talentId, value] of Object.entries(career.talentRequirements)) {
        expect(talentIds.has(talentId as never)).toBe(true);
        expectUnit(value, `${career.id}/talent/${talentId}`);
      }
      for (const skill of career.skills) expectUnit(skill.importance, `${career.id}/skill/${skill.id}`);
      expect(career.entryRequirements.yearsExperience).toBeGreaterThanOrEqual(0);
    }
    expect(auditCareerVectors(CAREER_PROFILES, 0.96).similarPairs).toEqual([]);
  });
});

describe('complete logic and result QA', () => {
  it('keeps all component and final scores finite and inside 0..1', () => {
    for (const persona of GOLDEN_PERSONAS) {
      const results = matchCareers(CAREER_PROFILES, persona.input);
      expect(results).toHaveLength(60);
      for (const result of results) {
        for (const [key, value] of Object.entries(result)) {
          if (key === 'matchScore' || key.endsWith('Match')) expectUnit(value as number, `${persona.id}/${result.careerId}/${key}`);
        }
      }
    }
  });

  it('keeps Interest, Talent, Energy, Entry Distance, Confidence, and market opportunity distinct', () => {
    expect(Object.keys(CAREER_MATCH_WEIGHTS).sort()).toEqual(['environment', 'interest', 'talent', 'transferableSkills', 'values', 'workStyle'].sort());
    const persona = GOLDEN_PERSONAS[1];
    const career = CAREER_PROFILES.find(({ id }) => id === 'data_analyst')!;
    const changedInterest: CareerMatchInput = { ...persona.input, interestProfile: { ...persona.input.interestProfile, investigative: 0 } };
    const original = matchCareer(career, persona.input);
    const interestChanged = matchCareer(career, changedInterest);
    expect(interestChanged.talentMatch).toBe(original.talentMatch);
    expect(interestChanged.interestMatch).not.toBe(original.interestMatch);

    const changedEnergy: CareerMatchInput = { ...persona.input, talentScores: persona.input.talentScores.map((talent) => ({ ...talent, energyScore: talent.energyScore === null ? null : -talent.energyScore })) };
    expect(changedEnergy.talentScores.map(({ score }) => score)).toEqual(persona.input.talentScores.map(({ score }) => score));
    expect(changedEnergy.talentScores.map(({ energyScore }) => energyScore)).not.toEqual(persona.input.talentScores.map(({ energyScore }) => energyScore));

    const farEntry = matchCareer(career, { ...persona.input, education: 'none', hasPortfolio: false });
    const nearEntry = matchCareer(career, { ...persona.input, education: 'bachelor', hasPortfolio: true });
    expect(farEntry.matchScore).toBe(nearEntry.matchScore);
    expect(farEntry.entryDistance.educationGap + farEntry.entryDistance.portfolioGap).toBeGreaterThan(
      nearEntry.entryDistance.educationGap + nearEntry.entryDistance.portfolioGap,
    );
    expect(typeof original.confidence).toBe('string');
    expect(typeof original.matchScore).toBe('number');
  });

  it('keeps result categories disjoint and always returns a non-empty ranked result set', () => {
    for (const persona of GOLDEN_PERSONAS) {
      const matches = matchCareers(CAREER_PROFILES, persona.input);
      expect(matches.length).toBeGreaterThan(0);
      const categories = categorizeCareerResults(matches, persona.input);
      const categorizedIds = Object.values(categories).flat().map(({ careerId }) => careerId);
      expect(new Set(categorizedIds).size).toBe(categorizedIds.length);
      expect(categories.surprise_me.every((surprise) => !categories.best_fit.some((best) => best.careerId === surprise.careerId))).toBe(true);
    }
  });
});

describe('explainability and content QA', () => {
  const pipelines = SYNTHETIC_PROFILES.slice(0, 5).map((profile) => runCareerDiscoveryPipeline(profile.responses));
  const samples = pipelines.flatMap((pipeline) => pipeline.matches.slice(0, 4).map((match) => ({ pipeline, match })));

  it('traces 20 top career matches from answer to signal to talent to career task', () => {
    expect(samples).toHaveLength(20);
    for (const { pipeline, match } of samples) {
      expect(match.talentReasonDetails.length, match.careerId).toBeGreaterThan(0);
      for (const detail of match.talentReasonDetails) {
        expect(detail.reason).toContain('這些回答形成「');
        expect(detail.reason).toContain('這份工作會在「');
        expect(detail.evidenceIds.length).toBeGreaterThan(0);
        const talent = pipeline.talentProfile.baseTalents.find(({ talentId }) => talentId === detail.talentId)!;
        for (const evidenceId of detail.evidenceIds) {
          const evidence = talent.evidence.find(({ id }) => id === evidenceId)!;
          const answer = pipeline.rawAnswers.find(({ questionId }) => questionId === evidence.questionId)!;
          const career = CAREER_PROFILES.find(({ id }) => id === match.careerId)!;
          expect(answer.selectedOptionIds).toContain(evidence.optionId);
          expect(career.talentRequirements[detail.talentId]).toBeDefined();
          expect(match.supportingEvidenceIds).toContain(evidenceId);
          expect(evidence.description).toContain('回答「');
          if (detail.reason.includes(evidence.description)) {
            const question = QUICK_DISCOVERY_QUESTIONS.find(({ id }) => id === evidence.questionId)!;
            const option = question.options.find(({ id }) => id === evidence.optionId)!;
            expect(detail.reason).toContain(option.label);
          }
        }
        const career = CAREER_PROFILES.find(({ id }) => id === match.careerId)!;
        expect(career.coreTasks.some((task) => detail.reason.includes(task))).toBe(true);
      }
    }
  });

  it('does not ship banned vague recommendation language', () => {
    const corpus = [
      ...BASE_TALENTS.flatMap(({ nameZh, description }) => [nameZh, description]),
      ...COMPOSITE_TALENTS.flatMap(({ nameZh, shortDescription }) => [nameZh, shortDescription]),
      ...CAREER_PROFILES.flatMap(({ titleZh, description, coreTasks }) => [titleZh, description, ...coreTasks]),
      ...QUICK_DISCOVERY_QUESTIONS.flatMap(({ prompt, options }) => [prompt, ...options.map(({ label }) => label)]),
    ].join('\n');
    for (const phrase of ['你擁有多元整合的潛在能力', '相信自己', '無限可能', '勇敢追夢', '綻放天賦']) {
      expect(corpus).not.toContain(phrase);
    }
  });
});
