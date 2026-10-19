import { describe, expect, it, vi } from 'vitest';
import { CAREER_PROFILES } from '../src/data/careers';
import { LAB_CAREERS, eventsFor } from '../src/lab/content';
import { addLife, analyzeEvidence, createLife, currentEvent, decide, emptyLab, evaluateMission, forkLab, forkLife, initialMissionInput, meets, recordEvidence, syncBaseline, validateReflection } from '../src/lab/engine';
import { deleteLife, LAB_STORAGE_KEY, parseLab, replaceLab, updateLab } from '../src/lab/storage';
import { createInitialAppState, parseStoredState, STORAGE_KEY } from '../src/services/storage';
import { runCareerDiscoveryPipeline } from '../src/engine';
import { CURRENT_RESULT_VERSIONS } from '../src/config/versions';
import { SYNTHETIC_PROFILES } from './fixtures/synthetic-profiles';
import type { Direction, Life, MissionInput } from '../src/lab/types';
const at = '2026-10-19T10:00:00.000Z';
const app = createInitialAppState();
const life = (id = 'a', careerId = LAB_CAREERS[0].careerId) => createLife(careerId, 'achievement', 'full', app, id, at, 123);
function progress(l: Life, direction: Direction, steps = 6) {
  let result = l;
  for (let i = 0; i < steps; i++) { const e = currentEvent(result, [])!; result = decide(result, e.id, direction, [], at); }
  return result;
}
function validInput(id: string): MissionInput {
  const m = LAB_CAREERS.find((c) => c.careerId === id)!.mission;
  const allocation = [...m.allocation.minimum]; allocation[0] += 100 - allocation.reduce((a, b) => a + b, 0);
  return { ...initialMissionInput(id), order: m.priorities.map((p) => p.id), decisions: m.decisions.map((d) => d.correct), allocation, text: '我會先核對限制與資料，提出可驗證的假設，記錄停止條件並請相關人員確認。', checks: [] };
}

describe('Career Lab content and deterministic state transitions', () => {
  it('maps 32 distinct roles to real existing IDs, with three professional situations each', () => {
    expect(LAB_CAREERS).toHaveLength(32);
    expect(new Set(LAB_CAREERS.map((c) => c.careerId)).size).toBe(32);
    for (const c of LAB_CAREERS) { expect(CAREER_PROFILES.some((p) => p.id === c.careerId)).toBe(true); expect(c.scenarios).toHaveLength(3); expect(eventsFor(c.careerId).every((e) => e.choices.length >= 2 && e.choices.length <= 4)).toBe(true); }
  });
  it.each(LAB_CAREERS.map((c) => [c.careerId]))('%s supports all six years, three distinct directions and reproducible seed', (id) => {
    const start = life('a', id);
    const ends = (['specialist', 'leader', 'flexible'] as const).map((d) => progress(start, d));
    expect(ends.map((e) => e.ending)).toEqual(['specialist', 'leader', 'flexible']);
    expect(ends.every((e) => e.status === 'completed')).toBe(true);
    expect(ends[0].history.map((h) => h.year)).toEqual([0, 1, 3, 5, 7, 10]);
    expect(ends[0].stats).not.toEqual(ends[1].stats); expect(ends[1].stats).not.toEqual(ends[2].stats);
    expect(progress(start, 'specialist')).toEqual(ends[0]); expect(start.history).toHaveLength(0);
  });
  it('changes future events and opportunities based on decisions, tasks, goals and pressure', () => {
    const start = life(); const lead = progress(start, 'leader', 3); const flex = progress(start, 'flexible', 4);
    expect(['lead-invite', 'burnout']).toContain(currentEvent(lead, [])!.id); expect(currentEvent(flex, [])!.id).toBe('autonomy');
    const specialist = progress(start, 'specialist', 3);
    const mission = evaluateMission(start.careerId, validInput(start.careerId), 'm', at, start.id);
    expect(currentEvent(specialist, [mission])!.id).toBe('mission-opportunity');
    const stressed = { ...specialist, stats: { ...specialist.stats, stress: 90 } }; expect(meets({ stat: 'stress', min: 65 }, stressed, [])).toBe(true);
    expect(meets({ goal: 'stability' }, specialist, [])).toBe(false);
    expect(meets({ flag: 'leader' }, specialist, [])).toBe(false);
    expect(meets({ priorEngagement: true }, specialist, [])).toBe(false);
  });
  it('prevents duplicate event effects, invalid choice, finished decisions and paused decisions', () => {
    const start = life(); const e = currentEvent(start, [])!; const next = decide(start, e.id, 'specialist', [], at);
    expect(() => decide(next, e.id, 'specialist', [], at)).toThrow(); expect(() => decide(start, e.id, 'fake', [], at)).toThrow(); expect(() => decide({ ...start, status: 'paused' }, e.id, 'leader', [], at)).toThrow();
    expect(currentEvent(progress(start, 'leader'), [])).toBeUndefined();
  });
  it('restores the exact pre-decision state when forking; original is untouched', () => {
    const original = progress(life(), 'leader'); const before = JSON.stringify(original);
    const branch = forkLife(original, 2, 'b', at);
    expect(branch.history).toHaveLength(2); expect(branch.stats).toEqual(original.history[2].before); expect(branch.status).toBe('active'); expect(branch.ending).toBeUndefined();
    expect(JSON.stringify(original)).toBe(before); expect(() => forkLife(original, -1, 'b', at)).toThrow();
  });
  it('fork inherits eligible task output without duplicating evidence or counting a new practice', () => {
    const l = progress(life(), 'specialist', 4); const m = evaluateMission(l.careerId, validInput(l.careerId), 'm', at, l.id);
    const s = { ...emptyLab(), lives: [l], missions: [m] }; const branch = forkLab(s, l, 3, 'b', at);
    expect(branch.missions).toHaveLength(2); expect(branch.missions[1].inheritedFrom).toBe('m'); expect(currentEvent(branch.lives[1], branch.missions)!.id).toBe('mission-opportunity'); expect(branch.evidence).toHaveLength(0);
  });
});

