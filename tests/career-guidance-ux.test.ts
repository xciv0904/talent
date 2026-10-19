import { describe, expect, it } from 'vitest';
import { careerTakeaway, lifeTakeaway, missionTakeaway } from '../src/lab/guidance';
import { createLife, currentEvent, decide, evaluateMission, initialMissionInput } from '../src/lab/engine';
import { LAB_CAREERS, eventsFor } from '../src/lab/content';
import { createInitialAppState } from '../src/services/storage';
import { WORK_BENEFITS, MISSION_STARTS } from '../src/lab/plain-language';
import type { Evidence } from '../src/lab/types';
const at = '2026-10-20T00:00:00.000Z';
function evidence(score: number, interest?: number, energy = 4, willingness = 4): Evidence[] {
  const task: Evidence = { id: 'm1', kind: 'mission', careerId: 'cnc_technician', sourceId: 'task1', at, scope: '本次任務', weight: 1, summary: '', score };
  return interest === undefined ? [task] : [task, { ...task, id: 'r1', kind: 'reflection', interest, energy, willingness, score: undefined }];
}
describe('Direct, evidence-based next steps', () => {
  it('does not infer fit from a story and gives a real task action', () => {
    const g = careerTakeaway('cnc_technician', []);
    expect(g.status).toBe('task'); expect(g.next.to).toBe('/lab/mission/cnc_technician'); expect(g.evidenceIds).toEqual([]);
  });
  it('asks for the missing reflection on exactly that result', () => {
    const g = careerTakeaway('cnc_technician', evidence(100));
    expect(g.status).toBe('reflect'); expect(g.next.to).toContain('result=task1'); expect(g.next.to).toContain('#mission-reflection');
  });
  it('does not recommend pursuing work merely because the task score was high', () => {
    const g = careerTakeaway('cnc_technician', evidence(100, 1));
    expect(g.status).toBe('pause'); expect(g.headline).toContain('排到後面'); expect(g.next.to).toBe('/lab/missions');
  });
  it('separates high interest from the fatigue it produces', () => {
    const g = careerTakeaway('cnc_technician', evidence(100, 5, 1));
    expect(g.headline).toContain('有興趣'); expect(g.headline).toContain('很累'); expect(g.benefit).toContain('輪班');
  });
  it('respects explicit unwillingness to do the work long-term', () => {
    const g = careerTakeaway('cnc_technician', evidence(100, 5, 5, 1));
    expect(g.headline).toBe('先別把它當成長期工作'); expect(g.next.to).toBe('/lab/missions');
  });
  it('recommends practice for interest with missing task fundamentals', () => {
    const g = careerTakeaway('cnc_technician', evidence(40, 5));
    expect(g.status).toBe('practice'); expect(g.next.to).toBe('/lab/mission/cnc_technician');
  });
  it('recommends a small real experience, never immediate resignation or a guaranteed fit', () => {
    const g = careerTakeaway('cnc_technician', evidence(100, 5));
    expect(g.status).toBe('try'); expect(g.next.to).toBe('/experiments?career=cnc_technician');
    expect(g.headline).not.toMatch(/保證|一定|天生|成功率|錄取/);
  });
  it('uses comparison as the next action when the user feels neutral', () => {
    const g = careerTakeaway('cnc_technician', evidence(100, 3));
    expect(g.status).toBe('compare'); expect(g.next.to).toBe('/lab/missions');
  });
  it('does not pair a new task with an older task reflection', () => {
    const entries = evidence(100, 5);
    entries.push({ ...entries[0], id: 'm2', sourceId: 'task2', at: '2026-10-20T01:00:00.000Z', score: 40 });
    const g = careerTakeaway('cnc_technician', entries);
    expect(g.status).toBe('reflect'); expect(g.evidenceIds).toEqual(['m2']); expect(g.next.to).toContain('task2');
  });
  it('points practice feedback at the actual missed rule', () => {
    const career = LAB_CAREERS.find((c) => c.careerId === 'cnc_technician')!;
    const input = { ...initialMissionInput(career.careerId), decisions: career.mission.decisions.map((d) => d.options.find((v) => v !== d.correct)!), allocation: [80, 10, 10], text: '我會先查看資料，整理還沒確認的事，再把需要回報的問題交給負責人。' };
    const result = evaluateMission(career.careerId, input, 'task', at);
    result.reflection = { interest: 5, achievement: 4, energy: 5, willingness: 5, hardest: '還不懂品質分流' };
    expect(missionTakeaway(result).benefit).toContain('A 在題目範圍內');
  });
  it('explains observed story choices instead of calling the final answer a permanent personality', () => {
    let l = createLife('cnc_technician', 'balance', 'quick', createInitialAppState(), 'l', at);
    for (let i = 0; i < 6; i++) l = decide(l, currentEvent(l, [])!.id, i === 5 ? 'leader' : 'flexible', [], at);
    const g = lifeTakeaway(l, []);
    expect(g.headline).toContain('守住工作範圍'); expect(g.observed).toContain('5 次'); expect(g.benefit).toContain('班表'); expect(g.next.status).toBe('task');
  });
  it('all playable careers have a specific daily activity and short readable core choices', () => {
    expect(new Set(LAB_CAREERS.map((c) => WORK_BENEFITS[c.careerId].learn)).size).toBe(LAB_CAREERS.length);
    for (const c of LAB_CAREERS) {
      expect(MISSION_STARTS[c.careerId].prompts).toHaveLength(c.mission.decisions.length);
      expect(MISSION_STARTS[c.careerId].info).toHaveLength(3);
      expect(WORK_BENEFITS[c.careerId].work.length).toBeGreaterThan(5);
      for (const e of eventsFor(c.careerId).filter((e) => e.id.includes('-core-'))) {
        expect(e.choices.map((choice) => choice.id)).toEqual(['specialist', 'leader', 'flexible']);
        for (const choice of e.choices) { expect(choice.label.length).toBeLessThanOrEqual(25); expect(choice.label).not.toMatch(/利害關係人|資料血緣|收斂|埋點|驗收/); }
      }
    }
  });
});

describe('Existing reflection compatibility', () => {
  it('restores missing willingness evidence from its exact saved task without changing history', async () => {
    const { parseLab } = await import('../src/lab/storage');
    const { emptyLab } = await import('../src/lab/engine');
    const c = LAB_CAREERS.find((career) => career.careerId === 'cnc_technician')!;
    const input = { ...initialMissionInput(c.careerId), decisions: c.mission.decisions.map((d) => d.correct), allocation: [55, 25, 20], text: '我會先核對紀錄，把不符合或沒有資料的物品分開，回報負責人並留下交接紀錄。' };
    const result = evaluateMission(c.careerId, input, 'task1', at);
    result.reflection = { interest: 5, achievement: 4, energy: 5, willingness: 1, hardest: '不想每天都做' };
    const previous = evidence(100, 5, 5); delete previous[1].willingness;
    const snapshot = { id: 'old', at, reason: 'previous', evidenceIds: ['m1', 'r1'], findings: ['原本的觀察'] };
    const parsed = parseLab(JSON.stringify({ ...emptyLab(), missions: [result], evidence: previous, snapshots: [snapshot] }));
    expect(parsed.evidence[1].willingness).toBe(1);
    expect(careerTakeaway(c.careerId, parsed.evidence).headline).toBe('先別把它當成長期工作');
    expect(parsed.snapshots).toEqual([snapshot]);
  });
});
