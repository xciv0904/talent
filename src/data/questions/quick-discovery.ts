import type {
  ChoiceQuestion,
  Question,
  QuestionOption,
  QuestionType,
  ScaleQuestion,
  TalentId,
} from '../../types';

type AbilityChoiceType = Extract<QuestionType, 'situational_choice' | 'forced_choice'>;
type ProfileChoiceType = Extract<QuestionType, 'energy' | 'interest' | 'environment' | 'values'>;

const talentOption = (talentId: TalentId, label: string, value = 1): QuestionOption => ({
  id: talentId,
  label,
  talentSignals: { [talentId]: value },
});

const energyOption = (talentId: TalentId, label: string, value: number): QuestionOption => ({
  id: talentId,
  label,
  energySignals: { [talentId]: value },
});

const RIASEC_BY_TALENT: Record<TalentId, Record<string, number>> = {
  analytical_reasoning: { investigative: 1 }, pattern_recognition: { investigative: 1 },
  quantitative_reasoning: { investigative: 0.8, conventional: 0.4 }, verbal_reasoning: { artistic: 0.7, investigative: 0.5 },
  spatial_mechanical: { realistic: 1 }, creative_ideation: { artistic: 1 }, learning_agility: { investigative: 1 },
  structuring_ambiguity: { investigative: 0.7, conventional: 0.5 }, emotional_perception: { social: 1 },
  communication: { social: 0.7, enterprising: 0.5 }, influence: { enterprising: 1 }, teaching_coaching: { social: 1 },
  coordination: { conventional: 0.6, enterprising: 0.5 }, conflict_navigation: { social: 0.8, enterprising: 0.4 },
  initiative: { enterprising: 1 }, planning: { conventional: 1 }, prioritization: { conventional: 0.8, enterprising: 0.4 },
  precision: { conventional: 1 }, adaptability: { enterprising: 0.7, realistic: 0.3 }, persistence: { conventional: 0.8, realistic: 0.3 },
};

const interestOption = (talentId: TalentId, label: string): QuestionOption => ({
  id: talentId,
  label,
  interestSignals: RIASEC_BY_TALENT[talentId],
  talentInterestSignals: { [talentId]: 1 },
});

const ENVIRONMENT_SIGNALS_BY_OPTION: Record<string, Record<string, number>> = {
  steady_pace: { pace: 0.35, repetition: 0.65 }, varied_pace: { pace: 0.75, repetition: 0.35 },
  sprint_pace: { pace: 0.95, repetition: 0.25 }, self_paced: { pace: 0.55, repetition: 0.3 },
  independent: { socialDensity: 0.25, emotionalLabor: 0.2 }, small_team: { socialDensity: 0.55, emotionalLabor: 0.4 },
  cross_functional: { socialDensity: 0.8, emotionalLabor: 0.6 }, public_facing: { socialDensity: 0.95, emotionalLabor: 0.85 },
  clear_process: { ambiguity: 0.25, structure: 0.9 }, flexible_process: { ambiguity: 0.6, structure: 0.55 },
  build_process: { ambiguity: 0.9, structure: 0.25 }, case_by_case: { ambiguity: 0.85, structure: 0.2 },
  stationary_predictable: { mobility: 0.1, risk: 0.2 }, stationary_high_stakes: { mobility: 0.1, risk: 0.85 },
  mobile_predictable: { mobility: 0.75, risk: 0.3 }, mobile_uncertain: { mobility: 0.9, risk: 0.8 },
};

const WORK_STYLE_SIGNALS_BY_OPTION: Record<string, Record<string, number>> = {
  solo_builder: { independent: 1, hands_on: 0.7 }, team_integrator: { collaborative: 1, facilitative: 0.6 },
  direction_setter: { strategic: 1, independent: 0.4 }, craft_guardian: { detail_focused: 1, hands_on: 0.5 },
};