describe('Work mission rules and trustworthy evidence', () => {
  it.each(LAB_CAREERS.map((c) => [c.careerId]))('%s evaluates task constraints, not text quality or subjective ratings', (id) => {
    const input = validInput(id); const result = evaluateMission(id, input, 'm', at);
    expect(result.score).toBe(100); expect(result.reflection).toBeUndefined(); expect(result.input.checks).toEqual([]);
    expect(evaluateMission(id, { ...input, text: '另一份二十字以上的產出，系統不會理解品質，這裡只是確認文字不進入評分。' }, 'm', at).score).toBe(100);
    const wrong = { ...input, decisions: input.decisions.map((_, i) => LAB_CAREERS.find((c) => c.careerId === id)!.mission.decisions[i].options.find((o) => o !== input.decisions[i])!) };
    expect(evaluateMission(id, wrong, 'm', at).score).toBeLessThan(100);
    expect(() => evaluateMission(id, { ...input, allocation: [20, 20, 20] }, 'm', at)).toThrow(); expect(() => evaluateMission(id, { ...input, allocation: [NaN, 0, 100] }, 'm', at)).toThrow(); expect(() => evaluateMission(id, { ...input, text: '短' }, 'm', at)).toThrow(); expect(() => evaluateMission(id, { ...input, order: ['x', 'x', 'x'] }, 'm', at)).toThrow();
  });
  it('keeps original assessment byte-for-byte stable and reads it without asking again', () => {
    const p = runCareerDiscoveryPipeline(SYNTHETIC_PROFILES[0].responses);
    const personalized = { ...app, talentProfile: p.talentProfile, careerResults: { matches: p.matches, categories: p.categories, profiles: p.profiles, versions: CURRENT_RESULT_VERSIONS } };
    const before = JSON.stringify(personalized); const l = createLife('data_analyst', 'income', 'full', personalized, 'x', at);
    expect(l.personal.talent).toEqual(p.talentProfile); expect(l.personal.match).toEqual(p.matches.find((m) => m.careerId === 'data_analyst'));
    progress(l, 'leader'); expect(JSON.stringify(personalized)).toBe(before);
    expect(life().personal.talent).toBeNull();
    const synced = addLife(emptyLab(), l); expect(synced.evidence[0].kind).toBe('assessment'); expect(syncBaseline(synced, l.personal, at)).toEqual(synced);
  });
  it('keeps objective performance and subjective contradictions traceable in immutable versions', () => {
    const e = { id: 'm', kind: 'mission' as const, at, careerId: 'data_analyst', sourceId: 'm', scope: 'structured', weight: 1, score: 100, summary: 'task' };
    const s = recordEvidence(emptyLab(), e, '任務'); const before = JSON.stringify(s.snapshots[0]);
    const n = recordEvidence(s, { ...e, id: 'r', kind: 'reflection', weight: .5, interest: 1, energy: 1 }, '反思');
    expect(analyzeEvidence(n.evidence)[0]).toContain('落差'); expect(JSON.stringify(n.snapshots[0])).toBe(before); expect(n.snapshots[1].evidenceIds).toEqual(['m', 'r']); expect(recordEvidence(n, e, 'again')).toEqual(n);
    expect(() => validateReflection({ interest: 0, achievement: 3, energy: 4, willingness: 5, hardest: '' })).toThrow();
  });
});

