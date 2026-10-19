import { CareerFilters, matchesLabCareer, LAB_BROWSE_CAREERS } from './CareerFilters';
import { missionTakeaway } from './guidance';
import { TakeawayPanel } from './TakeawayPanel';
import { plainWorkText, WORK_BENEFITS, MISSION_STARTS } from './plain-language';
import { useLabAction } from './actions';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { LAB_CAREERS, labCareer } from './content';
import { evaluateMission, initialMissionInput, newId, recordEvidence, validateReflection } from './engine';
import { updateLab, useLab } from './storage';
import type { MissionInput, MissionResult, Reflection } from './types';
import { Empty, Panel, careerTitle, dateLabel } from './LabLayout';

export function MissionsPage() {
  const [sector, setSector] = useState('全部工作場域'); const [query, setQuery] = useState('');
  return <><header className="lab-heading"><p className="eyebrow">CAREER MISSION / TRY THE WORK</p><h1>先做一小段，<br />再問喜不喜歡。</h1><p>{LAB_CAREERS.length} 種職業，包含老師、軍警消、醫師、律師、廚師與農業。先選你想了解的工作，試做一段，再決定是否繼續。</p></header><CareerFilters sector={sector} query={query} onSector={setSector} onQuery={setQuery} count={LAB_CAREERS.filter((c) => matchesLabCareer(c.careerId, sector, query)).length} /><p className="lab-note"><Link to="/careers#career-catalog">找不到想試的？查看完整職業目錄 →</Link></p><div className="lab-grid three">{LAB_BROWSE_CAREERS.filter((c) => matchesLabCareer(c.careerId, sector, query)).map((c) => <Panel key={c.careerId}><p className="eyebrow">{c.accent} / {c.mission.minutes} 分鐘</p><h2>{c.mission.title}</h2><p>{careerTitle(c.careerId)}</p><p>做完能幫你：{WORK_BENEFITS[c.careerId]?.learn}</p><Link className="lab-button" to={`/lab/mission/${c.careerId}`}>開始任務 ↗</Link></Panel>)}</div></>;
}
export function MissionPage() {
  const { careerId = '' } = useParams(); const [params] = useSearchParams(); const lab = useLab();
  const career = labCareer(careerId);
  const lifeId = params.get('life') ?? undefined;
  const resultId = params.get('result');
  useEffect(() => { if (resultId) window.scrollTo({ top: 0 }); }, [resultId]);
  if (!career) return <Empty>這個職業還沒有實驗室任務。</Empty>;
  if (lifeId && !lab.lives.some((l) => l.id === lifeId && l.careerId === careerId)) return <Empty>找不到對應人生。請從存檔重新進入，或在任務列表獨立開始。</Empty>;
  const result = lab.missions.find((m) => m.id === resultId && m.careerId === careerId && m.lifeId === lifeId);
  if (resultId && !result) return <Empty>找不到這份任務結果。</Empty>;
  return <><header className="lab-heading"><p className="eyebrow">CAREER MISSION / {careerTitle(careerId)} / {career.mission.minutes} 分鐘</p><h1>{career.mission.title}</h1><p>{WORK_BENEFITS[careerId]?.work}</p></header>{result ? <MissionReview key={result.id} result={result} /> : <MissionForm key={`${careerId}:${lifeId ?? 'standalone'}`} careerId={careerId} lifeId={lifeId} />}<div className="lab-actions"><Link className="lab-button secondary" to={lifeId ? `/lab/life/${lifeId}` : '/lab/missions'}>{lifeId ? '回到這段人生' : '回到任務列表'}</Link><Link className="lab-text-button" to="/lab/growth">查看成長檔案 →</Link></div></>;
}
function MissionForm({ careerId, lifeId }: { careerId: string; lifeId?: string }) {
  const lab = useLab(); const act = useLabAction(); const navigate = useNavigate();
  const key = `${careerId}:${lifeId ?? 'standalone'}`;
  const m = labCareer(careerId)!.mission;
  const intro = MISSION_STARTS[careerId];
  const [draft, setDraft] = useState<MissionInput>(() => lab.drafts[key] ?? initialMissionInput(careerId));
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (step === 0) return;
    const heading = document.querySelector<HTMLElement>('.lab-step-content h2');
    heading?.setAttribute('tabindex', '-1');
    heading?.focus({ preventScroll: true });
    heading?.scrollIntoView({ block: 'start' });
  }, [step]);
  const [submissionId] = useState(newId);
  const total = draft.allocation.reduce((a, b) => a + b, 0);
  const decisionsDone = m.decisions.every((d, i) => d.options.includes(draft.decisions[i]));
  const resourceDone = total === 100 && draft.allocation.every((n) => Number.isInteger(n) && n >= 0 && n <= 100);
  const allowedStep = decisionsDone ? resourceDone ? 3 : 1 : 0;
  function change(patch: Partial<MissionInput>) {
    const next = { ...draft, ...patch }; setDraft(next);
    act(() => updateLab((s) => ({ ...s, drafts: { ...s.drafts, [key]: next } })));
  }
  function nextStep() {
    if ((step === 0 && !decisionsDone) || (step === 1 && !resourceDone)) return;
    setStep(Math.min(3, step + 1));
  }
  function submit() {
    if (!decisionsDone || !resourceDone) { setStep(!decisionsDone ? 0 : 1); return; }
    act(() => {
      const result = evaluateMission(careerId, draft, submissionId, new Date().toISOString(), lifeId);
      updateLab((s) => {
        if (s.missions.some((r) => r.id === submissionId)) return s;
        const drafts = { ...s.drafts }; delete drafts[key];
        return recordEvidence({ ...s, missions: [...s.missions, result], drafts }, { id: `mission-${result.id}`, kind: 'mission', at: result.at, careerId, lifeId, sourceId: result.id, weight: 1, scope: '本次任務的規則檢查；不含自由文字品質', summary: `${m.title}：${result.criteria.filter((c) => c.passed).length}/${result.criteria.length} 項通過`, score: result.score }, '工作任務完成');
      });
      navigate(`/lab/mission/${careerId}?${new URLSearchParams({ ...(lifeId ? { life: lifeId } : {}), result: result.id })}`);
    });
  }
  const minimum = [...m.allocation.minimum]; minimum[0] += 100 - minimum.reduce((sum, n) => sum + n, 0);
  const plans = [
    { label: '三件事都留時間，先確保基本需要', allocation: minimum },
    { label: `大部分時間先做「${plainWorkText(m.allocation.labels[1])}」`, allocation: [10, 80, 10] },
    { label: `先做前兩件事，少留時間給「${plainWorkText(m.allocation.labels[2])}」`, allocation: [50, 45, 5] },
  ];
  return <form onSubmit={(e) => { e.preventDefault(); if (step < 3) nextStep(); else submit(); }}>
    <div className="lab-task-benefit"><strong>做完你會更清楚</strong><p>{WORK_BENEFITS[careerId]?.learn}</p><small>照直覺選做法；遇到不懂的地方，題目會給你資料，不需要先懂這個職業。</small></div>
    <nav className="lab-step-tabs" aria-label="任務步驟">{['選做法', '分時間', '排先後', '寫兩句'].map((title, i) => <button key={title} type="button" disabled={i > allowedStep} aria-current={step === i ? 'step' : undefined} onClick={() => setStep(i)}>{i + 1} {title}</button>)}</nav>
    <p className="sr-only" role="status">任務第 {step + 1} 步，共 4 步</p><div key={step} className="lab-step-content">
      {step === 0 && <><Panel title="先看眼前發生什麼"><p>{intro.brief}</p><ul className="lab-info">{intro.info.map((item) => <li key={item}>{plainWorkText(item)}</li>)}</ul></Panel><Panel title="換作是你，會怎麼處理？">{m.decisions.map((d, index) => <fieldset key={d.prompt} className="lab-fieldset"><legend>{intro.prompts[index] ?? plainWorkText(d.prompt)}</legend><div className="lab-options compact">{d.options.map((o) => <label key={o} className={draft.decisions[index] === o ? 'chosen' : ''}><input type="radio" name={`decision-${index}`} required value={o} checked={draft.decisions[index] === o} onChange={() => { const decisions = m.decisions.map((_, i) => draft.decisions[i] ?? ''); decisions[index] = o; change({ decisions }); }} />{plainWorkText(o)}</label>)}</div></fieldset>)}</Panel></>}
      {step > 0 && <details className="lab-panel"><summary>需要時再看：題目資料</summary><p>{intro.brief}</p>{intro.info.map((item) => <p key={item}>{plainWorkText(item)}</p>)}</details>}
      {step === 1 && <Panel title="你會怎麼安排時間？"><p>選一個最接近你的安排，不用自己算點數。</p><div className="lab-options">{plans.map((plan) => <button key={plan.label} type="button" aria-pressed={draft.allocation.every((n, i) => n === plan.allocation[i])} onClick={() => change({ allocation: plan.allocation })}><div><strong>{plan.label}</strong><small>{m.allocation.labels.map((label, i) => `${plainWorkText(label)} ${plan.allocation[i]} 點`).join(' / ')}</small></div></button>)}</div><details><summary>我想自己調整時間</summary><p className="lab-note">總共 100 點。{plainWorkText(m.allocation.rationale)}</p><div className="lab-grid three">{m.allocation.labels.map((label, i) => <label key={label}>{plainWorkText(label)}<input type="number" inputMode="numeric" min={0} max={100} step={1} value={draft.allocation[i]} onChange={(e) => { const allocation = [...draft.allocation]; allocation[i] = Number(e.target.value); change({ allocation }); }} /></label>)}</div></details><p role="status" className={resourceDone ? 'lab-success' : 'lab-note'}>{resourceDone ? '已選好時間安排' : `已安排 ${total} / 100 點，選上方方案即可繼續。`}</p></Panel>}
      {step === 2 && <Panel title="哪件事要先做？"><p>選出第一件事，再排後面兩件；換順位時會自動交換。</p>{draft.order.map((id, index) => <label key={index} className="lab-order"><span>{index + 1}</span><select aria-label={`第 ${index + 1} 順位`} value={id} onChange={(e) => { const order = [...draft.order]; const other = order.indexOf(e.target.value); [order[index], order[other]] = [order[other], order[index]]; change({ order }); }}>{m.priorities.map((p) => <option key={p.id} value={p.id}>{plainWorkText(p.label)}</option>)}</select></label>)}</Panel>}
      {step === 3 && <Panel title="用自己的話寫兩三句就好"><label>{WORK_BENEFITS[careerId]?.prompt ?? plainWorkText(m.output)}<textarea required minLength={20} maxLength={2000} rows={4} value={draft.text} onChange={(e) => change({ text: e.target.value })} placeholder="我會先……，因為……。接下來請……確認。" /></label><p className="lab-note">{draft.text.length} / 2000 字。口語也可以，不用寫成正式提案。</p><details><summary>想不到怎麼寫？看一個例子</summary><p>{plainWorkText(m.example)}</p></details><details><summary>寫完自己看一遍（不計分）</summary>{m.checks.map((c) => <label className="lab-check" key={c}><input type="checkbox" checked={draft.checks.includes(c)} onChange={(e) => change({ checks: e.target.checked ? [...draft.checks, c] : draft.checks.filter((v) => v !== c) })} />{plainWorkText(c)}</label>)}</details><p className="lab-note">文字會保存給你回顧；系統不替文字品質打分。</p></Panel>}
    </div><div className="lab-actions">{step > 0 && <button type="button" className="lab-button secondary" onClick={() => setStep(step - 1)}>← 上一步</button>}<button className="lab-button" disabled={(step === 0 && !decisionsDone) || (step === 1 && !resourceDone)}>{step === 3 ? '完成，看看對我有什麼用 →' : '下一步 →'}</button></div><p className="lab-note">本步內容自動保存，隨時可以離開再回來。</p>
  </form>;
}
function MissionReview({ result }: { result: MissionResult }) {
  const act = useLabAction(); const m = labCareer(result.careerId)!.mission;
  const [r, setR] = useState<Reflection>(() => result.reflection ?? { interest: 0, achievement: 0, energy: 0, willingness: 0, hardest: '' });
  useEffect(() => { if (result.reflection) document.querySelector('.lab-takeaway')?.scrollIntoView({ block: 'start', behavior: 'smooth' }); }, [result.reflection]);
  return <><TakeawayPanel takeaway={missionTakeaway(result)} />
    <div id="mission-reflection" className="scroll-mt-24"><Panel title={result.reflection ? '你留下的感受' : '最後四個感受，幫你選下一步'}><p>不用想標準答案，照做完這次任務的感覺選。</p><form onSubmit={(e) => { e.preventDefault(); act(() => { validateReflection(r); updateLab((s) => { if (s.missions.find((m) => m.id === result.id)?.reflection) return s; return recordEvidence({ ...s, missions: s.missions.map((m) => m.id === result.id ? { ...m, reflection: { ...r, hardest: r.hardest.trim() } } : m) }, { id: `reflection-${result.id}`, kind: 'reflection', at: new Date().toISOString(), careerId: result.careerId, lifeId: result.lifeId, sourceId: result.id, weight: .5, scope: '任務後的主觀感受，不是能力分數', summary: `興趣 ${r.interest}/5；成就 ${r.achievement}/5；精神 ${r.energy}/5；長期意願 ${r.willingness}/5。困難：${r.hardest}`, interest: r.interest, energy: r.energy, willingness: r.willingness }, '任務反思完成'); }); }); }}><div className="lab-grid two">{([['interest', '你喜歡做這件事嗎？', '不喜歡', '很喜歡'], ['achievement', '做完有成就感嗎？', '沒有', '很有成就感'], ['energy', '做完還有精神嗎？', '很累', '很有精神'], ['willingness', '想長期做這類工作嗎？', '不想', '很想']] as const).map(([key, label, low, high]) => <label key={key}>{label}<select required disabled={Boolean(result.reflection)} value={r[key] || ''} onChange={(e) => setR({ ...r, [key]: Number(e.target.value) })}><option value="" disabled>照感覺選</option>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n === 1 ? low : n === 5 ? high : n === 3 ? '普通' : n === 2 ? '偏低' : '偏高'}</option>)}</select></label>)}</div><label>哪裡讓你卡住？<textarea required maxLength={1000} rows={2} placeholder="例如：一直核對數字很累；沒有卡住也可以照實寫。" disabled={Boolean(result.reflection)} value={r.hardest} onChange={(e) => setR({ ...r, hardest: e.target.value })} /></label>{result.reflection ? <p className="lab-success" role="status">✓ 已保存。上方已整理好你的下一步。</p> : <button className="lab-button">看看我該繼續、練習，還是換方向 →</button>}</form></Panel></div>
    <details className="lab-panel"><summary>查看任務做得如何：{result.criteria.filter((c) => c.passed).length}/{result.criteria.length} 項通過</summary><p>{dateLabel(result.at)} · 規則檢查 {result.score}/100，與你的興趣分開記錄。</p><div className="lab-criteria">{result.criteria.map((c) => <div key={c.label}><h3>{c.passed ? '✓' : '先練這一點：'} {plainWorkText(c.label)}</h3><p>{plainWorkText(c.advice)}</p></div>)}</div><details><summary>我寫的內容與自我檢查</summary><p className="lab-user-text">{result.input.text}</p>{m.checks.map((c) => <p key={c}>{result.input.checks.includes(c) ? '✓' : '待確認'} {plainWorkText(c)}</p>)}</details><details><summary>參考做法</summary><p>{plainWorkText(m.example)}</p></details></details></>;
}