const VALUE_SIGNALS_BY_OPTION: Record<string, Record<string, number>> = {
  mastery: { learning: 1 }, impact: { impact: 1 }, stability: { stability: 1, income: 0.65 }, autonomy: { autonomy: 1 },
  quality: { achievement: 1 }, speed: { achievement: 0.6, careerGrowth: 0.6 }, inclusion: { helpingOthers: 1 }, innovation: { creativity: 1 },
  expert_recognition: { recognition: 1 }, user_outcome: { helpingOthers: 0.7, impact: 0.8 }, team_success: { helpingOthers: 0.6, recognition: 0.5 },
  visible_ownership: { achievement: 0.8, careerGrowth: 0.7 }, work_life_fit: { workLifeBalance: 1 }, learning: { learning: 1, careerGrowth: 0.6 },
  integrity: { impact: 0.5, stability: 0.4 }, international_collaboration: { internationalExposure: 1 }, tangible_output: { achievement: 1 },
  hard_problem: { learning: 0.7, achievement: 0.7 }, people_growth: { helpingOthers: 1 }, system_improvement: { impact: 0.8, achievement: 0.6 },
};

const dimensionOption = (
  id: string,
  label: string,
  channel: 'environmentSignals' | 'workStyleSignals' | 'valueSignals',
): QuestionOption => ({
  id,
  label,
  [channel]:
    channel === 'environmentSignals'
      ? ENVIRONMENT_SIGNALS_BY_OPTION[id]
      : channel === 'workStyleSignals'
        ? WORK_STYLE_SIGNALS_BY_OPTION[id]
        : VALUE_SIGNALS_BY_OPTION[id],
});

const choice = (
  id: string,
  type: AbilityChoiceType | ProfileChoiceType,
  prompt: string,
  options: QuestionOption[],
): ChoiceQuestion => ({ id, type, prompt, required: true, selection: 'single', options });

const scaled = (
  id: string,
  type: 'behavior' | 'evidence',
  prompt: string,
  options: QuestionOption[],
): ScaleQuestion => ({
  id,
  type,
  prompt,
  description:
    type === 'behavior'
      ? '先選最接近你的行為，再評估它實際發生的頻率。'
      : '先選你最能提出實例的一項，再評估證據的具體程度。',
  required: true,
  selection: 'single',
  options,
  scale:
    type === 'behavior'
      ? { min: 1, max: 5, minLabel: '很少發生', maxLabel: '經常發生' }
      : { min: 1, max: 5, minLabel: '只有模糊印象', maxLabel: '有具體成果與他人回饋' },
});

const situationalQuestions: Question[] = [
  choice('SJT01', 'situational_choice', '一個重要專案突然卡住，但原因還不明確。你最自然會先做什麼？', [
    talentOption('analytical_reasoning', '拆開問題，逐一排除可能原因'),
    talentOption('emotional_perception', '先觀察團隊中誰最焦慮或有所保留'),
    talentOption('initiative', '先做一個低風險嘗試，讓事情重新動起來'),
    talentOption('precision', '回頭核對規格、紀錄與交付細節'),
  ]),
  choice('SJT02', 'situational_choice', '你接手一項進行到一半、資訊散落各處的工作。第一步通常是？', [
    talentOption('pattern_recognition', '比對過去紀錄，找出反覆出現的脈絡'),
    talentOption('communication', '向關係人確認各自理解與期待'),
    talentOption('planning', '整理里程碑、依賴關係與接下來的順序'),
    talentOption('adaptability', '先接住眼前最急的變化，再動態調整'),
  ]),
  choice('SJT03', 'situational_choice', '資源有限，四件事都有人主張最重要。你傾向怎麼處理？', [
    talentOption('quantitative_reasoning', '把成本、效益與風險轉成可比較數字'),
    talentOption('influence', '理解決策者在意什麼，組織一個能促成共識的主張'),
    talentOption('prioritization', '先訂判準，明確決定哪些暫時不做'),
    talentOption('persistence', '選定一條路後持續排除障礙，避免反覆改向'),
  ]),
  choice('SJT04', 'situational_choice', '面對一個從未見過的新產品概念，你最想先從哪裡理解？', [
    talentOption('verbal_reasoning', '釐清關鍵詞、假設與主張是否一致'),
    talentOption('teaching_coaching', '試著向別人解釋，從對方疑問找到理解缺口'),
    talentOption('spatial_mechanical', '畫出結構、流程或部件怎麼互相作用'),
    talentOption('creative_ideation', '探索它還能和哪些不同領域連結'),
  ]),
  choice('SJT05', 'situational_choice', '跨部門合作的需求仍很模糊，而且彼此立場不同。你會先？', [
    talentOption('learning_agility', '快速補齊陌生領域知識，先理解各方語言'),
    talentOption('structuring_ambiguity', '整理已知、未知與待決策項目'),
    talentOption('coordination', '建立角色、資訊與交付的銜接方式'),
    talentOption('conflict_navigation', '把不同立場背後的顧慮帶到同一場對話'),
  ]),
];

