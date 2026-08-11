import { describe, expect, it } from 'vitest';
import { QUICK_DISCOVERY_QUESTIONS } from '../src/data/questions';
import { BASE_TALENTS } from '../src/data/talents';
import { SCENARIO_DOMAINS } from '../src/types';

const allVisibleText = QUICK_DISCOVERY_QUESTIONS.map((question) => [
  question.scenario,
  question.prompt,
  question.description ?? '',
  ...question.options.map((option) => `${option.label} ${option.description ?? ''}`),
].join(' ')).join('\n');

const occupationalTerms = /project|stakeholder|meeting|presentation|deadline|client|manager|coworker|team|office|report|strategy|department|proposal|workplace|專案|跨部門|主管|同事(?!件|情)|客戶|會議|提案|報告|交付|策略|團隊|職場|上班|工作經驗/i;
const continuationTerms = /延續剛才|承接上一題|前面提到|如前所述|根據剛剛|上一個情境/;
const vagueSelfReportTerms = /你通常|你傾向如何|你擅長|你是不是|面對複雜情境|保持冷靜|相信直覺/;

function bigrams(text: string): Set<string> {
  const normalized = text.replace(/[\s，。！？、；：「」『』（）0-9]/g, '');
  return new Set([...normalized].slice(0, -1).map((character, index) => character + normalized[index + 1]));
}

function jaccard(left: Set<string>, right: Set<string>): number {
  const intersection = [...left].filter((value) => right.has(value)).length;
  const union = new Set([...left, ...right]).size;
  return union === 0 ? 0 : intersection / union;
}

describe('Quick Discovery self-contained scenario quality', () => {
  it('gives every question a complete independent mini-scenario', () => {
    expect(QUICK_DISCOVERY_QUESTIONS).toHaveLength(35);
    for (const question of QUICK_DISCOVERY_QUESTIONS) {
      const sentenceCount = question.scenario.split(/[。！？]/).filter(Boolean).length;
      expect(question.scenario.length, question.id).toBeGreaterThanOrEqual(35);
      expect(sentenceCount, question.id).toBeGreaterThanOrEqual(1);
      expect(sentenceCount, question.id).toBeLessThanOrEqual(3);
      expect(question.decisionPoint.length, question.id).toBeGreaterThanOrEqual(10);
      expect(question.prompt.length, question.id).toBeGreaterThanOrEqual(7);
      expect(question.options.length, question.id).toBeGreaterThanOrEqual(4);
      expect(question.contextRequirements, question.id).toBe('universal');
    }
  });

  it('does not rely on prior questions, professional experience, or trait labels', () => {
    expect(allVisibleText).not.toMatch(continuationTerms);
    expect(allVisibleText.match(occupationalTerms)?.[0]).toBeUndefined();
    expect(allVisibleText).not.toMatch(vagueSelfReportTerms);
  });

  it('keeps every scenario domain represented without letting one context dominate', () => {
    const counts = Object.fromEntries(SCENARIO_DOMAINS.map((domain) => [
      domain,
      QUICK_DISCOVERY_QUESTIONS.filter((question) => question.scenarioDomain === domain).length,
    ]));
    expect(Object.keys(counts)).toHaveLength(14);
    for (const domain of SCENARIO_DOMAINS) {
      expect(counts[domain], domain).toBeGreaterThanOrEqual(1);
      expect(counts[domain], domain).toBeLessThanOrEqual(4);
    }
  });

  it('keeps each Base Talent signal independent across at least three scenario domains', () => {
    for (const { id: talentId } of BASE_TALENTS) {
      const signalQuestions = QUICK_DISCOVERY_QUESTIONS.filter((question) =>
        question.options.some((option) => option.talentSignals?.[talentId] !== undefined));
      const domains = new Set(signalQuestions.map((question) => question.scenarioDomain));
      expect(signalQuestions, talentId).toHaveLength(3);
      expect(domains.size, talentId).toBeGreaterThanOrEqual(3);
    }
  });

  it('avoids near-duplicate scenario wording', () => {
    const pairs: Array<{ left: string; right: string; similarity: number }> = [];
    for (let leftIndex = 0; leftIndex < QUICK_DISCOVERY_QUESTIONS.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < QUICK_DISCOVERY_QUESTIONS.length; rightIndex += 1) {
        pairs.push({
          left: QUICK_DISCOVERY_QUESTIONS[leftIndex].id,
          right: QUICK_DISCOVERY_QUESTIONS[rightIndex].id,
          similarity: jaccard(
            bigrams(QUICK_DISCOVERY_QUESTIONS[leftIndex].scenario),
            bigrams(QUICK_DISCOVERY_QUESTIONS[rightIndex].scenario),
          ),
        });
      }
    }
    const closest = pairs.sort((left, right) => right.similarity - left.similarity)[0];
    expect(closest.similarity, `${closest.left} / ${closest.right}`).toBeLessThan(0.35);
  });
});
