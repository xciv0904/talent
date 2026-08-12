import { describe, expect, it } from 'vitest';
import { QUICK_DISCOVERY_QUESTIONS } from '../src/data/questions';

const auditedClarity = {
  clear: [
    'SJT01', 'SJT02', 'SJT03', 'SJT04',
    'BEH01', 'BEH02', 'BEH03',
    'ENG02', 'ENG03', 'ENG04', 'ENG05',
    'INT01', 'INT02', 'INT03', 'INT04',
    'ENV01', 'ENV02', 'ENV03', 'ENV05',
    'VAL01', 'VAL02', 'VAL03', 'VAL05',
  ],
  minorRewrite: ['SJT05', 'BEH05', 'EVD02', 'EVD03', 'EVD04', 'EVD05', 'ENG01', 'INT05', 'ENV04', 'VAL04'],
  majorRewrite: ['BEH04', 'EVD01'],
} as const;

const visibleText = QUICK_DISCOVERY_QUESTIONS.map(({ scenario, prompt, options }) =>
  [scenario, prompt, ...options.map(({ label }) => label)].join(' ')).join('\n');

describe('Quick Discovery plain-language clarity', () => {
  it('audits every one of the 35 questions exactly once', () => {
    const ids = Object.values(auditedClarity).flat();
    expect(ids).toHaveLength(35);
    expect(new Set(ids).size).toBe(35);
    expect(new Set(ids)).toEqual(new Set(QUICK_DISCOVERY_QUESTIONS.map(({ id }) => id)));
  });

  it('keeps the reported disagreement scenario concrete', () => {
    const question = QUICK_DISCOVERY_QUESTIONS.find(({ id }) => id === 'BEH04')!;
    expect(question.scenario).toContain('晚上幾點後不再製造噪音');
    expect(question.scenario).toContain('討論沒有進展');
    expect(question.options.every(({ label }) => label.length <= 40)).toBe(true);
  });

  it('asks evidence questions about a real memory instead of a form or interview exercise', () => {
    const questions = QUICK_DISCOVERY_QUESTIONS.filter(({ type }) => type === 'evidence');
    expect(questions).toHaveLength(5);
    expect(questions.every(({ scenario }) => scenario.startsWith('回想'))).toBe(true);
    expect(questions.every(({ scenario }) => !scenario.includes('？'))).toBe(true);
    expect(questions.every(({ options }) => options.every(({ label }) => label.startsWith('我')))).toBe(true);
    expect(visibleText).not.toMatch(/個人經驗紀錄|一頁自己的經驗|一位不熟悉你背景的人|哪一類例子/);
  });

  it('avoids wording that makes the reader infer an undefined arrangement', () => {
    expect(visibleText).not.toMatch(/安靜時段怎麼安排|四種負責方式|成長機會/);
  });

  it('keeps the visible reading units short enough to scan', () => {
    for (const question of QUICK_DISCOVERY_QUESTIONS) {
      expect(question.scenario.length, `${question.id} scenario`).toBeLessThanOrEqual(90);
      expect(question.prompt.length, `${question.id} prompt`).toBeLessThanOrEqual(30);
      for (const option of question.options) {
        expect(option.label.length, `${question.id} / ${option.id}`).toBeLessThanOrEqual(42);
      }
    }
  });
});