const forcedChoiceQuestions: Question[] = [
  choice('FC01', 'forced_choice', '如果只能選一種貢獻方式，你比較願意成為哪一種角色？', [
    talentOption('communication', '讓複雜資訊被不同對象正確理解'),
    talentOption('analytical_reasoning', '找出推論漏洞與真正原因'),
    talentOption('persistence', '在漫長阻礙中維持進度'),
    talentOption('creative_ideation', '提供團隊還沒想過的方向'),
  ]),
  choice('FC02', 'forced_choice', '時間只夠改善一件事，你會優先強化哪一部分？', [
    talentOption('precision', '成果的正確性與一致性'),
    talentOption('coordination', '角色之間的交接與同步'),
    talentOption('learning_agility', '團隊理解新工具與新知的速度'),
    talentOption('influence', '提案被關鍵人物採納的機會'),
  ]),
  choice('FC03', 'forced_choice', '兩種工作都能完成，但只能保留一種方式。你較難放棄的是？', [
    talentOption('planning', '事前排好階段與依賴'),
    talentOption('adaptability', '保留空間，依現場狀況調整'),
    talentOption('quantitative_reasoning', '用數據比較後再決定'),
    talentOption('emotional_perception', '把人的感受與未說出口需求納入判斷'),
  ]),
  choice('FC04', 'forced_choice', '在一個成熟團隊裡，你最想持續承擔哪種責任？', [
    talentOption('prioritization', '面對取捨時決定焦點'),
    talentOption('teaching_coaching', '協助別人建立能力與信心'),
    talentOption('pattern_recognition', '從持續累積的現象發現規律'),
    talentOption('initiative', '看見機會時率先展開行動'),
  ]),
  choice('FC05', 'forced_choice', '遇到定義不清又有歧見的任務，你比較相信哪種切入方式？', [
    talentOption('structuring_ambiguity', '先建立問題框架與邊界'),
    talentOption('conflict_navigation', '先處理各方真正的分歧'),
    talentOption('verbal_reasoning', '先把用詞與論述講精確'),
    talentOption('spatial_mechanical', '先用圖像或模型呈現系統關係'),
  ]),
];

