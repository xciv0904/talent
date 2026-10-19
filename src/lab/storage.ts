import { useSyncExternalStore } from 'react';
import { analyzeEvidence, emptyLab } from './engine';
import { labCareer } from './content';
import { GOALS, STATE_LABELS, type LabState, type Life, type MissionInput } from './types';

export const LAB_STORAGE_KEY = 'career-discovery-lab';
const object = (v: unknown): v is Record<string, unknown> => Boolean(v && typeof v === 'object' && !Array.isArray(v));
const timestamp = (v: unknown) => typeof v === 'string' && Number.isFinite(Date.parse(v));
const stats = (v: unknown) => object(v) && Object.keys(STATE_LABELS).every((k) => typeof v[k] === 'number' && Number.isFinite(v[k]) && (v[k] as number) >= 0 && (v[k] as number) <= 100);
const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const strings = (v: unknown): v is string[] => Array.isArray(v) && v.every((s) => typeof s === 'string');
function input(v: unknown): v is MissionInput {
  return object(v) && strings(v.decisions) && strings(v.order) && strings(v.checks) && typeof v.text === 'string' && v.text.length <= 2000 && Array.isArray(v.allocation) && v.allocation.length === 3 && v.allocation.every((n) => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 100);
}
function validLife(v: unknown): v is Life {
  if (!object(v) || typeof v.id !== 'string' || typeof v.careerId !== 'string' || !labCareer(v.careerId) || typeof v.name !== 'string' || !timestamp(v.createdAt) || !timestamp(v.updatedAt) || typeof v.seed !== 'number' || !Number.isInteger(v.seed) || !['quick', 'full'].includes(String(v.mode)) || !Object.hasOwn(GOALS, String(v.goal)) || !stats(v.initial) || !stats(v.stats) || !strings(v.flags) || !['active', 'paused', 'completed'].includes(String(v.status)) || !Array.isArray(v.history) || v.history.length > 6 || !object(v.personal)) return false;
  const p = v.personal;
  if (!timestamp(p.capturedAt) || !Array.isArray(p.experiments) || !Array.isArray(p.reflections)) return false;
  if (p.talent !== null && (!object(p.talent) || !timestamp(p.talent.generatedAt) || !Array.isArray(p.talent.baseTalents) || !p.talent.baseTalents.every((t) => object(t) && typeof t.talentId === 'string' && finite(t.score) && (t.energyScore === null || finite(t.energyScore)) && object(t.confidence) && ['low', 'medium', 'high'].includes(String(t.confidence.level))) || !Array.isArray(p.talent.compositeTalents) || !p.talent.compositeTalents.every((t) => object(t) && typeof t.compositeTalentId === 'string' && finite(t.score)))) return false;
  if (p.match !== null && (!object(p.match) || !strings(p.match.topTalentReasons) || !strings(p.match.potentialFrictions))) return false;
  if (p.profiles !== null && (!object(p.profiles) || !object(p.profiles.coverage))) return false;
  if (!p.reflections.every((r) => object(r) && typeof r.careerId === 'string' && typeof r.feeling === 'string' && timestamp(r.completedAt))) return false;
  const years = [0, 1, 3, 5, 7, 10];
  if (!v.history.every((h, i) => object(h) && typeof h.eventId === 'string' && h.year === years[i] && typeof h.title === 'string' && typeof h.feedback === 'string' && timestamp(h.at) && stats(h.before) && stats(h.after) && object(h.choice) && ['specialist', 'leader', 'flexible'].includes(String(h.choice.id)) && typeof h.choice.flag === 'string' && typeof h.choice.label === 'string' && typeof h.choice.result === 'string' && object(h.choice.effects))) return false;
  if (new Set(v.history.map((h) => h.eventId)).size !== v.history.length) return false;
  const currentStats = v.stats as Record<string, number>;
  const final = (v.history.at(-1)?.after ?? v.initial) as Record<string, number>;
  if (!Object.keys(STATE_LABELS).every((k) => currentStats[k] === final[k])) return false;
  return v.status === 'completed' ? v.history.length === 6 && ['specialist', 'leader', 'flexible'].includes(String(v.ending)) : v.history.length < 6;
}
export function parseLab(raw: string | null): LabState {
  if (!raw) return emptyLab();
  const value: unknown = JSON.parse(raw);
  if (!object(value) || (value.version !== 1 && value.version !== 0)) throw new Error('存檔版本不支援，原始資料已保留；請先匯出或重設實驗室。');
  // Pre-release v0 had the same life/mission fields, without drafts and analysis versions.
  const v = value.version === 0 ? { ...value, version: 1, drafts: {}, snapshots: [] } : value;
  if (!Array.isArray(v.lives) || !v.lives.every(validLife) || new Set(v.lives.map((l) => l.id)).size !== v.lives.length || !Array.isArray(v.missions) || !Array.isArray(v.evidence) || !Array.isArray(v.snapshots) || !object(v.drafts)) throw new Error('存檔結構不完整；為保護資料，已停止寫入。');
  if (!Object.values(v.drafts).every(input)) throw new Error('任務草稿格式不符。');
  const lives = v.lives;
  const evidenceIds = new Set(v.evidence.map((e: unknown) => object(e) ? e.id : undefined));
  if (evidenceIds.size !== v.evidence.length || new Set(v.missions.map((m: unknown) => object(m) ? m.id : undefined)).size !== v.missions.length) throw new Error('存檔包含重複紀錄，已停止寫入。');
  if (!v.missions.every((m) => object(m) && typeof m.id === 'string' && typeof m.careerId === 'string' && Boolean(labCareer(m.careerId)) && (m.lifeId === undefined || lives.some((l: Life) => l.id === m.lifeId && l.careerId === m.careerId)) && timestamp(m.at) && typeof m.score === 'number' && Number.isFinite(m.score) && m.score >= 0 && m.score <= 100 && input(m.input) && Array.isArray(m.criteria) && m.criteria.every((c) => object(c) && typeof c.label === 'string' && typeof c.passed === 'boolean' && typeof c.advice === 'string') && (m.reflection === undefined || (object(m.reflection) && Object.entries(m.reflection).filter(([k]) => ['interest', 'achievement', 'energy', 'willingness'].includes(k)).length === 4 && Object.entries(m.reflection).filter(([k]) => ['interest', 'achievement', 'energy', 'willingness'].includes(k)).every(([, n]) => typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 5) && typeof m.reflection.hardest === 'string')))) throw new Error('任務紀錄格式不符。');
  if (!v.evidence.every((e) => object(e) && typeof e.id === 'string' && ['assessment', 'simulation', 'mission', 'reflection', 'experiment'].includes(String(e.kind)) && timestamp(e.at) && typeof e.scope === 'string' && typeof e.sourceId === 'string' && typeof e.summary === 'string' && typeof e.weight === 'number' && Number.isFinite(e.weight) && ['score', 'interest', 'energy', 'willingness'].every((k) => e[k] === undefined || finite(e[k])))) throw new Error('探索證據格式不符。');
  if (!v.snapshots.every((s) => object(s) && typeof s.id === 'string' && timestamp(s.at) && typeof s.reason === 'string' && strings(s.evidenceIds) && strings(s.findings))) throw new Error('分析版本格式不符。');
  const parsed = v as unknown as LabState;
  // Older v1 evidence omitted willingness although the original reflection already saved it.
  // Fill only missing metadata from the exact source result; keep historical findings unchanged.
  const missionsById = new Map(parsed.missions.map((m) => [m.id, m]));
  return { ...parsed, evidence: parsed.evidence.map((e) => {
    const reflection = e.kind === 'reflection' ? missionsById.get(e.sourceId)?.reflection : undefined;
    return reflection && e.willingness === undefined ? { ...e, willingness: reflection.willingness } : e;
  }) };
}
let rawCache: string | null | undefined;
let cached = emptyLab();
let error = '';
const listeners = new Set<() => void>();
function emit() { listeners.forEach((f) => f()); }
export function loadLab() {
  try {
    const raw = window.localStorage.getItem(LAB_STORAGE_KEY);
    if (raw !== rawCache) { cached = parseLab(raw); rawCache = raw; error = ''; }
  } catch (e) { error = `無法讀取實驗室：${e instanceof Error ? e.message : '本機儲存無法使用'}`; }
  return cached;
}
export function labStorageError() { return error; }
export function updateLab(fn: (state: LabState) => LabState) {
  const current = loadLab();
  if (error) throw new Error(error);
  const next = fn(current);
  const raw = JSON.stringify(next);
  parseLab(raw);
  try { window.localStorage.setItem(LAB_STORAGE_KEY, raw); }
  catch { throw new Error('儲存失敗，可能空間不足或瀏覽器禁止儲存。請先匯出；本次操作尚未儲存。'); }
  rawCache = raw; cached = next; emit();
}
function subscribe(fn: () => void) {
  listeners.add(fn);
  const change = (e: StorageEvent) => { if (e.key === LAB_STORAGE_KEY || e.key === null) { rawCache = undefined; emit(); } };
  window.addEventListener('storage', change);
  return () => { listeners.delete(fn); window.removeEventListener('storage', change); };
}
export function useLab() { return useSyncExternalStore(subscribe, loadLab, () => cached); }
export function downloadJson(filename: string, value: string) {
  const url = URL.createObjectURL(new Blob([value], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function exportLab() { downloadJson('career-lab-backup.json', window.localStorage.getItem(LAB_STORAGE_KEY) ?? JSON.stringify(emptyLab())); }
export function replaceLab(raw: string) {
  const next = parseLab(raw);
  const encoded = JSON.stringify(next);
  window.localStorage.setItem(LAB_STORAGE_KEY, encoded);
  rawCache = encoded; cached = next; error = ''; emit();
}
export function deleteLife(state: LabState, id: string): LabState {
  // Keep independent forks. Remove deleted life's identifiable evidence from historical snapshots as well.
  const evidence = state.evidence.filter((e) => e.lifeId !== id);
  const ids = new Set(evidence.map((e) => e.id));
  return { ...state, lives: state.lives.filter((l) => l.id !== id).map((l) => l.parentId === id ? { ...l, parentId: undefined } : l), missions: state.missions.filter((m) => m.lifeId !== id), evidence, snapshots: state.snapshots.filter((s) => ids.has(s.id)).map((s) => ({ ...s, evidenceIds: s.evidenceIds.filter((e) => ids.has(e)), findings: analyzeEvidence(evidence.filter((e) => s.evidenceIds.includes(e.id))) })), drafts: Object.fromEntries(Object.entries(state.drafts).filter(([key]) => !key.endsWith(`:${id}`))) };
}
