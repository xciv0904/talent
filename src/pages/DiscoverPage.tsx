import { useState } from 'react';
import { Link } from 'react-router-dom';
import { QUICK_DISCOVERY_QUESTIONS } from '../data/questions';
import { useAppState } from '../services';

const demoOptions = [
  { id: 'A', label: '先把資訊整理清楚', talent: '模糊結構化', insight: '你可能會在混亂中先找出脈絡，讓別人知道下一步從哪裡開始。' },
  { id: 'B', label: '問大家各自在意什麼', talent: '人際洞察', insight: '你可能很自然地讀取不同立場，找到團隊真正卡住的地方。' },
  { id: 'C', label: '想出幾個不同做法', talent: '創意發想', insight: '你可能擅長打開選項，在大家只看見一條路時提出新的可能。' },
  { id: 'D', label: '直接先做一個版本看看', talent: '行動建構', insight: '你可能習慣用可見的原型推進討論，從實作回饋中快速修正。' },
] as const;

export function DiscoverPage() {
  const state = useAppState();
  const [demoChoice, setDemoChoice] = useState<(typeof demoOptions)[number] | null>(null);
  const hasProgress = state.answers.length > 0 && !state.assessmentProgress.completed;
  return <main className="overflow-hidden">
    <section className="relative isolate border-b border-ink/10">
      <div className="hero-orb hero-orb-one" aria-hidden="true" /><div className="hero-orb hero-orb-two" aria-hidden="true" />
      <div className="editorial-shell grid min-h-[calc(100svh-76px)] items-center gap-10 py-16 lg:grid-cols-[1.18fr_.82fr] lg:py-24">
        <div className="relative z-10 reveal-block">
          <p className="eyebrow">Career Discovery · Hidden Talent Finder</p>
          <h1 className="display-title mt-6 max-w-4xl text-[clamp(3rem,4.4vw,5.5rem)] leading-[.94]">你不是沒有方向，<br /><span className="text-coral">你只是還沒看見</span><br />自己的能力可以走去哪裡。</h1>
          <p className="mt-8 max-w-2xl text-base leading-8 text-ink/65 sm:text-lg">從你的日常選擇、思考方式與真實經驗中，找出你可能從沒意識到的天賦，並整理出值得你下一步探索的職涯方向。</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link to="/assessment" className="button-primary">{hasProgress ? '繼續探索自己' : '開始探索自己'} <span aria-hidden="true">↗</span></Link>
            <a href="#interactive-demo" className="button-secondary">看看它怎麼分析 <span aria-hidden="true">↓</span></a>
          </div>
          {hasProgress && <p className="mt-4 text-sm text-ink/50">已保存 {state.answers.length} / {QUICK_DISCOVERY_QUESTIONS.length} 題</p>}
        </div>
        <TalentConstellation />
      </div>
      <div className="editorial-shell absolute inset-x-0 bottom-5 hidden justify-between text-[11px] font-semibold tracking-[.18em] text-ink/35 uppercase lg:flex"><span>Scroll to discover</span><span>Behavior → Talent → Possibility</span></div>
    </section>

    <section id="interactive-demo" className="section-space bg-ink text-cream scroll-mt-24">
      <div className="editorial-shell grid gap-12 lg:grid-cols-[.7fr_1.3fr] lg:items-start">
        <div className="reveal-block"><p className="eyebrow text-mint">A small signal</p><h2 className="section-title mt-5">一個選擇，透露你如何讓事情開始。</h2><p className="mt-6 max-w-md leading-7 text-white/55">這只是互動示範，不會寫入正式 assessment，也不會影響你的結果。</p></div>
        <div className="demo-panel reveal-block">
          <p className="text-sm font-semibold text-white/45">QUESTION DEMO · 01</p><h3 className="mt-5 max-w-2xl text-2xl font-medium leading-snug sm:text-4xl">當大家不知道事情該怎麼開始時，你比較常：</h3>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">{demoOptions.map((option) => <button key={option.id} type="button" aria-pressed={demoChoice?.id === option.id} onClick={() => setDemoChoice(option)} className={`demo-option ${demoChoice?.id === option.id ? 'demo-option-active' : ''}`}><span>{option.id}</span><strong>{option.label}</strong></button>)}</div>
          <div aria-live="polite" className={`insight-reveal ${demoChoice ? 'insight-reveal-visible' : ''}`}>{demoChoice ? <><div className="insight-mark">↳</div><div><p className="text-xs font-bold tracking-[.16em] text-coral uppercase">Possible signal · {demoChoice.talent}</p><p className="mt-2 text-lg leading-7 text-white/80">{demoChoice.insight}</p></div></> : <p className="text-white/40">選一個最接近你的自然反應。</p>}</div>
        </div>
      </div>
    </section>

    <section className="section-space"><div className="editorial-shell">
      <SectionIntro number="01" eyebrow="Hidden Talent Preview" title="有些能力，因為對你太自然，所以你從沒把它當成天賦。" body="我們不只找出單一能力，也觀察它們如何組合成你獨特的工作方式。" />
      <div className="mt-14 grid gap-5 lg:grid-cols-3"><EditorialTalentCard index="01" title="混沌解構者" en="Ambiguity Structurer" body="面對資訊不全時，能先建立框架、拆出優先順序，讓事情變得可以推進。" ingredients={['模糊結構化', '分析推理', '優先排序']} tone="mint" /><EditorialTalentCard index="02" title="脈絡轉譯者" en="Context Translator" body="理解複雜內容與受眾差異，把資訊轉成對方能採取行動的語言。" ingredients={['語文推理', '溝通表達', '情緒感知']} tone="coral" /><EditorialTalentCard index="03" title="沉著解題者" en="Calm Troubleshooter" body="在壓力裡保持清晰，找出問題根因，並用精準步驟逐步排除。" ingredients={['分析推理', '彈性應變', '持續推進']} tone="lilac" /></div>
    </div></section>

    <section className="section-space border-y border-ink/10 bg-paper"><div className="editorial-shell grid gap-12 lg:grid-cols-[.78fr_1.22fr] lg:items-center">
      <SectionIntro number="02" eyebrow="Talent Map" title="不是一張把人框住的雷達圖。" body="Thinking、People、Execution 三個群集，呈現你的能力分布、組合關係與能量感受。" />
      <TalentMapPreview />
    </div></section>

    <section className="section-space"><div className="editorial-shell">
      <SectionIntro number="03" eyebrow="Career Direction Preview" title="先找到值得探索的方向，再看有哪些工作。" body="Fit 不是結論。你會看見支持理由、可能摩擦、信心程度，以及今天可以先做的低成本行動。" />
      <div className="mt-14 grid gap-5 lg:grid-cols-[1.35fr_.82fr_.82fr]"><CareerPreview featured title="使用者研究員" en="UX Researcher" score="61" reasons={['能讀懂話語背後的需求', '擅長整理模糊資訊', '喜歡探索人的行為']} friction="高密度訪談可能消耗能量" /><CareerPreview title="服務設計師" en="Service Designer" score="58" reasons={['系統思考', '協作與轉譯']} friction="專案模糊度偏高" /><CareerPreview title="學習體驗設計師" en="Learning Designer" score="55" reasons={['教學與結構化', '概念轉譯']} friction="需累積作品集" /></div>
    </div></section>

    <section className="section-space bg-coral text-ink"><div className="editorial-shell grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><div><p className="eyebrow">Surprise Career</p><h2 className="display-title mt-5 text-5xl sm:text-7xl">那個你沒想過，卻可能意外適合的方向。</h2></div><div className="surprise-card"><p className="text-sm font-bold tracking-[.16em] uppercase">Unexpected possibility · 01</p><h3 className="mt-6 text-4xl font-semibold sm:text-6xl">博物館教育企劃</h3><p className="mt-5 max-w-xl text-lg leading-8 text-ink/65">它同時需要概念轉譯、觀眾洞察與體驗設計。不是因為職稱相似，而是底層工作模式與你吻合。</p><div className="mt-8 flex flex-wrap gap-2">{['跨出原本職涯 family', 'Entry Distance · Medium', '可用 20 分鐘體驗驗證'].map((item) => <span key={item} className="rounded-full border border-ink/20 px-4 py-2 text-sm">{item}</span>)}</div></div></div></section>

    <section className="section-space"><div className="editorial-shell"><SectionIntro number="04" eyebrow="How it works" title="從真實反應，到可以驗證的下一步。" /><div className="process-line mt-16">{[['01', '回答情境', '選你自然會做的事，不選看起來最正確的答案。'], ['02', '辨認訊號', '交叉比對能力、興趣、能量、環境與價值。'], ['03', '形成天賦', '建立 Base Talent 與 Composite Talent landscape。'], ['04', '探索職涯', '比較 Career Fit、摩擦、信心與進入距離。'], ['05', '小步驗證', '用 20 分鐘職涯體驗收集真實的新證據。']].map(([n, title, body]) => <article key={n} className="process-step"><span>{n}</span><h3>{title}</h3><p>{body}</p></article>)}</div></div></section>

    <section className="section-space bg-mint"><div className="editorial-shell grid gap-12 lg:grid-cols-2"><SectionIntro number="05" eyebrow="Methodology / Trust" title="它不替你下定論，只把判斷依據攤開。" body="相同答案會得到相同結果。AI 不參與 scoring，也不會用熱門度、薪資或職缺數偷換 Career Fit。" /><div className="grid gap-3 sm:grid-cols-2">{[['Deterministic', '評分可重現'], ['Evidence-aware', '顯示支持證據'], ['Energy separate', '能力與消耗分開'], ['No fake precision', '只用 Low / Medium / High confidence']].map(([title, body]) => <div key={title} className="trust-tile"><strong>{title}</strong><span>{body}</span></div>)}</div></div></section>

    <section className="section-space"><div className="editorial-shell grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center"><div className="experiment-visual" aria-hidden="true"><span className="experiment-number">20</span><div className="experiment-note note-one">試一段核心任務</div><div className="experiment-note note-two">做一份迷你產出</div><div className="experiment-note note-three">記錄投入後的能量</div></div><SectionIntro number="06" eyebrow="20-minute career experience" title="不用立刻轉職，先花 20 分鐘試試這個方向。" body="開始前會說清楚要確認什麼，接著一步一步完成小任務，最後用真實感受決定要繼續、再試一次，或先換方向。" /></div></section>

    <section className="px-4 pb-4 sm:px-6 sm:pb-6"><div className="final-cta"><p className="eyebrow text-coral">Your next possibility</p><h2 className="display-title mx-auto mt-6 max-w-5xl text-5xl text-white sm:text-7xl lg:text-8xl">先看清你怎麼做事，<br />再決定下一步往哪裡走。</h2><Link to="/assessment" className="button-light mt-10">開始探索自己 <span>↗</span></Link></div></section>
  </main>;
}