const behaviorQuestions: Question[] = [
  scaled('BEH01', 'behavior', '最近三個月，別人最常因為下列哪種行為找你幫忙？', [
    talentOption('planning', '把目標拆成可執行的步驟與時程'),
    talentOption('emotional_perception', '察覺氣氛與理解他人的顧慮'),
    talentOption('analytical_reasoning', '釐清問題並判斷原因'),
    talentOption('creative_ideation', '提供替代方案或新點子'),
  ]),
  scaled('BEH02', 'behavior', '工作進行中出現變化時，哪種反應最常出現在你身上？', [
    talentOption('adaptability', '快速改變方法並維持進度'),
    talentOption('precision', '重新核對變動是否造成細節錯誤'),
    talentOption('communication', '主動讓相關人知道影響與新共識'),
    talentOption('learning_agility', '迅速補學新情況需要的知識'),
  ]),
  scaled('BEH03', 'behavior', '面對多項同時到來的任務，哪種行為最像你的日常？', [
    talentOption('prioritization', '明確排序，也接受有些事情暫不處理'),
    talentOption('coordination', '確認每個人手上的工作能順利銜接'),
    talentOption('persistence', '固定推進最關鍵的一項直到跨過障礙'),
    talentOption('quantitative_reasoning', '用工作量或影響數據估算怎麼分配'),
  ]),
  scaled('BEH04', 'behavior', '在團隊討論裡，哪一種貢獻最常由你自然做出？', [
    talentOption('influence', '組織能推動決策的理由與說法'),
    talentOption('conflict_navigation', '把對立觀點轉成可討論的分歧'),
    talentOption('teaching_coaching', '用提問幫助別人自己想清楚'),
    talentOption('verbal_reasoning', '指出語意不清或論述跳躍之處'),
  ]),
  scaled('BEH05', 'behavior', '處理陌生又複雜的事物時，你實際最常採取哪種動作？', [
    talentOption('structuring_ambiguity', '先分類資訊並界定問題'),
    talentOption('pattern_recognition', '找相似案例與重複線索'),
    talentOption('spatial_mechanical', '畫圖、拆解或實際操作來理解'),
    talentOption('initiative', '用小規模行動取得第一手資訊'),
  ]),
];

const evidenceQuestions: Question[] = [
  scaled('EVD01', 'evidence', '回想你最近做成的一件事，哪一類貢獻最有具體證據？', [
    talentOption('analytical_reasoning', '找出關鍵原因，讓問題不再反覆'),
    talentOption('coordination', '讓多人或多環節準時銜接'),
    talentOption('adaptability', '在重大變更後仍達成目標'),
    talentOption('teaching_coaching', '讓另一個人能獨立完成原本不會的事'),
  ]),
  scaled('EVD02', 'evidence', '哪一項成果最能由作品、數據或他人回饋證明？', [
    talentOption('quantitative_reasoning', '用資料改善判斷或成果'),
    talentOption('communication', '降低誤解，讓資訊被正確採用'),
    talentOption('initiative', '在沒人指派前開啟一項有價值的行動'),
    talentOption('precision', '及早發現錯誤並守住品質'),
  ]),
  scaled('EVD03', 'evidence', '在過去一年裡，哪種能力曾被不同情境重複驗證？', [
    talentOption('pattern_recognition', '從不同事件看出共同規律'),
    talentOption('influence', '讓原本不同意的人願意採取行動'),
    talentOption('planning', '以清楚安排讓複雜任務如期完成'),
    talentOption('persistence', '經過多次受阻仍完成重要成果'),
  ]),
  scaled('EVD04', 'evidence', '哪一類成果最容易讓你提出完整的前因、做法與結果？', [
    talentOption('verbal_reasoning', '釐清論述，使文件或決策更嚴謹'),
    talentOption('emotional_perception', '看出未明說需求，改善互動或服務'),
    talentOption('prioritization', '透過取捨把有限資源放到高影響處'),
    talentOption('creative_ideation', '把新構想發展成被使用的方案'),
  ]),
  scaled('EVD05', 'evidence', '面對陌生或混亂場景，哪種成果最有實例可支持？', [
    talentOption('spatial_mechanical', '理解或改善實體結構、配置或機制'),
    talentOption('learning_agility', '快速學會並實際運用陌生知識'),
    talentOption('structuring_ambiguity', '把未定義問題整理成可執行框架'),
    talentOption('conflict_navigation', '讓僵持的不同立場重新展開合作'),
  ]),
];

