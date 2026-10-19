import type {
  ChoiceQuestion,
  Question,
  QuestionOption,
  QuestionType,
  ScenarioDomain,
  ScaleQuestion,
  TalentId,
} from '../../types';

type AbilityChoiceType = Extract<QuestionType, 'situational_choice' | 'forced_choice'>;
type ProfileChoiceType = Extract<QuestionType, 'energy' | 'interest' | 'environment' | 'values'>;
interface ScenarioDefinition {
  domain: ScenarioDomain;
  scenario: string;
  decisionPoint: string;
  contextRequirements?: 'universal' | 'common_activity';
}

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
  definition: ScenarioDefinition,
  prompt: string,
  options: QuestionOption[],
): ChoiceQuestion => ({
  id,
  type,
  scenarioDomain: definition.domain,
  contextRequirements: definition.contextRequirements ?? 'universal',
  scenario: definition.scenario,
  decisionPoint: definition.decisionPoint,
  prompt,
  required: true,
  selection: 'single',
  options,
});

const energyComparison = (
  id: string,
  definition: ScenarioDefinition,
  options: QuestionOption[],
): ChoiceQuestion => ({
  ...choice(
    id,
    'energy',
    definition,
    '請依序選兩項：先選做完仍較有精神的，再選做久最消耗的。',
    options,
  ),
  description: '第一個選擇代表「較有精神」，第二個選擇代表「較消耗」。兩項不能相同。',
  selection: 'multiple',
  maxSelections: 2,
});