describe('Storage boundaries, compatibility and recovery', () => {
  it('round-trips in-progress state and does not repeat event effects after refresh', () => {
    const l = progress(life(), 'leader', 3); const s = { ...emptyLab(), lives: [l], drafts: { 'data_analyst:standalone': validInput('data_analyst') } };
    const restored = parseLab(JSON.stringify(s)); expect(restored).toEqual(s); expect(currentEvent(restored.lives[0], [])).toEqual(currentEvent(l, []));
    const end = progress(restored.lives[0], 'flexible', 3); expect(end.history).toHaveLength(6); expect(parseLab(JSON.stringify({ ...s, lives: [end] })).lives[0].status).toBe('completed');
  });
  it('migrates prerelease v0, handles empty storage and refuses corrupt or unknown data', () => {
    expect(parseLab(null)).toEqual(emptyLab()); expect(parseLab(JSON.stringify({ version: 0, lives: [], missions: [], evidence: [] }))).toEqual(emptyLab());
    for (const raw of ['null', '{broken', JSON.stringify({ ...emptyLab(), version: 99 }), JSON.stringify({ ...emptyLab(), lives: [{}] }), JSON.stringify({ ...emptyLab(), drafts: { a: {} } })]) expect(() => parseLab(raw)).toThrow();
  });
  it('deletes only the selected life and its tasks/evidence; independent branches remain', () => {
    const l = progress(life(), 'leader'); const b = forkLife(l, 2, 'b', at);
    const s = { ...emptyLab(), lives: [l, b] }; const next = deleteLife(s, 'a'); expect(next.lives).toHaveLength(1); expect(next.lives[0].id).toBe('b'); expect(next.lives[0].parentId).toBeUndefined();
  });
  it('writes only to lab namespace, surfaces quota failure and preserves original data', () => {
    const data = new Map<string, string>([[STORAGE_KEY, JSON.stringify(app)]]); const setItem = vi.fn((key: string, value: string) => data.set(key, value));
    vi.stubGlobal('window', { localStorage: { getItem: (k: string) => data.get(k) ?? null, setItem } });
    try {
      replaceLab(JSON.stringify(emptyLab())); updateLab((s) => addLife(s, life())); expect(setItem.mock.calls.every(([key]) => key === LAB_STORAGE_KEY)).toBe(true); expect(data.get(STORAGE_KEY)).toBe(JSON.stringify(app));
      setItem.mockImplementation(() => { throw new Error('quota'); }); expect(() => updateLab((s) => ({ ...s, lives: [] }))).toThrow('儲存失敗'); expect(parseLab(data.get(LAB_STORAGE_KEY)!).lives).toHaveLength(1);
    } finally { vi.unstubAllGlobals(); }
  });
  it('original old assessment versions still parse through their existing migration', () => {
    for (const schemaVersion of [2, 3, 4, 5, 6]) { const state = parseStoredState(JSON.stringify({ ...app, schemaVersion, experiments: [{ careerId: 'data_analyst', status: 'in_progress', currentStep: 2, updatedAt: at }] })); expect(state.experiments[0].currentStep).toBe(2); expect(state.schemaVersion).toBe(6); }
  });
});

describe('Expanded sectors and complete branch graph', () => {
  it('includes manufacturing, skilled trades and frontline service without duplicate career IDs', () => {
    expect(LAB_CAREERS.filter((c) => c.sector === '製造與技術現場').map((c) => c.careerId)).toEqual(['industrial_engineer', 'cnc_technician', 'electrician', 'auto_mechanic']);
    expect(LAB_CAREERS.filter((c) => c.sector === '第一線與服務營運')).toHaveLength(4);
    const c = progress(life('field', 'cnc_technician'), 'flexible', 4);
    expect(currentEvent(c, [])!.title).toBe('輪值與工作分工的新安排');
    expect(currentEvent(c, [])!.background).toContain('實際現場工作仍需到場');
  });
  it('allows choosing a later task decision first without corrupting the draft', () => {
    const draft = initialMissionInput('data_analyst'); draft.decisions[1] = '檢查埋點並分來源驗證';
    expect(parseLab(JSON.stringify({ ...emptyLab(), drafts: { task: draft } })).drafts.task.decisions[0]).toBe('');
  });
  it('all 729 choice sequences per occupation finish with bounded state', () => {
    for (const c of LAB_CAREERS) {
      for (let path = 0; path < 729; path++) {
        let l = life('graph', c.careerId); let choices = path;
        for (let step = 0; step < 6; step++) {
          const event = currentEvent(l, [])!; expect(event).toBeDefined();
          l = decide(l, event.id, (['specialist', 'leader', 'flexible'] as const)[choices % 3], [], at); choices = Math.floor(choices / 3);
        }
        expect(l.status).toBe('completed'); expect(Object.values(l.stats).every((v) => v >= 0 && v <= 100)).toBe(true);
      }
    }
  }, 60000);
  it('rejects broken nested personal snapshots and inconsistent resumed state', () => {
    const bad = life(); bad.stats.skill = 99;
    expect(() => parseLab(JSON.stringify({ ...emptyLab(), lives: [bad] }))).toThrow();
    const broken = { ...life(), personal: { ...life().personal, reflections: [null] } };
    expect(() => parseLab(JSON.stringify({ ...emptyLab(), lives: [broken] }))).toThrow();
  });
});