const positiveEnergyQuestions: Question[] = [
  choice('ENG01', 'energy', '完成一段專注工作後，哪一種任務最常讓你還想繼續？', [
    energyOption('analytical_reasoning', '追查問題真正的原因', 1),
    energyOption('communication', '把資訊整理後說給不同人理解', 1),
    energyOption('planning', '安排接下來的步驟與時程', 1),
    energyOption('creative_ideation', '延伸更多不同構想', 1),
  ]),
  choice('ENG02', 'energy', '哪一種投入即使花了不少時間，通常仍會帶給你精神？', [
    energyOption('pattern_recognition', '從大量材料中找出規律', 1),
    energyOption('emotional_perception', '理解一個人真正的感受與需要', 1),
    energyOption('initiative', '從零開始推動一件新事情', 1),
    energyOption('precision', '反覆檢查並把品質修到穩定', 1),
  ]),
  choice('ENG03', 'energy', '忙碌一天中，哪種工作片段最可能讓你恢復動力？', [
    energyOption('quantitative_reasoning', '用數據找到清楚判斷', 1),
    energyOption('teaching_coaching', '看見別人因你的引導而突破', 1),
    energyOption('prioritization', '清楚決定焦點並放下次要項目', 1),
    energyOption('adaptability', '臨場調整並解開突發狀況', 1),
  ]),
  choice('ENG04', 'energy', '如果能自由選擇下一段工作，你較期待哪一種？', [
    energyOption('verbal_reasoning', '琢磨文字、論點與精確表達', 1),
    energyOption('influence', '設計能爭取支持的提案', 1),
    energyOption('coordination', '讓不同人與資源順利合作', 1),
    energyOption('persistence', '把一個長期挑戰繼續推過關', 1),
  ]),
  choice('ENG05', 'energy', '處理複雜問題時，哪種活動較容易讓你進入專注狀態？', [
    energyOption('spatial_mechanical', '操作模型、空間或實體系統', 1),
    energyOption('learning_agility', '快速吸收完全陌生的知識', 1),
    energyOption('structuring_ambiguity', '把混亂資訊整理成架構', 1),
    energyOption('conflict_navigation', '協助立場不同的人找到前進方式', 1),
  ]),
];

const drainingEnergyQuestions: Question[] = [
  choice('ENG06', 'energy', '如果一整週主要都在做下列工作，哪一項最容易讓你耗盡？', [
    energyOption('analytical_reasoning', '持續診斷原因與驗證假設', -1),
    energyOption('communication', '頻繁對不同對象說明與回應', -1),
    energyOption('planning', '不斷維護計畫、時程與依賴', -1),
    energyOption('creative_ideation', '持續產生尚未驗證的新方向', -1),
  ]),
  choice('ENG07', 'energy', '即使你做得到，哪種責任做久了最需要獨處或休息？', [
    energyOption('pattern_recognition', '長時間比對訊息與尋找規律', -1),
    energyOption('emotional_perception', '持續承接他人的情緒與需要', -1),
    energyOption('initiative', '一直負責率先開局與承擔不確定性', -1),
    energyOption('precision', '長時間保持零失誤與細節警覺', -1),
  ]),
  choice('ENG08', 'energy', '在高壓期間，哪類工作最可能額外消耗你的能量？', [
    energyOption('quantitative_reasoning', '密集處理數據與精算差異', -1),
    energyOption('teaching_coaching', '反覆配合不同人的學習速度', -1),
    energyOption('prioritization', '持續替多方做困難取捨', -1),
    energyOption('adaptability', '頻繁改變方向與工作節奏', -1),
  ]),
  choice('ENG09', 'energy', '哪種會議任務即使表現不差，結束後仍最容易疲累？', [
    energyOption('verbal_reasoning', '逐字確認定義與論述精確性', -1),
    energyOption('influence', '說服關鍵人物改變決定', -1),
    energyOption('coordination', '同時追蹤多人承諾與交接', -1),
    energyOption('persistence', '在反覆受阻後繼續維持士氣', -1),
  ]),
  choice('ENG10', 'energy', '面對下列複雜工作，哪一種最容易讓你覺得腦力透支？', [
    energyOption('spatial_mechanical', '持續想像多個部件與空間關係', -1),
    energyOption('learning_agility', '短時間吸收大量陌生概念', -1),
    energyOption('structuring_ambiguity', '長時間替不清楚的問題建立框架', -1),
    energyOption('conflict_navigation', '反覆處理高張力的人際分歧', -1),
  ]),
];

