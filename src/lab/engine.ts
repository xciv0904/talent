import { careerTakeaway } from './guidance';
import { CAREER_PROFILES } from '../data/careers';
import type { AppStorageState } from '../services/storage';
import { eventsFor, labCareer } from './content';
import { YEARS, type Condition, type Evidence, type Goal, type LabState, type Life, type MissionInput, type MissionResult, type Reflection, type Stats } from './types';

export const emptyLab = (): LabState => ({ version: 1, lives: [], missions: [], evidence: [], snapshots: [], drafts: {} });
export const newId = () => globalThis.crypto.randomUUID();
const copy = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
export function createLife(careerId: string, goal: Goal, mode: Life['mode'], app: AppStorageState, id: string, at: string, seed = 42): Life {
  const career = labCareer(careerId);
  if (!career) throw new Error('尚未支援的職業');
  const talent = app.talentProfile;
  const match = app.careerResults?.matches.find((m) => m.careerId === careerId) ?? null;
  // Neutral start remains explicit. Assessment only changes practice starting context, never a ceiling.
  const requirements = CAREER_PROFILES.find((c) => c.id === careerId)?.talentRequirements ?? {};
  const relevant = talent?.baseTalents.filter((item) => item.talentId in requirements && item.confidence.level !== 'low') ?? [];
  const avgEnergy = relevant.filter((t) => t.energyScore !== null);
  const initial: Stats = { skill: 35, energy: avgEnergy.length ? clamp(60 + avgEnergy.reduce((sum, t) => sum + (t.energyScore ?? 0), 0) / avgEnergy.length * 8) : 60, stress: 30, satisfaction: 50, money: 55, time: 65, autonomy: 35, opportunity: 35, balance: 60 };
  return { id, careerId, name: `${career.hook.slice(0, 8)} · ${goal}`, goal, mode, seed: seed >>> 0, createdAt: at, updatedAt: at, personal: copy({ capturedAt: at, talent, profiles: app.careerResults?.profiles ?? null, match, experiments: app.experiments, reflections: app.reflectionResults }), initial, stats: { ...initial }, history: [], flags: [], status: 'active' };
}
export function meets(condition: Condition, life: Life, missions: MissionResult[]): boolean {
  if (condition.stat && ((condition.min !== undefined && life.stats[condition.stat] < condition.min) || (condition.max !== undefined && life.stats[condition.stat] > condition.max))) return false;
  if (condition.flag && !life.flags.includes(condition.flag)) return false;
  if (condition.goal && life.goal !== condition.goal) return false;
  if (condition.missionScore !== undefined && !missions.some((m) => m.lifeId === life.id && m.score >= condition.missionScore!)) return false;
  if (condition.talent && !life.personal.talent?.baseTalents.some((t) => t.talentId === condition.talent && t.confidence.level !== 'low' && t.score >= .35)) return false;
  if (condition.priorEngagement && !life.personal.reflections.some((r) => r.careerId === life.careerId && ['engaged', 'interesting'].includes(r.feeling)) && !missions.some((m) => m.lifeId === life.id && (m.reflection?.interest ?? 0) >= 4)) return false;
  return true;
}
export function currentEvent(life: Life, missions: MissionResult[]) {
  if (life.status === 'completed') return undefined;
  const year = YEARS[life.history.length];
  const pool = eventsFor(life.careerId).filter((e) => e.year === year && !life.history.some((h) => h.eventId === e.id) && (e.conditions ?? []).every((c) => meets(c, life, missions)));
  // Conditional events take precedence. Seed selects among eligible cards of the same specificity.
  const conditional = pool.filter((e) => e.conditions?.length);
  const candidates = conditional.length ? conditional : pool;
  const random = ((life.seed ^ ((year + 1) * 2654435761)) >>> 0) / 4294967296;
  return candidates[Math.floor(random * candidates.length)];
}
export function decide(life: Life, eventId: string, choiceId: string, missions: MissionResult[], at: string): Life {
  if (life.status !== 'active') throw new Error('請先恢復模擬。');
  const event = currentEvent(life, missions);
  if (!event || event.id !== eventId) throw new Error('事件已處理或進度不符，請使用目前事件。');
  const choice = event.choices.find((item) => item.id === choiceId);
  if (!choice) throw new Error('無效的選項');
  const stats = { ...life.stats };
  for (const [key, delta] of Object.entries(choice.effects)) stats[key as keyof Stats] = clamp(stats[key as keyof Stats] + delta);
  const goalBonus = (life.goal === 'balance' && choice.id === 'flexible') || (life.goal === 'autonomy' && choice.id === 'flexible') || (life.goal === 'income' && choice.id === 'leader') || (life.goal === 'achievement' && choice.id === 'specialist') || (life.goal === 'stability' && choice.id === 'specialist');
  if (goalBonus) stats.satisfaction = clamp(stats.satisfaction + 5);
  const familiar = life.personal.match?.topTalentReasons.length ? '原測驗有相關能力訊號，可以帶著作品再驗證；仍需練習。' : '此處尚無足夠個人能力證據，可透過任務逐步建立。';
  const feedback = `${familiar}${goalBonus ? '這次選擇與目前目標一致，模擬滿足感增加 5。' : '這次選擇帶來另一種取捨，目標可以在下一條人生重新設定。'}`;
  const history = [...life.history, { eventId, year: event.year, title: event.title, choice: copy(choice), before: { ...life.stats }, after: stats, at, feedback }];
  const completed = history.length === YEARS.length;
  return { ...life, stats, history, flags: [...new Set([...life.flags, choice.flag])], updatedAt: at, status: completed ? 'completed' : 'active', ending: completed ? choice.id : undefined };
}
export function forkLife(life: Life, index: number, id: string, at: string): Life {
  if (!Number.isInteger(index) || index < 0 || index >= life.history.length) throw new Error('找不到分支節點');
  const history = copy(life.history.slice(0, index));
  return { ...copy(life), id, name: `${life.name} · 分支`, parentId: life.id, forkAt: life.history[index].year, history, stats: index === 0 ? { ...life.initial } : { ...history[index - 1].after }, flags: [...new Set(history.map((h) => h.choice.flag))], status: 'active', ending: undefined, createdAt: at, updatedAt: at };
}
export function forkLab(state: LabState, life: Life, index: number, id: string, at: string): LabState {
  const branch = forkLife(life, index, id, at);
  const cutoff = life.history[index].at;
  const inherited = state.missions.filter((m) => m.lifeId === life.id && m.at <= cutoff).map((m) => ({ ...copy(m), id: `${id}-${m.id}`, lifeId: id, inheritedFrom: m.inheritedFrom ?? m.id }));
  return { ...state, lives: [...state.lives, branch], missions: [...state.missions, ...inherited] };
}
export const initialMissionInput = (careerId: string): MissionInput => ({ decisions: labCareer(careerId)?.mission.decisions.map(() => '') ?? [], allocation: [0, 0, 0], order: labCareer(careerId)?.mission.priorities.map((p) => p.id).reverse() ?? [], text: '', checks: [] });
export function evaluateMission(careerId: string, input: MissionInput, id: string, at: string, lifeId?: string): MissionResult {
  const m = labCareer(careerId)?.mission;
  if (!m) throw new Error('找不到任務');
  if (input.decisions.length !== m.decisions.length || input.decisions.some((v, i) => !m.decisions[i].options.includes(v))) throw new Error('請完成所有情境判讀。');
  if (input.allocation.length !== 3 || input.allocation.some((n) => !Number.isFinite(n) || !Number.isInteger(n) || n < 0 || n > 100) || input.allocation.reduce((a, b) => a + b, 0) !== 100) throw new Error('資源分配必須為 0–100 的整數且總和 100。');
  if (input.order.length !== 3 || new Set(input.order).size !== 3 || !input.order.every((v) => m.priorities.some((p) => p.id === v))) throw new Error('請為每項工作設定不同順位。');
  if (input.text.trim().length < 20 || input.text.length > 2000) throw new Error('請填寫 20–2000 字的實際產出。');
  const criteria = [
    ...m.decisions.map((d, i) => ({ label: d.prompt, passed: input.decisions[i] === d.correct, advice: d.rationale })),
    { label: '資源符合本題限制', passed: input.allocation.every((n, i) => n >= m.allocation.minimum[i]), advice: m.allocation.rationale },
    { label: '先處理關鍵前提', passed: input.order[0] === m.first, advice: m.priorityAdvice },
  ];
  return { id, at, careerId, lifeId, input: copy({ ...input, text: input.text.trim(), checks: input.checks.filter((v) => m.checks.includes(v)) }), criteria, score: Math.round(criteria.filter((c) => c.passed).length / criteria.length * 100) };
}
export function validateReflection(r: Reflection) {
  if (![r.interest, r.achievement, r.energy, r.willingness].every((v) => Number.isInteger(v) && v >= 1 && v <= 5) || !r.hardest.trim() || r.hardest.length > 1000) throw new Error('請完成四項感受及最困難的部分。');
}
export function recordEvidence(state: LabState, evidence: Evidence, reason: string): LabState {
  if (state.evidence.some((e) => e.id === evidence.id)) return state;
  const next = { ...state, evidence: [...state.evidence, evidence] };
  return { ...next, snapshots: [...next.snapshots, { id: evidence.id, at: evidence.at, reason, evidenceIds: next.evidence.map((e) => e.id), findings: analyzeEvidence(next.evidence) }] };
}
export function analyzeEvidence(evidence: Evidence[]): string[] {
  const careers = [...new Set(evidence.map((e) => e.careerId).filter((id): id is string => Boolean(id)))];
  return careers.length ? careers.map((careerId) => {
    const takeaway = careerTakeaway(careerId, evidence);
    const name = CAREER_PROFILES.find((c) => c.id === careerId)?.titleZh ?? careerId;
    const latestTask = evidence.find((e) => e.id === takeaway.evidenceIds[0]);
    const mismatch = takeaway.status === 'pause' && (latestTask?.score ?? 0) >= 70 ? ' 本次任務表現與投入感有落差。' : '';
    return `${name}：${takeaway.headline}。${takeaway.benefit}${mismatch}`;
  }) : ['先選一個工作任務，做完就能決定下一步要繼續、練習，還是換方向。'];
}
export function addLife(state: LabState, life: Life): LabState {
  const next = { ...state, lives: [...state.lives, life] };
  return syncBaseline(next, life.personal, life.createdAt);
}
export function syncBaseline(state: LabState, personal: Life['personal'], at: string): LabState {
  let next = state;
  if (personal.talent) next = recordEvidence(next, { id: `assessment-${personal.talent.generatedAt}`, kind: 'assessment', at, sourceId: personal.talent.generatedAt, scope: '原始測驗；能力、複合天賦與偏好快照保留於人生存檔，不被模擬覆寫', weight: 1, summary: `${personal.talent.baseTalents.length} 項基礎、${personal.talent.compositeTalents.length} 項複合天賦` }, '初次測驗／測驗版本更新');
  for (const r of personal.reflections) next = recordEvidence(next, { id: `experiment-${r.careerId}-${r.completedAt}`, kind: 'experiment', at: r.completedAt, careerId: r.careerId, sourceId: r.careerId, scope: '既有 20 分鐘實驗的主觀回饋，未評估作品品質', weight: .5, summary: `短實驗感受：${r.feeling}；偏好：${r.preference}` }, '匯入既有真實探索日期');
  return next;
}
