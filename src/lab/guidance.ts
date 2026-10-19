import { CAREER_PROFILES } from '../data/careers';
import { labCareer } from './content';
import { plainWorkText, WORK_BENEFITS } from './plain-language';
import type { Evidence, Life, MissionResult } from './types';

export interface CareerTakeaway {
  careerId: string; status: 'task' | 'reflect' | 'try' | 'practice' | 'pause' | 'compare';
  headline: string; benefit: string; reasons: string[];
  next: { label: string; to: string }; evidenceIds: string[];
}
export function careerTakeaway(careerId: string, evidence: Evidence[]): CareerTakeaway {
  const items = evidence.filter((e) => e.careerId === careerId);
  const tasks = items.filter((e) => e.kind === 'mission' && typeof e.score === 'number').reverse().sort((a, b) => b.at.localeCompare(a.at));
  const task = tasks[0];
  const feeling = task && items.filter((e) => e.kind === 'reflection' && e.sourceId === task.sourceId && typeof e.interest === 'number' && typeof e.energy === 'number').sort((a, b) => b.at.localeCompare(a.at))[0];
  const label = CAREER_PROFILES.find((c) => c.id === careerId)?.titleZh ?? careerId;
  const work = WORK_BENEFITS[careerId];
  const missionTo = `/lab/mission/${careerId}${task?.lifeId ? `?life=${encodeURIComponent(task.lifeId)}` : ''}`;
  const resultTo = task ? `/lab/mission/${careerId}?${new URLSearchParams({ result: task.sourceId, ...(task.lifeId ? { life: task.lifeId } : {}) })}` : missionTo;
  const base = { careerId, evidenceIds: [task?.id, feeling?.id].filter((id): id is string => Boolean(id)) };
  if (!task) return { ...base, status: 'task', headline: `先試一次${label}的工作，再決定要不要繼續`, benefit: work?.learn ?? '先取得一份實際產出，才知道自己對這類工作有什麼感受。', reasons: ['還沒有這份工作的任務產出，先用一次試做補上。'], next: { label: '試一個工作任務', to: missionTo } };
  const resultReason = `這次任務的規則檢查通過 ${task.score}/100；這只說明題目中的工作判斷，不代表整體職業能力。`;
  if (!feeling) return { ...base, status: 'reflect', headline: '你已完成任務，現在補上「喜不喜歡做」', benefit: '把做得如何和做完的感受分開，才能決定下一步要練習，還是換方向。', reasons: [resultReason, '這份任務還沒有興趣和精神負荷的回饋，先不替你猜。'], next: { label: '回答任務後的感受', to: `${resultTo}#mission-reflection` } };
  const interest = feeling.interest!; const energy = feeling.energy!;
  const reasons = [resultReason, `你對這次工作給的興趣是 ${interest}/5，做完的精神是 ${energy}/5${feeling.willingness !== undefined ? `，長期意願是 ${feeling.willingness}/5` : ''}。`];
  if (interest <= 2) return { ...base, status: 'pause', headline: '先把這類工作排到後面', benefit: '你不用因為做得出來，就逼自己把它當成職涯首選。把探索時間先留給更想做的工作。', reasons, next: { label: '換一種工作試試', to: '/lab/missions' } };
  if (feeling.willingness !== undefined && feeling.willingness <= 2) return { ...base, status: 'pause', headline: '先別把它當成長期工作', benefit: '你對這次活動有興趣，但不想長期做。先保留為短期體驗，把找工作的時間放到更願意持續的方向。', reasons, next: { label: '換一種工作比較', to: '/lab/missions' } };
  if (energy <= 2) return { ...base, status: 'pause', headline: interest >= 4 ? '有興趣，但先別加大投入：這次做完很累' : '先別加大投入，先看工作節奏能不能承受', benefit: '找下一份工作時，先問每天做多久、是否輪班、有沒有支援；換個節奏再試，別只看職稱。', reasons, next: { label: '用短時間實驗再看精神負荷', to: `/experiments?career=${careerId}` } };
  if (interest >= 4 && task.score! < 70) return { ...base, status: 'practice', headline: '保留這個方向，先補練習', benefit: '你有興趣，現在需要的是弄懂本次沒通過的工作判斷，再練一次，不用先否定整個方向。', reasons, next: { label: '看沒通過的地方，再練一次', to: missionTo } };
  if (interest >= 4 && task.score! >= 70) return { ...base, status: 'try', headline: '把這個方向列為下一個實際體驗', benefit: `這次你完成了主要判斷，也願意投入。下一步去做一次${work?.work ?? '真實工作'}的短體驗，或請從業者看作品。`, reasons, next: { label: '開始 20 分鐘實際體驗', to: `/experiments?career=${careerId}` } };
  return { ...base, status: 'compare', headline: '下一步先比較另一種工作', benefit: '這次沒有明確吸引你，不必勉強選定。換一種工作做完，再比較哪個更想繼續、哪個比較累。', reasons, next: { label: '選另一個工作任務', to: '/lab/missions' } };
}
export function missionTakeaway(result: MissionResult): CareerTakeaway {
  const evidence: Evidence[] = [{ id: `mission-${result.id}`, kind: 'mission', at: result.at, careerId: result.careerId, sourceId: result.id, lifeId: result.lifeId, scope: '本次任務', weight: 1, summary: '', score: result.score }];
  if (result.reflection) evidence.push({ id: `reflection-${result.id}`, kind: 'reflection', at: result.at, careerId: result.careerId, sourceId: result.id, scope: '本次主觀感受', weight: .5, summary: '', interest: result.reflection.interest, energy: result.reflection.energy, willingness: result.reflection.willingness });
  const takeaway = careerTakeaway(result.careerId, evidence);
  if (takeaway.status === 'practice') {
    const firstGap = result.criteria.find((c) => !c.passed);
    if (firstGap) takeaway.benefit = `先練這一點：${plainWorkText(firstGap.advice)}`;
  }
  if (result.inheritedFrom) takeaway.evidenceIds = takeaway.evidenceIds.map((id) => id.replace(result.id, result.inheritedFrom!));
  return takeaway;
}
export function lifeTakeaway(life: Life, missions: MissionResult[]) {
  const counts = { specialist: 0, leader: 0, flexible: 0 };
  life.history.forEach((h) => { counts[h.choice.id]++; });
  const ranked = (Object.entries(counts) as [keyof typeof counts, number][]).sort((a, b) => b[1] - a[1]);
  const descriptions = {
    specialist: { title: '先把事情弄懂，再把品質做好', use: '看職缺時先找能學技術、累積作品的工作，並問清楚學習支援和趕工頻率。' },
    leader: { title: '找人一起解決，也願意負責協調', use: '看職缺時先了解每天要協調多少人、負責哪些決定，以及遇到問題誰會支援你。' },
    flexible: { title: '守住工作範圍，留下自己的生活', use: '看職缺時先確認班表、加班、工作界線和收入是否穩定；別只看「彈性」兩個字。' },
  };
  const top = descriptions[ranked[0][0]];
  const tied = ranked[0][1] === ranked[1][1];
  const mission = [...missions].filter((m) => m.lifeId === life.id).sort((a, b) => b.at.localeCompare(a.at))[0];
  return {
    headline: life.history.length === 0 ? '先選一個做法，看看你在意的取捨' : tied ? `你同時在意「${top.title}」與「${descriptions[ranked[1][0]].title}」` : `你的選擇偏向「${top.title}」`,
    observed: `這 ${life.history.length} 次選擇中，${ranked[0][1]} 次偏向這種做法。這是本次情境裡的偏好，不是能力評分。`,
    benefit: top.use,
    next: mission ? missionTakeaway(mission) : careerTakeaway(life.careerId, []),
    skills: labCareer(life.careerId)?.skills ?? [],
  };
}