const interestQuestions: Question[] = [
  choice('INT01', 'interest', '如果不考慮目前能力，你最想深入探索哪一類活動？', [
    interestOption('analytical_reasoning', '拆解複雜問題與驗證原因'),
    interestOption('emotional_perception', '理解人的行為、情緒與需求'),
    interestOption('initiative', '把尚不存在的事情啟動起來'),
    interestOption('precision', '建立可靠、精確且一致的品質'),
  ]),
  choice('INT02', 'interest', '哪一類內容最容易讓你主動多看一些資料？', [
    interestOption('pattern_recognition', '趨勢、案例與隱藏規律'),
    interestOption('communication', '訊息如何被理解與傳播'),
    interestOption('planning', '複雜目標如何被組織與完成'),
    interestOption('adaptability', '人在變動中如何即時調整'),
  ]),
  choice('INT03', 'interest', '如果能旁聽一場實作工作坊，你會先選？', [
    interestOption('quantitative_reasoning', '資料分析與決策'),
    interestOption('influence', '提案、談判與行為影響'),
    interestOption('prioritization', '策略取捨與資源配置'),
    interestOption('persistence', '長期專案與韌性訓練'),
  ]),
  choice('INT04', 'interest', '哪一種問題最容易引發你的好奇？', [
    interestOption('verbal_reasoning', '語言如何改變理解與推論'),
    interestOption('teaching_coaching', '人如何學會與突破卡點'),
    interestOption('spatial_mechanical', '結構、空間與機制如何運作'),
    interestOption('creative_ideation', '不同概念如何形成新可能'),
  ]),
  choice('INT05', 'interest', '你最想觀察哪一種高手如何工作？', [
    interestOption('learning_agility', '快速跨入陌生領域的人'),
    interestOption('structuring_ambiguity', '能替混亂問題建立框架的人'),
    interestOption('coordination', '能讓複雜合作順暢的人'),
    interestOption('conflict_navigation', '能帶領高衝突對話的人'),
  ]),
];

const environmentQuestions: Question[] = [
  choice('ENV01', 'environment', '在同樣有意義的工作中，你更希望日常節奏接近哪一種？', [
    dimensionOption('steady_pace', '可預期、能長時間專注的節奏', 'environmentSignals'),
    dimensionOption('varied_pace', '任務多變、需要頻繁切換的節奏', 'environmentSignals'),
    dimensionOption('sprint_pace', '短期高強度、完成後明確收尾', 'environmentSignals'),
    dimensionOption('self_paced', '能依自己的狀態安排快慢', 'environmentSignals'),
  ]),
  choice('ENV02', 'environment', '你較容易穩定發揮的協作方式是？', [
    dimensionOption('independent', '大部分獨立完成，必要時同步', 'environmentSignals'),
    dimensionOption('small_team', '與固定的小團隊密切合作', 'environmentSignals'),
    dimensionOption('cross_functional', '經常串聯不同專業與部門', 'environmentSignals'),
    dimensionOption('public_facing', '大量與客戶、社群或外部對象互動', 'environmentSignals'),
  ]),
  choice('ENV03', 'environment', '面對工作規則，你偏好的狀態是？', [
    dimensionOption('clear_process', '流程與標準清楚，能持續精進', 'environmentSignals'),
    dimensionOption('flexible_process', '有基本方向，但方法可自行調整', 'environmentSignals'),
    dimensionOption('build_process', '規則尚未建立，可以從零設計', 'environmentSignals'),
    dimensionOption('case_by_case', '依每個情境重新判斷', 'environmentSignals'),
  ]),
  choice('ENV04', 'environment', '哪種工作場景最接近你願意長期承受的狀態？', [
    dimensionOption('stationary_predictable', '固定地點，風險與變化較可預期', 'environmentSignals'),
    dimensionOption('stationary_high_stakes', '固定地點，但需要承擔高風險判斷', 'environmentSignals'),
    dimensionOption('mobile_predictable', '經常移動，但任務和風險相對明確', 'environmentSignals'),
    dimensionOption('mobile_uncertain', '經常移動，也需要處理未知與現場風險', 'environmentSignals'),
  ]),
  choice('ENV05', 'environment', '如果成果同樣重要，你更自然採用哪種貢獻模式？', [
    dimensionOption('solo_builder', '獨立把想法做成可運作成果', 'workStyleSignals'),
    dimensionOption('team_integrator', '串聯團隊並協助大家共同前進', 'workStyleSignals'),
    dimensionOption('direction_setter', '先看全局並決定方向與取捨', 'workStyleSignals'),
    dimensionOption('craft_guardian', '深入細節並把成果品質磨好', 'workStyleSignals'),
  ]),
];