function TalentConstellation() { return <div className="constellation reveal-block" aria-label="Thinking、People、Execution 天賦關係示意"><span className="absolute right-4 top-4 rounded-full bg-white/70 px-3 py-1 text-[10px] font-bold tracking-widest text-ink/50 uppercase">示意</span><svg viewBox="0 0 620 660" role="img"><title>天賦節點關係示意圖</title><g className="constellation-lines"><path d="M100 175L310 95L498 180L438 380L280 545L115 420Z" /><path d="M100 175L438 380M310 95L280 545M498 180L115 420" /></g><g className="node node-a"><circle cx="100" cy="175" r="62" /><text x="100" y="170">分析</text><text x="100" y="193" className="node-score">82</text></g><g className="node node-b"><circle cx="310" cy="95" r="48" /><text x="310" y="91">學習</text><text x="310" y="113" className="node-score">77</text></g><g className="node node-c"><circle cx="498" cy="180" r="70" /><text x="498" y="174">洞察</text><text x="498" y="198" className="node-score">88</text></g><g className="node node-d"><circle cx="438" cy="380" r="54" /><text x="438" y="376">轉譯</text><text x="438" y="398" className="node-score">79</text></g><g className="node node-e"><circle cx="280" cy="545" r="76" /><text x="280" y="540">結構化</text><text x="280" y="565" className="node-score">91</text></g><g className="node node-f"><circle cx="115" cy="420" r="46" /><text x="115" y="416">推進</text><text x="115" y="438" className="node-score">72</text></g></svg><div className="constellation-label label-thinking">Thinking</div><div className="constellation-label label-people">People</div><div className="constellation-label label-execution">Execution</div></div>; }
function SectionIntro({ number, eyebrow, title, body }: { number: string; eyebrow: string; title: string; body?: string }) { return <div className="reveal-block"><div className="flex items-center gap-4"><span className="section-number">{number}</span><p className="eyebrow">{eyebrow}</p></div><h2 className="section-title mt-6">{title}</h2>{body && <p className="mt-6 max-w-xl text-base leading-8 text-ink/60 sm:text-lg">{body}</p>}</div>; }
function EditorialTalentCard({ index, title, en, body, ingredients, tone }: { index: string; title: string; en: string; body: string; ingredients: string[]; tone: string }) { return <article className={`editorial-card card-${tone} reveal-block`}><div className="flex justify-between text-xs font-bold tracking-[.15em] uppercase"><span>{index}</span><span>Composite Talent</span></div><h3 className="mt-16 text-3xl font-semibold">{title}</h3><p className="mt-1 text-sm text-ink/45">{en}</p><p className="mt-5 leading-7 text-ink/65">{body}</p><div className="mt-8 flex flex-wrap gap-2">{ingredients.map((item) => <span key={item}>{item}</span>)}</div></article>; }
function TalentMapPreview() { return <div className="map-preview reveal-block"><span className="absolute right-4 top-4 rounded-full bg-white/70 px-3 py-1 text-[10px] font-bold tracking-widest text-ink/50 uppercase">示意</span><div className="map-cluster cluster-thinking"><p>THINKING</p><i className="bubble bubble-xl">結構化<br /><b>91</b></i><i className="bubble bubble-md">分析<br /><b>82</b></i><i className="bubble bubble-sm">學習<br /><b>77</b></i></div><div className="map-cluster cluster-people"><p>PEOPLE</p><i className="bubble bubble-lg">洞察<br /><b>88</b></i><i className="bubble bubble-sm">轉譯<br /><b>79</b></i></div><div className="map-cluster cluster-execution"><p>EXECUTION</p><i className="bubble bubble-md">推進<br /><b>72</b></i><i className="bubble bubble-sm">精準<br /><b>68</b></i></div></div>; }
function CareerPreview({ title, en, score, reasons, friction, featured = false }: { title: string; en: string; score: string; reasons: string[]; friction: string; featured?: boolean }) { return <article className={`career-preview reveal-block ${featured ? 'career-preview-featured' : ''}`}><div><p className="w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-bold">{featured ? '優先探索 · 示意' : '同樣值得探索 · 示意'}</p><h3 className="mt-4 text-2xl font-semibold sm:text-3xl">{title}</h3><p className="text-sm text-ink/45">{en}</p></div><p className="mt-8 text-sm font-semibold">為什麼值得了解</p><ul className="mt-3 space-y-3">{reasons.map((reason) => <li key={reason}>↳ {reason}</li>)}</ul><div className="mt-auto pt-10"><p className="border-t border-ink/10 pt-4 text-sm text-ink/55"><b>Potential friction</b><br />{friction}</p></div><details className="mt-4 text-xs text-ink/45"><summary>查看分析依據</summary><p className="mt-2">Career Fit Index · {score} / 100。這是相對吻合指標，不是適合度百分比。</p></details></article>; }
