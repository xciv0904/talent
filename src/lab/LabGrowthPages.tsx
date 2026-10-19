import { careerTakeaway } from './guidance';
import { TakeawayPanel } from './TakeawayPanel';
import { useLabAction } from './actions';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CAREER_PROFILES } from '../data/careers';
import { BASE_TALENTS } from '../data/talents';
import { careerRequirementSummary } from '../utils';
import { useAppState } from '../services/use-app-state';
import { analyzeEvidence, emptyLab, syncBaseline } from './engine';
import { ENDINGS, labCareer } from './content';
import { downloadJson, exportLab, replaceLab, updateLab, useLab } from './storage';
import type { Evidence, LabState, Life } from './types';
import { Panel, Empty, careerTitle, dateLabel } from './LabLayout';

function useSyncEvidence() {
  const app = useAppState(); const act = useLabAction();
  useEffect(() => {
    act(() => updateLab((s) => syncBaseline(s, { capturedAt: new Date().toISOString(), talent: app.talentProfile, profiles: app.careerResults?.profiles ?? null, match: null, experiments: app.experiments, reflections: app.reflectionResults }, new Date().toISOString())));
  // Original state changes alone trigger import. Lab updates must not create an update loop.
  }, [app.talentProfile, app.reflectionResults]);
}
const sourceLabel: Record<Evidence['kind'], string> = { assessment: 'A 初始測驗', simulation: 'B 模擬行為', mission: 'C 任務成果', reflection: 'C 主觀反思', experiment: 'C 舊職涯實驗反思' };
function printReport() {
  const collapsed = Array.from(document.querySelectorAll<HTMLDetailsElement>('.lab-report details:not([open])'));
  collapsed.forEach((node) => { node.open = true; });
  window.addEventListener('afterprint', () => collapsed.forEach((node) => { node.open = false; }), { once: true });
  window.print();
}
function EvidenceList({ evidence }: { evidence: Evidence[] }) {
  return <ol className="lab-timeline">{[...evidence].reverse().map((e) => <li key={e.id}><p className="eyebrow">{sourceLabel[e.kind]} / {dateLabel(e.at)}</p><h3>{e.careerId ? careerTitle(e.careerId) : '原始測驗'}</h3><p>{e.summary}</p><small>{e.scope} · 相對證據權重 {e.weight}</small><details><summary>回溯來源</summary><p className="lab-source">來源 ID：{e.sourceId}<br />證據 ID：{e.id}</p>{e.kind === 'assessment' && <Link to="/results">檢視原始結果 ↗</Link>}{e.lifeId && <Link to={`/lab/life/${e.lifeId}`}>檢視模擬年份與狀態 ↗</Link>}{(e.kind === 'mission' || e.kind === 'reflection') && <Link to={`/lab/mission/${e.careerId}?${new URLSearchParams({ result: e.sourceId, ...(e.lifeId ? { life: e.lifeId } : {}) })}`}>檢視任務產出與反思 ↗</Link>}</details></li>)}</ol>;
}
export function GrowthPage() {
  useSyncEvidence(); const lab = useLab(); const act = useLabAction(); const app = useAppState();
  const takeawayIds = [...new Set(lab.evidence.map((e) => e.careerId).filter((id): id is string => Boolean(id)))];
  const graded = lab.missions.filter((m) => !m.inheritedFrom).flatMap((m) => m.criteria.filter((c) => c.passed).map((c) => ({ label: c.label, source: m.id })));
  const grouped = new Map<string, typeof lab.missions>();
  for (const m of lab.missions.filter((m) => m.reflection && !m.inheritedFrom)) grouped.set(m.careerId, [...(grouped.get(m.careerId) ?? []), m]);
  const interests = [...grouped.entries()].map(([id, list]) => ({ id, interest: list!.reduce((sum, m) => sum + m.reflection!.interest, 0) / list!.length, energy: list!.reduce((sum, m) => sum + m.reflection!.energy, 0) / list!.length, count: list!.length })).sort((a, b) => b.interest - a.interest);
  return <><header className="lab-heading"><p className="eyebrow">CAREER GROWTH / MY EXPLORATION</p><h1>你的下一步，整理在這裡。</h1><p>先看每個方向現在該繼續、練習，還是換一種工作。想查原因和過程，再往下展開。</p><Link className="lab-button" to="/lab/report">閱讀／列印個人化報告 ↗</Link></header><div className="lab-grid three">{[[new Set([...lab.lives.map((l) => l.careerId), ...lab.missions.map((m) => m.careerId)]).size, '已探索職業'], [lab.lives.filter((l) => l.status === 'completed').length, '完成人生'], [lab.missions.filter((m) => !m.inheritedFrom).length, '任務產出']].map(([n, label]) => <Panel key={label}><p className="lab-score">{n}</p><p>{label}</p></Panel>)}</div><section aria-label="現在先做哪一步"><h2 className="text-2xl font-semibold">你現在先做哪一步</h2>{takeawayIds.length ? takeawayIds.map((id) => <div key={id}><h3 className="mt-6 font-semibold">{careerTitle(id)}</h3><TakeawayPanel takeaway={careerTakeaway(id, lab.evidence)} /></div>) : <Panel title="先試一個任務"><p>做完並記下感受，就能知道這個方向該繼續、先練習，還是排後面。</p><Link className="lab-button" to="/lab/missions">選一個工作任務 →</Link></Panel>}</section><div className="lab-grid two"><Panel title="哪些工作讓你想繼續？">{interests.length ? interests.map((i) => <p key={i.id}><strong>{careerTitle(i.id)}</strong><br />興趣 {i.interest.toFixed(1)} / 5 · 能量 {i.energy.toFixed(1)} / 5 · {i.count} 次反思</p>) : <p>任務完成後，補上感受才會出現偏好觀察。</p>}</Panel><Panel title="有證據的練習與待驗證能力">{graded.length ? [...new Set(graded.map((c) => c.label))].map((label) => <p key={label}>✓ {label}（{graded.filter((c) => c.label === label).length} 次本地任務檢核）</p>) : <p>尚無可檢驗的任務產出。</p>}<p>仍待驗證：真實時限下的產出品質、跨情境表現、與他人合作。自由文字品質只做自我檢核。</p></Panel></div><Panel title="分析歷史版本"><p>每次測驗匯入、決策、任務或反思都保留當時證據集合及發現。</p>{lab.snapshots.length ? <div className="lab-versions">{[...lab.snapshots].reverse().map((s) => <details key={s.id}><summary>{dateLabel(s.at)} · {s.reason} · {s.evidenceIds.length} 筆證據</summary>{s.findings.map((f) => <p key={f}>{f}</p>)}<small>依據：{s.evidenceIds.join('、')}</small></details>)}</div> : <p>還沒有分析版本。</p>}</Panel><Panel title="真實探索時間軸">{lab.lives.map((l) => <p key={l.id}>{dateLabel(l.createdAt)} · {l.parentId ? '建立平行分支' : '開始職涯人生'}：{l.name}（真實探索日期，不是工作年資）</p>)}{lab.evidence.length ? <EvidenceList evidence={lab.evidence} /> : <p>這裡以實際日期記錄測驗、模擬選擇與任務。</p>}</Panel><Panel title="模擬人生時間軸">{lab.lives.length ? lab.lives.map((l) => <details key={l.id}><summary>{l.name} · {l.history.length}/6 個年份</summary>{l.history.map((h) => <p key={h.eventId}>模擬 Year {h.year} · {h.title} → {h.choice.label}</p>)}<Link to={`/lab/life/${l.id}`}>載入人生／從節點分支 →</Link></details>) : <p>先建立人生；模擬年份不計入真實工作年資。</p>}</Panel>{!app.talentProfile && <Panel title="為下一段人生加入更多脈絡"><p>目前使用中性起點；完成原有測驗後，探索紀錄會保留，新的模擬可以使用結果，舊模擬保留當時快照。</p><Link className="lab-button" to="/assessment">前往天賦測驗</Link></Panel>}<Panel title="本機資料管理"><p>清除瀏覽器資料會失去紀錄，請定期匯出。以下僅管理 Career Lab，原有測驗資料使用獨立儲存。</p><div className="lab-actions"><button className="lab-button secondary" onClick={() => act(exportLab)}>匯出完整 JSON 備份</button><label className="lab-file-label">從 JSON 備份還原<input type="file" accept="application/json,.json" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; if (file.size > 10 * 1024 * 1024) { act(() => { throw new Error('備份超過 10 MB，請先確認檔案。'); }); return; } void file.text().then((raw) => { if (confirm('以此備份取代目前實驗室資料？建議先匯出現有資料。')) act(() => replaceLab(raw)); }).catch(() => act(() => { throw new Error('無法讀取備份檔案。'); })); e.target.value = ''; }} /></label><button className="lab-text-button danger" onClick={() => { if (confirm('清除所有 Career Lab 存檔、任務與證據？不會清除原始測驗。請先匯出。')) act(() => replaceLab(JSON.stringify(emptyLab()))); }}>重設實驗室資料</button></div></Panel></>;
}
function Comparison({ lives, lab }: { lives: Life[]; lab: LabState }) {
  const app = useAppState();
  const metric = (l: Life, key: 'interestMatch' | 'environmentMatch') => { const m = app.careerResults?.matches.find((m) => m.careerId === l.careerId); return m ? `${Math.round(m[key] * 100)} / 100 指標（${m.confidence} 信心）` : '尚無測驗推估'; };
  const tasks = (l: Life) => lab.missions.filter((m) => m.lifeId === l.id);
  const feelings = (l: Life) => tasks(l).filter((m) => m.reflection);
  const rows: [string, (l: Life) => string][] = [
    ['工作內容｜職業資料庫', (l) => CAREER_PROFILES.find((c) => c.id === l.careerId)?.coreTasks.join('；') ?? ''],
    ['目前個人化推估｜興趣', (l) => metric(l, 'interestMatch')],
    ['目前個人化推估｜工作環境', (l) => metric(l, 'environmentMatch')],
    ['模擬故事｜發展方向', (l) => l.ending ? ENDINGS[l.ending].title : `已經歷 ${l.history.length} 個年份`],
    ['模擬故事｜職場壓力', (l) => `${l.stats.stress} / 100`],
    ['模擬故事｜技能成長方向', (l) => `${labCareer(l.careerId)?.skills.join('、')}；練習狀態 ${l.stats.skill}/100`],
    ['模擬故事｜工作自主性', (l) => `${l.stats.autonomy} / 100`],
    ['模擬故事｜工作生活取捨', (l) => `生活平衡 ${l.stats.balance}/100；時間資源 ${l.stats.time}/100`],
    ['實際任務證據｜完成表現', (l) => tasks(l).length ? tasks(l).map((m) => `${m.score}/100 結構檢核${m.inheritedFrom ? '（繼承原任務，未新增練習）' : ''}`).join('；') : '尚未完成此人生的任務'],
    ['實際任務證據｜主觀投入', (l) => feelings(l).length ? feelings(l).map((m) => `興趣 ${m.reflection!.interest}/5；能量 ${m.reflection!.energy}/5；長期意願 ${m.reflection!.willingness}/5`).join('；') : '尚未反思，不推估'],
    ['現實入職｜一般準備需求', (l) => { const c = CAREER_PROFILES.find((c) => c.id === l.careerId); return c ? `${careerRequirementSummary(c)}；${c.careerExperiment.description}` : ''; }],
  ];
  return <div className="lab-table-wrap" role="region" aria-label="平行職涯比較表，可左右捲動" tabIndex={0}><table className="lab-table"><thead><tr><th scope="col">證據層與比較項目</th>{lives.map((l) => <th scope="col" key={l.id}>{l.name}</th>)}</tr></thead><tbody>{rows.map(([label, render]) => <tr key={label}><th scope="row">{label}</th>{lives.map((l) => <td key={l.id}>{render(l)}</td>)}</tr>)}</tbody></table></div>;
}
export function LabComparePage() {
  const lab = useLab(); const [left, setLeft] = useState(lab.lives[0]?.id ?? ''); const [right, setRight] = useState(lab.lives[1]?.id ?? '');
  const pair = [lab.lives.find((l) => l.id === left), lab.lives.find((l) => l.id === right)].filter((l): l is Life => Boolean(l));
  return <><header className="lab-heading"><p className="eyebrow">PARALLEL CAREERS / SIDE BY SIDE</p><h1>不是比輸贏。<br />是看清楚交換了什麼。</h1><p>模擬狀態、目前的測驗推估、實際任務證據分開呈現。沒有任務的地方不填造數字。</p></header>{lab.lives.length < 2 ? <Empty>先建立兩條人生，即使還沒完成也能比較。</Empty> : <><div className="lab-grid two">{[[left, setLeft, '人生 A'], [right, setRight, '人生 B']].map(([value, setValue, label]) => <label key={label as string}>{label as string}<select value={value as string} onChange={(e) => (setValue as (v: string) => void)(e.target.value)}>{lab.lives.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select></label>)}</div>{left === right ? <Panel><p>請選擇不同的兩條人生。</p></Panel> : <Comparison lives={pair} lab={lab} />}</>}<p className="lab-note">一般入職需求不是個人轉職距離；仍需比對教育、實務、語言與作品。測驗推估採目前結果，人生狀態採當次起點與選擇。</p></>;
}
export function ReportPage() {
  useSyncEvidence(); const lab = useLab(); const app = useAppState(); const act = useLabAction();
  const at = new Date().toISOString(); const findings = analyzeEvidence(lab.evidence);
  const interests = lab.missions.filter((m) => (m.reflection?.interest ?? 0) >= 4);
  return <article className="lab-report"><header className="lab-heading"><p className="eyebrow">CAREER DISCOVERY / EXPLORATION REPORT</p><h1>我的職涯探索報告</h1><p>產生日期：{dateLabel(at)} · 結論以現有證據為限。</p><div className="lab-actions print-hide"><button className="lab-button" onClick={printReport}>列印／另存 PDF</button><button className="lab-button secondary" onClick={() => act(() => downloadJson('career-exploration-report.json', JSON.stringify({ generatedAt: at, originalTalent: app.talentProfile, profiles: app.careerResults?.profiles, findings, lab }, null, 2)))}>匯出報告 JSON</button></div></header><section className="print-hide" aria-label="報告的下一步建議">{[...new Set(lab.evidence.map((e) => e.careerId).filter((id): id is string => Boolean(id)))].map((id) => <div key={id}><h2 className="mt-5 font-semibold">{careerTitle(id)}</h2><TakeawayPanel takeaway={careerTakeaway(id, lab.evidence)} /></div>)}</section><Panel title="01 個人天賦概況">{app.talentProfile ? <><p>原始測驗：{dateLabel(app.talentProfile.generatedAt)}。分數完全沿用原引擎，模擬與任務不會修改。</p>{[...app.talentProfile.baseTalents].sort((a, b) => b.score - a.score).slice(0, 5).map((t) => <p key={t.talentId}>{BASE_TALENTS.find((d) => d.id === t.talentId)?.nameZh}：原始訊號 {Math.round(t.score * 100)}/100；{t.confidence.level} 信心，能量 {t.energyScore === null ? '尚無資料' : t.energyScore.toFixed(2)}</p>)}<Link className="print-hide" to="/results">原始分析與完整複合天賦 →</Link></> : <p>尚未完成測驗。此報告不推造天賦或職業吻合機率。</p>}</Panel><Panel title="02 目前感興趣的方向"><p>{interests.length ? [...new Set(interests.map((m) => careerTitle(m.careerId)))].join('、') : '尚無任務後高興趣回饋，不從故事選項推定。'}</p>{interests.map((m) => <p key={m.id}>來源：任務 {m.id} · {dateLabel(m.at)} · 主觀興趣 {m.reflection!.interest}/5</p>)}</Panel><Panel title="03 已完成與進行中的模擬">{lab.lives.length ? lab.lives.map((l) => <p key={l.id}>{l.name}：{l.ending ? ENDINGS[l.ending].title : `已完成 ${l.history.length}/6 個年份`}。模擬壓力 {l.stats.stress}/100、生活平衡 {l.stats.balance}/100。來源：存檔 {l.id}。</p>) : <p>尚無模擬。</p>}</Panel><Panel title="04 工作任務證據及 05 興趣與能量觀察">{lab.missions.length ? lab.missions.map((m) => <details key={m.id} open><summary>{careerTitle(m.careerId)} · {m.score}/100 結構檢核 · {dateLabel(m.at)}</summary><p className="lab-user-text">作品：{m.input.text}</p><p>{m.reflection ? `興趣 ${m.reflection.interest}/5；成就 ${m.reflection.achievement}/5；能量 ${m.reflection.energy}/5；長期意願 ${m.reflection.willingness}/5。最困難：${m.reflection.hardest}` : '尚未補充主觀反思。'}</p><small>來源：{m.inheritedFrom ?? m.id}{m.inheritedFrom && '（從原人生繼承，不重計為新練習）'}；文字品質未由系統評估。</small></details>) : <p>尚無任務產出；請先完成一個實作。</p>}</Panel><Panel title="06 平行職涯比較">{lab.lives.length >= 2 ? <Comparison lives={lab.lives.slice(0, 3)} lab={lab} /> : <p>至少建立兩條人生即可比較；目前不足兩條，不推估比較結論。</p>}{lab.lives.length > 3 && <p>此報告先列前三條，其餘可至平行職涯比較頁選擇。</p>}</Panel><Panel title="07 一致、矛盾與待驗證的發現">{findings.map((f) => <p key={f}>{f}</p>)}<p>已確認的範圍：系統保存的選擇、結構檢核與使用者自評。尚未確認：真實工作績效、跨任務能力、長期適應與文字品質；單次高分不表示適合此職業。</p><p>原測驗對照：{app.talentProfile ? '請把相關天賦的證據信心，和各任務檢核及能量回饋一起閱讀；這些是不同測量，尚不能判定能力一致或矛盾。' : '缺少原始測驗，不進行一致性推估。'}</p></Panel><Panel title="08 下一步建議與 09 現實職涯實驗">{[...new Set([...lab.lives.map((l) => l.careerId), ...lab.missions.map((m) => m.careerId)])].map((id) => { const c = CAREER_PROFILES.find((c) => c.id === id); return c && <div key={id}><h3>{c.titleZh}</h3><p>{c.careerExperiment.description}</p><p>收集：{c.careerExperiment.evidenceToCollect.join('、')}；請一位從業者檢視作品，再記錄興趣與能量。</p><Link className="lab-text-button print-hide" to={`/experiments?career=${id}`}>進入既有短時間實驗 →</Link></div>; })}{!lab.missions.length && <p>先獨立完成一份任務並記錄感受，再選另一種工作作比較。</p>}</Panel><details className="lab-panel"><summary>全部結論來源與適用範圍</summary><EvidenceList evidence={lab.evidence} /></details><p>本報告為探索紀錄，不是心理診斷、薪資估算或成功預測。報告包含個人自述，匯出後請自行保管。</p></article>;
}