const valueQuestions: Question[] = [
  choice('VAL01', 'values', '兩份工作條件相近時，哪一項最可能成為你的決定因素？', [
    dimensionOption('mastery', '能長期累積專業深度', 'valueSignals'),
    dimensionOption('impact', '成果能對人或社會產生明顯影響', 'valueSignals'),
    dimensionOption('stability', '收入與生活安排較可預期', 'valueSignals'),
    dimensionOption('autonomy', '能自主決定方法與方向', 'valueSignals'),
  ]),
  choice('VAL02', 'values', '如果一個專案只能保住一項特色，你比較想保留？', [
    dimensionOption('quality', '成果的品質與可信度', 'valueSignals'),
    dimensionOption('speed', '快速產生可見進展', 'valueSignals'),
    dimensionOption('inclusion', '不同人的需求都被看見', 'valueSignals'),
    dimensionOption('innovation', '嘗試真正不同的新做法', 'valueSignals'),
  ]),
  choice('VAL03', 'values', '哪一種肯定最容易讓你覺得工作值得？', [
    dimensionOption('expert_recognition', '專業能力受到信任', 'valueSignals'),
    dimensionOption('user_outcome', '使用者真的因此變好', 'valueSignals'),
    dimensionOption('team_success', '整個團隊因你的貢獻更成功', 'valueSignals'),
    dimensionOption('visible_ownership', '你完整主導並留下清楚成果', 'valueSignals'),
  ]),
  choice('VAL04', 'values', '面對升遷機會，你最不希望犧牲的是？', [
    dimensionOption('work_life_fit', '與生活需求相容的安排', 'valueSignals'),
    dimensionOption('learning', '持續學習與成長的空間', 'valueSignals'),
    dimensionOption('integrity', '做法與個人原則一致', 'valueSignals'),
    dimensionOption('international_collaboration', '與不同文化或國際夥伴合作', 'valueSignals'),
  ]),
  choice('VAL05', 'values', '回顧一段理想工作經驗，你最希望它留下什麼？', [
    dimensionOption('tangible_output', '可被使用或看見的具體成果', 'valueSignals'),
    dimensionOption('hard_problem', '一個原本很困難的問題被解開', 'valueSignals'),
    dimensionOption('people_growth', '有人因這段合作而成長', 'valueSignals'),
    dimensionOption('system_improvement', '建立比以前更好的運作方式', 'valueSignals'),
  ]),
];

export const QUICK_DISCOVERY_QUESTIONS = [
  ...situationalQuestions,
  ...forcedChoiceQuestions,
  ...behaviorQuestions,
  ...evidenceQuestions,
  ...positiveEnergyQuestions,
  ...drainingEnergyQuestions,
  ...interestQuestions,
  ...environmentQuestions,
  ...valueQuestions,
] as const satisfies readonly Question[];