const scaled = (
  id: string,
  type: 'behavior' | 'evidence',
  definition: ScenarioDefinition,
  prompt: string,
  options: QuestionOption[],
): ScaleQuestion => ({
  id,
  type,
  scenarioDomain: definition.domain,
  contextRequirements: definition.contextRequirements ?? 'universal',
  scenario: definition.scenario,
  decisionPoint: definition.decisionPoint,
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
  choice('SJT01', 'situational_choice', { domain: 'group_activity', scenario: '你和朋友布置活動，做到一半卡住了。大家都不知道哪裡出錯。', decisionPoint: '卡住且原因不明時的第一個行動' }, '你最自然會先做什麼？', [
    talentOption('analytical_reasoning', '一項一項檢查，找出出錯原因'),
    talentOption('emotional_perception', '留意朋友是不是有顧慮沒說'),
    talentOption('initiative', '先試一個可以改回來的小做法'),
    talentOption('precision', '核對要求和細節，看有沒有漏掉'),
  ]),
  choice('SJT02', 'situational_choice', { domain: 'unfamiliar_task', scenario: '你幫朋友準備搬家。東西包了一半，清單和標籤卻散落各處。', decisionPoint: '接手進行中且資訊分散的事情' }, '你比較可能先做什麼？', [
    talentOption('pattern_recognition', '比對清單，找出重複和矛盾'),
    talentOption('communication', '問大家做完了什麼、還缺什麼'),
    talentOption('planning', '看哪些事得先做，再排順序'),
    talentOption('adaptability', '先找出急用物品，邊做邊調整'),
  ]),
  choice('SJT03', 'situational_choice', { domain: 'choice_decision', scenario: '你和朋友安排一日遊。四個活動玩不完，大家想去的地方也不同。', decisionPoint: '在有限時間內取捨多個合理選項' }, '你最自然會先怎麼做？', [
    talentOption('quantitative_reasoning', '列出時間、費用和距離來比較'),
    talentOption('influence', '問大家在意什麼，提出能接受的安排'),
    talentOption('prioritization', '先訂出最重要的條件，刪掉次要行程'),
    talentOption('persistence', '選定可行安排，把困難一一解決'),
  ]),
  choice('SJT04', 'situational_choice', { domain: 'learning', scenario: '你拿到一組組裝材料，說明書卻沒寫完整步驟。', decisionPoint: '學習一個缺少完整說明的陌生系統' }, '你會先用哪個方法弄懂？', [
    talentOption('verbal_reasoning', '讀懂說明中的用詞和前後意思'),
    talentOption('teaching_coaching', '講給朋友聽，從他的疑問找出不懂處'),
    talentOption('spatial_mechanical', '畫出零件位置，看它們怎麼配合'),
    talentOption('creative_ideation', '聯想熟悉的東西，試想不同用法'),
  ]),
  choice('SJT05', 'situational_choice', { domain: 'group_activity', scenario: '你們要辦分享活動，主題選好了，卻還沒決定要講什麼、準備多少。', decisionPoint: '共同活動的內容與完成標準不清時的第一步' }, '你最自然會先做什麼？', [
    talentOption('learning_agility', '先查資料，弄懂陌生的內容'),
    talentOption('structuring_ambiguity', '分清楚已知、未知和待決定的事'),
    talentOption('coordination', '分清誰做什麼、怎麼接下去'),
    talentOption('conflict_navigation', '請大家說出不同意見背後的顧慮'),
  ]),
];

const behaviorQuestions: Question[] = [
  scaled('BEH01', 'behavior', { domain: 'planning', scenario: '朋友要辦聚會，列好了準備清單，卻不知道該先做哪一件。', decisionPoint: '協助別人把未排序的準備事項變得可執行' }, '哪個行動最接近你會先做的事？', [
    talentOption('planning', '拆成步驟，排好先後順序'),
    talentOption('emotional_perception', '先聽朋友沒說出口的擔心'),
    talentOption('analytical_reasoning', '找出安排卡住的主要原因'),
    talentOption('creative_ideation', '提出幾種不同做法讓朋友挑'),
  ]),
  scaled('BEH02', 'behavior', { domain: 'unexpected_change', scenario: '你做飯做到一半，才發現一道菜的重要材料用完了。', decisionPoint: '執行中出現單一關鍵變化時的第一個反應' }, '哪個行動最接近你會先做的事？', [
    talentOption('adaptability', '用現有材料換個做法，繼續完成'),
    talentOption('precision', '核對替代材料的份量和安全細節'),
    talentOption('communication', '告訴大家菜色會變，確認能否接受'),
    talentOption('learning_agility', '查清楚替代材料怎麼用再繼續'),
  ]),
  scaled('BEH03', 'behavior', { domain: 'limited_time', scenario: '捐贈物品還沒分類、清點、裝箱，取件車三十分鐘後就到。', decisionPoint: '有限時間內處理三項同時未完成的事' }, '如果是你在場，哪個行動最接近你會做的事？', [
    talentOption('prioritization', '決定先做什麼，必要時放下次要事項'),
    talentOption('coordination', '安排分工，讓分類、清點、裝箱接得上'),
    talentOption('persistence', '先專心突破最卡的一件事'),
    talentOption('quantitative_reasoning', '估算每件要多久，再分配時間'),
  ]),
  scaled('BEH04', 'behavior', { domain: 'social_interaction', scenario: '你們要決定晚上幾點後不再製造噪音。兩個人各有堅持，討論沒有進展。', decisionPoint: '兩個人堅持不同安排且討論停滯時的第一個行動' }, '你最可能先做什麼？', [
    talentOption('influence', '說明不同時間的影響，提出大家能接受的時間'),
    talentOption('conflict_navigation', '把時間、例外情況分開談'),
    talentOption('teaching_coaching', '分別問兩人最在意什麼，幫他們說清楚'),
    talentOption('verbal_reasoning', '找出雙方說法不清楚或前後不通的地方'),
  ]),
  scaled('BEH05', 'behavior', { domain: 'information', scenario: '你要組裝置物架，四份說明有重複，也有互相矛盾的地方。', decisionPoint: '組裝資訊重複且矛盾時的第一個處理動作' }, '你最可能先做什麼？', [
    talentOption('structuring_ambiguity', '把說明分類，標出確定和不確定處'),
    talentOption('pattern_recognition', '比對重複內容，找出共同規律'),
    talentOption('spatial_mechanical', '畫出零件和步驟之間的關係'),
    talentOption('initiative', '先試一個能改回來的步驟，看結果'),
  ]),
];

const evidenceQuestions: Question[] = [
  scaled('EVD01', 'evidence', { domain: 'choice_decision', scenario: '回想最近半年，有哪件事你說得出自己做了什麼、結果如何。', decisionPoint: '從近期經驗中選出能具體說明過程與結果的一項貢獻' }, '你最能清楚說明哪一種經驗？', [
    talentOption('analytical_reasoning', '我找到反覆出錯的原因，改善後不再發生'),
    talentOption('coordination', '我安排分工或步驟，讓事情按時接上'),
    talentOption('adaptability', '我遇到突然變動，換做法後仍完成'),
    talentOption('teaching_coaching', '我示範和給回饋，讓別人學會自己做'),
  ]),
  scaled('EVD02', 'evidence', { domain: 'quality_check', scenario: '回想你做過的事，哪件留有成品、數字、紀錄或別人的回饋。', decisionPoint: '選出最能用成品數字紀錄或回饋核對的一項成果' }, '哪一種結果，你最容易拿出具體證明？', [
    talentOption('quantitative_reasoning', '我用前後數字支持自己的判斷'),
    talentOption('communication', '我換個說法，讓對方理解並採取行動'),
    talentOption('initiative', '我主動開始處理，留下能用的成果'),
    talentOption('precision', '我在使用前發現錯誤，修正後避免影響'),
  ]),
  scaled('EVD03', 'evidence', { domain: 'individual_problem', scenario: '回想最近一年，有哪種做法你在不同事情上用過至少兩次。', decisionPoint: '選出曾在不同場合重複出現並產生相近結果的行為' }, '哪種做法，你想得到至少兩次經驗？', [
    talentOption('pattern_recognition', '我看出不同事件的規律，用來判斷後續變化'),
    talentOption('influence', '我調整說法，讓不同意的人願意行動'),
    talentOption('planning', '我安排步驟和時間，讓複雜的事按期完成'),
    talentOption('persistence', '我受阻後換方法繼續，最後完成目標'),
  ]),
  scaled('EVD04', 'evidence', { domain: 'helping_someone', scenario: '回想一次你讓事情變順利的經驗，當時你做了什麼。', decisionPoint: '選出能具體說明問題做法與改變的一段改善經驗' }, '你最能清楚說明哪一種經驗？', [
    talentOption('verbal_reasoning', '我改清楚前後不通的說法，讓判斷更可靠'),
    talentOption('emotional_perception', '我察覺沒說出口的顧慮，改善了互動'),
    talentOption('prioritization', '我放下次要事情，把時間用在關鍵處'),
    talentOption('creative_ideation', '我提出新做法，修改後真的被採用'),
  ]),
  scaled('EVD05', 'evidence', { domain: 'practical_task', scenario: '回想你遇到不熟悉、又有點混亂的事情時，曾做過什麼。', decisionPoint: '從生活經驗中選出能具體說明的一項實際貢獻' }, '你最能清楚說明哪一種經驗？', [
    talentOption('spatial_mechanical', '我調整物品、空間或動線，讓使用更順'),
    talentOption('learning_agility', '我很快學會陌生方法，並且正確用上'),
    talentOption('structuring_ambiguity', '我把混亂的問題分組，排出能跟著做的順序'),
    talentOption('conflict_navigation', '我釐清爭議，讓僵持的人重新合作'),
  ]),
];

const energyQuestions: Question[] = [
  energyComparison('ENG01', { domain: 'planning', scenario: '置物區整理好了，接下來每天還要花半小時維持。假設四件事你都做得到。', decisionPoint: '比較不同後續活動帶來的持續能量與消耗' }, [
    energyOption('analytical_reasoning', '追查物品常放錯的原因', 1),
    energyOption('communication', '寫出新來的人也看得懂的說明', 1),
    energyOption('planning', '安排整理步驟和檢查時間', 1),
    energyOption('creative_ideation', '畫出不同的收納方式', 1),
  ]),
  energyComparison('ENG02', { domain: 'helping_someone', scenario: '募集活動還有四天，每天要重複做這些事。假設四件事你都做得到。', decisionPoint: '比較不同協助方式帶來的持續能量與消耗' }, [
    energyOption('pattern_recognition', '比對數量和類型，找出反覆出現的規律', 1),
    energyOption('emotional_perception', '聽別人的困難，察覺他沒說出口的需要', 1),
    energyOption('initiative', '找出沒人處理的缺口，主動動手做', 1),
    energyOption('precision', '逐件核對標籤和數量，修正錯誤', 1),
  ]),
  energyComparison('ENG03', { domain: 'unexpected_change', scenario: '野餐遇到下雨，大家把物品移到遮雨處，要重新安排下午。', decisionPoint: '比較突發變化後不同活動帶來的能量與消耗' }, [
    energyOption('quantitative_reasoning', '比較室內活動的時間、費用和距離', 1),
    energyOption('teaching_coaching', '教不會玩的人練一輪，直到他能自己玩', 1),
    energyOption('prioritization', '決定最重要的活動，放下其他行程', 1),
    energyOption('adaptability', '用手邊物品立刻改出新活動', 1),
  ]),
  energyComparison('ENG04', { domain: 'creative_task', scenario: '大家要一起布置一面牆，接下來幾天都要做同一類事情。', decisionPoint: '比較創作活動中不同工作帶來的能量與消耗' }, [
    energyOption('verbal_reasoning', '修改文字，讓意思準確、前後通順', 1),
    energyOption('influence', '說明構想的價值，爭取別人支持', 1),
    energyOption('coordination', '安排人、材料和場地時間', 1),
    energyOption('persistence', '把最費時的一部分持續做到完成', 1),
  ]),
  energyComparison('ENG05', { domain: 'learning', scenario: '你要學一款沒玩過的桌遊，只有簡短規則和配置圖。', decisionPoint: '比較理解陌生系統時不同活動帶來的能量與消耗' }, [
    energyOption('spatial_mechanical', '擺放零件，試它們怎麼配合', 1),
    energyOption('learning_agility', '讀懂新規則，邊玩邊學', 1),
    energyOption('structuring_ambiguity', '把零散規則整理成清楚的步驟', 1),
    energyOption('conflict_navigation', '釐清規則爭議，找出大家能接受的玩法', 1),
  ]),
];

const interestQuestions: Question[] = [
  choice('INT01', 'interest', { domain: 'creative_task', scenario: '圖書館有四種展示體驗，都能試兩小時，不需要先有經驗。', decisionPoint: '在無能力門檻下選擇最想探索的活動' }, '你會先選哪一項？', [
    interestOption('analytical_reasoning', '找出展示沒人停留的原因，試著驗證'),
    interestOption('emotional_perception', '觀察訪客，理解沒說出口的需要'),
    interestOption('initiative', '想新主題，先做一個小版本'),
    interestOption('precision', '檢查文字、物品和標示有沒有錯'),
  ]),
  choice('INT02', 'interest', { domain: 'information', scenario: '你有半小時自由翻看活動照片、留言和紀錄，不用交出成果。', decisionPoint: '在無任務壓力下選擇會主動深讀的內容' }, '哪一類內容最可能讓你多看幾頁？', [
    interestOption('pattern_recognition', '哪些狀況常出現，有什麼規律'),
    interestOption('communication', '換個說法後，別人的理解怎麼變'),
    interestOption('planning', '一場活動怎麼分步驟完成'),
    interestOption('adaptability', '遇到突發變化，大家怎麼應變'),
  ]),
  choice('INT03', 'interest', { domain: 'practical_task', scenario: '四場動手做的體驗，時間一樣、都不用基礎，你只能選一場。', decisionPoint: '在同等門檻的實作體驗中選擇主題' }, '哪一場最吸引你？', [
    interestOption('quantitative_reasoning', '用數據比較選項，做出判斷'),
    interestOption('influence', '練習說服別人，回應不同意見'),
    interestOption('prioritization', '在有限時間裡決定先做什麼'),
    interestOption('persistence', '挑戰會失敗多次、需要持續修正的事'),
  ]),
  choice('INT04', 'interest', { domain: 'learning', scenario: '科學中心有四個互動展示，你只能選一個玩二十分鐘。', decisionPoint: '在有限參觀時間中選擇最想理解的問題' }, '哪個問題最容易引起你的好奇？', [
    interestOption('verbal_reasoning', '換個用詞，為什麼意思就不同'),
    interestOption('teaching_coaching', '怎麼提示，能讓卡住的人自己學會'),
    interestOption('spatial_mechanical', '零件的位置和力量怎麼讓裝置動起來'),
    interestOption('creative_ideation', '不同想法能組合出什麼新用途'),
  ]),
  choice('INT05', 'interest', { domain: 'helping_someone', scenario: '一群人準備活動時卡住了。你可以看一位熟手示範他怎麼幫忙。', decisionPoint: '選擇最想觀察的一種協助與解題方式' }, '你最想觀察哪一種做法？', [
    interestOption('learning_agility', '快速學會陌生內容，再用來解決問題'),
    interestOption('structuring_ambiguity', '把混在一起的問題整理清楚'),
    interestOption('coordination', '安排大家分工，讓事情順利接上'),
    interestOption('conflict_navigation', '化解不同意見，讓大家重新對話'),
  ]),
];

const environmentQuestions: Question[] = [
  choice('ENV01', 'environment', { domain: 'limited_time', scenario: '同樣的事情，每週花的時間也一樣。你可以選擇每天的節奏。', decisionPoint: '在相同投入下選擇較能長期維持的節奏' }, '哪一種安排較能讓你穩定維持？', [
    dimensionOption('steady_pace', '每天時段固定，內容可預期，能長時間專注', 'environmentSignals'),
    dimensionOption('varied_pace', '每天內容不同，需要在幾件事情間頻繁切換', 'environmentSignals'),
    dimensionOption('sprint_pace', '集中幾天高強度完成，之後有明確收尾', 'environmentSignals'),
    dimensionOption('self_paced', '只訂每週成果，能依自己的狀態安排快慢', 'environmentSignals'),
  ]),
  choice('ENV02', 'environment', { domain: 'group_activity', scenario: '你可以選一種協助方式，四種花的時間一樣，和人互動的多少不同。', decisionPoint: '在任務相同時選擇較能穩定發揮的合作密度' }, '你會選哪一種分工？', [
    dimensionOption('independent', '大部分時間獨立整理，遇到疑問再與負責人確認', 'environmentSignals'),
    dimensionOption('small_team', '和固定的兩三個人一起整理，隨時互相確認', 'environmentSignals'),
    dimensionOption('cross_functional', '和擅長不同事情的人交換資訊，再整合各自結果', 'environmentSignals'),
    dimensionOption('public_facing', '在現場詢問許多不熟悉的人，依他們提供的資訊整理', 'environmentSignals'),
  ]),
  choice('ENV03', 'environment', { domain: 'unfamiliar_task', scenario: '你要持續照顧植物，可以選一種規則清楚程度不同的安排。', decisionPoint: '在目標相同時選擇偏好的規則清楚程度' }, '哪一種安排最適合你持續投入？', [
    dimensionOption('clear_process', '每天步驟與判準清楚，可以照著做並逐漸熟練', 'environmentSignals'),
    dimensionOption('flexible_process', '有基本原則，但每天可依狀況調整方法', 'environmentSignals'),
    dimensionOption('build_process', '只有目標，照顧方法和紀錄方式都由你從零建立', 'environmentSignals'),
    dimensionOption('case_by_case', '不訂固定流程，每次依植物和天氣重新判斷', 'environmentSignals'),
  ]),
  choice('ENV04', 'environment', { domain: 'practical_task', scenario: '你要定期檢查共用物品。時數和難度一樣，地點與現場變化不同。', decisionPoint: '在時數難度相同時選擇可長期承受的工作場景' }, '哪一種安排較適合你長期投入？', [
    dimensionOption('stationary_predictable', '在固定地點處理，風險和每天變化都可預期', 'environmentSignals'),
    dimensionOption('stationary_high_stakes', '在固定地點處理，但每次判斷錯誤的影響較大', 'environmentSignals'),
    dimensionOption('mobile_predictable', '在幾個地點之間移動，但流程和風險都清楚', 'environmentSignals'),
    dimensionOption('mobile_uncertain', '到不同地點處理，每次都要面對新的狀況和風險', 'environmentSignals'),
  ]),
  choice('ENV05', 'environment', { domain: 'creative_task', scenario: '四個人要在三週內完成一件展示作品，每種分工一樣重要。', decisionPoint: '在同一成果中選擇偏好的貢獻模式' }, '你比較想負責哪一種方式？', [
    dimensionOption('solo_builder', '獨立把其中一個想法做成能使用的完整部分', 'workStyleSignals'),
    dimensionOption('team_integrator', '串起四個人的部分，協助彼此順利接續', 'workStyleSignals'),
    dimensionOption('direction_setter', '先看整體限制，決定作品方向與主要取捨', 'workStyleSignals'),
    dimensionOption('craft_guardian', '深入檢查細節，把最後成品的品質磨好', 'workStyleSignals'),
  ]),
];

const valueQuestions: Question[] = [
  choice('VAL01', 'values', { domain: 'choice_decision', scenario: '兩個有報酬的機會，時間和門檻差不多。你要選一個。', decisionPoint: '在條件相近的有報酬機會中選擇核心價值' }, '哪一項最可能成為你的決定因素？', [
    dimensionOption('mastery', '能長期累積一項能力，逐步做到更深入', 'valueSignals'),
    dimensionOption('impact', '做出的成果能對人或社會產生明顯影響', 'valueSignals'),
    dimensionOption('stability', '收入和生活安排可以穩定預期', 'valueSignals'),
    dimensionOption('autonomy', '能自己決定採取的方法與前進方向', 'valueSignals'),
  ]),
  choice('VAL02', 'values', { domain: 'creative_task', scenario: '你們要做公共資訊牆，時間只夠把一項特色做到最好，其餘做到基本可用。', decisionPoint: '資源有限時選擇最想保留的成果特色' }, '你會把最多資源留給哪一項？', [
    dimensionOption('quality', '逐項確認內容，讓成果的品質與可信度最高', 'valueSignals'),
    dimensionOption('speed', '先完成可使用版本，讓大家盡快看見進展', 'valueSignals'),
    dimensionOption('inclusion', '確認不同使用者的需要都在內容中被看見', 'valueSignals'),
    dimensionOption('innovation', '採用一種與現有做法明顯不同的新形式', 'valueSignals'),
  ]),
  choice('VAL03', 'values', { domain: 'social_interaction', scenario: '活動結束後，別人給了你四種不同的肯定。', decisionPoint: '從不同形式的正面回饋中辨認最重視的肯定' }, '哪一種最容易讓你覺得這段投入很值得？', [
    dimensionOption('expert_recognition', '熟悉這件事的人表示信任你的判斷與能力', 'valueSignals'),
    dimensionOption('user_outcome', '實際參與的人說這項成果讓他的情況真的變好', 'valueSignals'),
    dimensionOption('team_success', '一起做事的人說因為你的貢獻，大家合作得更順利', 'valueSignals'),
    dimensionOption('visible_ownership', '別人清楚指出你完整主導並留下了一項成果', 'valueSignals'),
  ]),
  choice('VAL04', 'values', { domain: 'learning', scenario: '你想參加半年的學習活動，但只能先保住一項條件，其他得配合。', decisionPoint: '參加長期學習機會前選擇最不能犧牲的條件' }, '你最想先確保哪一項？', [
    dimensionOption('work_life_fit', '時間安排能和休息、照顧責任及生活需求相容', 'valueSignals'),
    dimensionOption('learning', '過程中持續接觸新內容，能力能明顯成長', 'valueSignals'),
    dimensionOption('integrity', '採取的做法不需要違背自己的原則', 'valueSignals'),
    dimensionOption('international_collaboration', '能和不同文化背景的人實際交流與合作', 'valueSignals'),
  ]),
  choice('VAL05', 'values', { domain: 'helping_someone', scenario: '你幫忙改善共用空間，只能把一種成果完整留下來。', decisionPoint: '從不同有用結果中選擇最希望長期留下的影響' }, '你最希望完整留下哪一項？', [
    dimensionOption('tangible_output', '一個看得到、摸得到，而且能繼續使用的具體成果', 'valueSignals'),
    dimensionOption('hard_problem', '一個原本反覆出現又難處理的問題被真正解開', 'valueSignals'),
    dimensionOption('people_growth', '一位參與者學會方法，之後能自己處理類似情況', 'valueSignals'),
    dimensionOption('system_improvement', '建立一套比以前更順、之後也能繼續使用的方式', 'valueSignals'),
  ]),
];

const ALL_DISCOVERY_QUESTIONS = [
  ...situationalQuestions,
  ...behaviorQuestions,
  ...evidenceQuestions,
  ...energyQuestions,
  ...interestQuestions,
  ...environmentQuestions,
  ...valueQuestions,
] as const satisfies readonly Question[];

export const CORE_DISCOVERY_QUESTION_IDS = [
  'SJT01', 'BEH01', 'INT01', 'SJT02', 'EVD01',
  'ENV01', 'BEH02', 'SJT03', 'VAL01', 'EVD02',
  'ENG02', 'BEH03', 'SJT04', 'ENV02', 'EVD03',
  'INT03', 'BEH04', 'SJT05', 'VAL03', 'EVD04',
  'ENG04', 'BEH05', 'ENV05', 'EVD05', 'VAL04',
] as const;

export const SUPPLEMENTAL_DISCOVERY_QUESTION_IDS = [
  'ENG01', 'INT02', 'ENV03', 'VAL02', 'ENG03',
  'INT04', 'ENV04', 'VAL05', 'ENG05', 'INT05',
] as const;

const questionsById = new Map(ALL_DISCOVERY_QUESTIONS.map((question) => [question.id, question]));
const selectQuestions = (ids: readonly string[]): Question[] => ids.map((id) => {
  const question = questionsById.get(id);
  if (!question) throw new Error(`Unknown discovery question: ${id}`);
  return question;
});

export const CORE_DISCOVERY_QUESTIONS = selectQuestions(CORE_DISCOVERY_QUESTION_IDS);
export const SUPPLEMENTAL_DISCOVERY_QUESTIONS = selectQuestions(SUPPLEMENTAL_DISCOVERY_QUESTION_IDS);

/**
 * Presentation order: 25-question core discovery followed by 10 optional
 * confidence-building questions. Signal mappings and scoring stay unchanged.
 */
export const QUICK_DISCOVERY_QUESTIONS = [
  ...CORE_DISCOVERY_QUESTIONS,
  ...SUPPLEMENTAL_DISCOVERY_QUESTIONS,
] as const satisfies readonly Question[];
