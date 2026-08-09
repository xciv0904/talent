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
  choice('SJT01', 'situational_choice', { domain: 'group_activity', scenario: '你和兩個人一起準備一場小型活動。布置做到一半突然無法繼續，大家都不確定是哪個環節出了問題。', decisionPoint: '卡住且原因不明時的第一個行動' }, '你最自然會先做什麼？', [
    talentOption('analytical_reasoning', '把目前卡住的部分拆開，逐一排除可能原因'),
    talentOption('emotional_perception', '先留意另外兩個人是否有顧慮沒有說出來'),
    talentOption('initiative', '先做一個低風險嘗試，讓事情重新動起來'),
    talentOption('precision', '重新核對活動要求、已有紀錄和執行細節'),
  ]),
  choice('SJT02', 'situational_choice', { domain: 'information', scenario: '朋友請你接手一次搬家準備。一部分物品已經打包，但清單、標籤和相關訊息散落在不同地方。', decisionPoint: '接手進行中且資訊分散的事情' }, '你比較可能先做什麼？', [
    talentOption('pattern_recognition', '比對不同清單，找出反覆出現或互相矛盾的內容'),
    talentOption('communication', '問相關的人，各自已經做了什麼、還缺什麼'),
    talentOption('planning', '整理已完成和互相影響的部分，再排接下來順序'),
    talentOption('adaptability', '先處理眼前最急著要用的物品，再邊做邊調整'),
  ]),
  choice('SJT03', 'situational_choice', { domain: 'limited_time', scenario: '你和兩個人安排一天外出。列出的四項活動不可能全部完成，而且每個人重視的項目不同。', decisionPoint: '在有限時間內取捨多個合理選項' }, '你最自然會先怎麼做？', [
    talentOption('quantitative_reasoning', '把各活動需要的時間、費用和移動距離列出來比較'),
    talentOption('influence', '先了解大家各自最在意什麼，再提出較可能被接受的安排'),
    talentOption('prioritization', '先訂判準，明確決定哪些暫時不做'),
    talentOption('persistence', '先選定一組可行安排，接著解決細節，避免反覆改動'),
  ]),
  choice('SJT04', 'situational_choice', { domain: 'learning', scenario: '你第一次拿到一包可以組成簡單裝置的材料。說明只介紹基本概念，沒有完整組裝步驟。', decisionPoint: '學習一個缺少完整說明的陌生系統' }, '為了先理解它怎麼運作，你比較可能先做什麼？', [
    talentOption('verbal_reasoning', '釐清說明裡的關鍵詞、假設和主張是否一致'),
    talentOption('teaching_coaching', '試著用自己的話向旁邊的人解釋，從對方疑問找理解缺口'),
    talentOption('spatial_mechanical', '畫出結構、流程或部件怎麼互相作用'),
    talentOption('creative_ideation', '找它和熟悉物品相似的地方，再想幾種可能用法'),
  ]),
  choice('SJT05', 'situational_choice', { domain: 'group_activity', scenario: '你和三個人要安排一場社區分享活動。主題大致確定，但怎樣才算完成還沒有共識，大家各有不同想法。', decisionPoint: '共同活動的完成標準不清時的第一步' }, '你最自然會先做什麼？', [
    talentOption('learning_agility', '快速補齊主題的陌生知識，先聽懂每個人的說法'),
    talentOption('structuring_ambiguity', '整理已知、未知與待決策項目'),
    talentOption('coordination', '整理每個人負責的部分、需要交換的資訊與接續方式'),
    talentOption('conflict_navigation', '讓大家說出不同立場背後的顧慮'),
  ]),
];

const forcedChoiceQuestions: Question[] = [
  choice('FC01', 'forced_choice', { domain: 'social_interaction', scenario: '社區公告欄要說明一套新的物品分類方式，但試看的人對內容有不同理解。你和另外三個人各自可以先處理一個部分。', decisionPoint: '在公開說明出現理解差異時選擇貢獻' }, '你比較願意先負責哪一項？', [
    talentOption('communication', '重寫說明，讓不同讀者都能理解實際怎麼做'),
    talentOption('analytical_reasoning', '比對說明和實際分類方式，找出哪裡有矛盾或遺漏'),
    talentOption('persistence', '持續追蹤試用反應，把反覆出現的問題一項項修正'),
    talentOption('creative_ideation', '畫出幾種不同的說明方式，再選一種試給別人看'),
  ]),
  choice('FC02', 'forced_choice', { domain: 'quality_check', scenario: '四個人完成了一本活動手冊初稿，但在送印前只剩一小時，時間只夠重點改善一個部分。', decisionPoint: '成果送出前只能優先強化一項' }, '你比較可能先做哪一項？', [
    talentOption('precision', '逐頁核對內容是否正確，格式與用詞是否一致'),
    talentOption('coordination', '確認每個人要修哪幾頁，以及修完後怎麼接給下一個人'),
    talentOption('learning_agility', '先學會一個可加快檢查的工具，再立刻示範給其他人用'),
    talentOption('influence', '整理最需要改的理由，說服大家集中處理同一個關鍵部分'),
  ]),
  choice('FC03', 'forced_choice', { domain: 'choice_decision', scenario: '你和兩個人要製作一本送給朋友的紀念冊。大家提出兩種都做得完的方式，現在必須選一種才能開始。', decisionPoint: '兩種可行方式中選擇一種執行' }, '你最不願意放棄哪一種判斷方式？', [
    talentOption('planning', '先把製作過程拆成階段，排好先後關係再選'),
    talentOption('adaptability', '選一種保留調整空間的做法，之後依實際進度改變'),
    talentOption('quantitative_reasoning', '先比較兩種做法需要的時間、材料和頁數再選'),
    talentOption('emotional_perception', '先想收到紀念冊的人最在意什麼，再選較貼近的做法'),
  ]),
  choice('FC04', 'forced_choice', { domain: 'group_activity', scenario: '你參加一個每週聚會的社區練習小組。四種負責內容原本每週輪換，現在每個人可以選一種連續負責一個月。', decisionPoint: '在持續合作中選擇願意長期承擔的貢獻' }, '你比較願意選哪一種？', [
    talentOption('prioritization', '每週從大家想練的內容中決定本週焦點'),
    talentOption('teaching_coaching', '陪不熟悉的人練習，用提問和回饋幫他逐步上手'),
    talentOption('pattern_recognition', '紀錄每週出現的狀況，找出反覆影響練習的規律'),
    talentOption('initiative', '沒人確定下週安排時，先提出一個可以開始的方案'),
  ]),
  choice('FC05', 'forced_choice', { domain: 'unfamiliar_task', scenario: '你和兩個人拿到一箱混在一起的零件與一張簡單示意圖。大家對最後要組成什麼的理解不同，還不能開始組裝。', decisionPoint: '實作前先釐清未定義的成果' }, '你最自然會先怎麼做？', [
    talentOption('structuring_ambiguity', '先把已知、未知和需要決定的部分整理成框架'),
    talentOption('conflict_navigation', '先讓每個人說明理解差異，找出真正卡住的分歧'),
    talentOption('verbal_reasoning', '先把示意圖上的用詞和每個人的說法定義清楚'),
    talentOption('spatial_mechanical', '先把零件擺成幾種可能結構，用實體關係來對齊理解'),
  ]),
];

const behaviorQuestions: Question[] = [
  scaled('BEH01', 'behavior', { domain: 'planning', scenario: '朋友第一次自己準備一場小型聚會，已經列出要準備的東西，但不知道先後順序，因此找你一起看。', decisionPoint: '協助別人把未排序的準備事項變得可執行' }, '哪個行動最接近你會先做的事？', [
    talentOption('planning', '把準備事項拆成步驟，排好先後順序'),
    talentOption('emotional_perception', '先問朋友最擔心哪一部分，理解他還沒說出的顧慮'),
    talentOption('analytical_reasoning', '先找出目前安排會卡住的主要原因'),
    talentOption('creative_ideation', '先提出幾種不同準備方式，讓朋友比較'),
  ]),
  scaled('BEH02', 'behavior', { domain: 'unexpected_change', scenario: '你照著食譜準備三個人的餐點，做到一半才發現一項關鍵材料已經用完，現在需要調整原本做法。', decisionPoint: '執行中出現單一關鍵變化時的第一個反應' }, '哪個行動最接近你會先做的事？', [
    talentOption('adaptability', '立刻改用現有材料和新做法，先讓餐點繼續完成'),
    talentOption('precision', '重新核對替代材料會不會改變份量、步驟或安全細節'),
    talentOption('communication', '先告訴等待用餐的人會改哪道內容，確認大家都可以接受'),
    talentOption('learning_agility', '快速查清楚哪些材料可以代替，理解用法後再繼續'),
  ]),
  scaled('BEH03', 'behavior', { domain: 'limited_time', scenario: '你和兩個人要在取件車抵達前整理一批捐贈物品。只剩三十分鐘，分類、數量清單和裝箱都還沒完成。', decisionPoint: '有限時間內處理三項同時未完成的事' }, '如果是你在場，哪個行動最接近你會做的事？', [
    talentOption('prioritization', '先排出三件事的重要順序，也接受其中一部分可能暫緩'),
    talentOption('coordination', '分清每個人負責的部分，確認分類、清點和裝箱能順利接上'),
    talentOption('persistence', '先選定最關鍵的一項，集中做到跨過目前障礙'),
    talentOption('quantitative_reasoning', '估算每項需要的分鐘數和影響箱數，再分配時間'),
  ]),
  scaled('BEH04', 'behavior', { domain: 'social_interaction', scenario: '你和三個人討論住家附近的安靜時段怎麼安排。其中兩個人的想法明顯相反，討論目前停在各自重複理由。', decisionPoint: '討論因相反立場而停滯時的貢獻' }, '哪個行動最接近你會先做的事？', [
    talentOption('influence', '整理一套兼顧實際影響的理由，提出最可能被接受的安排'),
    talentOption('conflict_navigation', '把兩邊重複的主張改寫成幾個可分開討論的分歧'),
    talentOption('teaching_coaching', '分別問兩個人幾個具體問題，讓他們自己說清楚最在意什麼'),
    talentOption('verbal_reasoning', '指出討論中哪些詞意不清，或哪些理由中間跳了一步'),
  ]),
  scaled('BEH05', 'behavior', { domain: 'information', scenario: '你收到四頁從不同地方整理來的操作說明。內容有重複，也有幾處互相矛盾，你必須先判斷下一步該依據哪些資訊。', decisionPoint: '資訊重複且矛盾時的第一個處理動作' }, '哪個行動最接近你會先做的事？', [
    talentOption('structuring_ambiguity', '先按主題分類四頁內容，標出已確定、未確定和互相矛盾的部分'),
    talentOption('pattern_recognition', '找出在不同頁重複出現的說法，再比對哪些有共同規律'),
    talentOption('spatial_mechanical', '畫成流程圖，把每個步驟和前後關係擺在同一張圖上'),
    talentOption('initiative', '先小範圍試做其中一個可逆的步驟，用實際結果取得新資訊'),
  ]),
];

const evidenceQuestions: Question[] = [
  scaled('EVD01', 'evidence', { domain: 'choice_decision', scenario: '一位不熟悉你背景的人想了解你曾經做成的事。你要從最近半年的經驗中，選一件能清楚交代原本情況、採取行動與最後結果的例子。', decisionPoint: '從近期經驗中選出可具體說明的一項貢獻' }, '哪一類例子最可能讓你提出完整細節？', [
    talentOption('analytical_reasoning', '找出反覆出錯的原因，調整後同樣問題沒有再發生'),
    talentOption('coordination', '安排幾個人的行動或幾個步驟，讓它們按時接上'),
    talentOption('adaptability', '原本條件突然改變後，換一種做法仍把事情完成'),
    talentOption('teaching_coaching', '示範並回饋幾次，讓另一個人能獨立完成原本不會的事'),
  ]),
  scaled('EVD02', 'evidence', { domain: 'quality_check', scenario: '你要整理一頁自己的經驗紀錄，並放入一項別人可以核對的成果。可用的證明包括成品、前後數據、當時留下的紀錄或他人回饋。', decisionPoint: '選出最能被外部證據核對的一項成果' }, '哪一種成果最容易讓你拿出實際證明？', [
    talentOption('quantitative_reasoning', '比較前後數字，用結果支持自己做出的判斷'),
    talentOption('communication', '重整說明方式，讓原本誤解的人能正確採取行動'),
    talentOption('initiative', '在沒有人要求前先開始處理，並留下可使用的成果'),
    talentOption('precision', '在送出或使用前查到錯誤，修正後避免實際影響'),
  ]),
  scaled('EVD03', 'evidence', { domain: 'individual_problem', scenario: '你在整理過去一年的重要經驗，想找出一種不是偶然出現的做事方式。你需要選出至少在兩個不同場合做過，而且結果相近的例子。', decisionPoint: '選出曾在不同場合重複產生結果的行為' }, '哪一種行為最容易找到兩個以上的具體例子？', [
    talentOption('pattern_recognition', '比對不同事件後看出共同規律，並用它判斷後續變化'),
    talentOption('influence', '調整理由或說法，讓原本不同意的人願意採取行動'),
    talentOption('planning', '拆開步驟並安排時間，使原本繁複的事情按期完成'),
    talentOption('persistence', '幾次受阻後仍換方法繼續，最後完成原本目標'),
  ]),
  scaled('EVD04', 'evidence', { domain: 'helping_someone', scenario: '一位朋友想知道你曾經怎麼幫一件事變得更好。你要選一段能說清楚「原本哪裡不順、你做了什麼、後來有何改變」的經驗。', decisionPoint: '選出能完整說明改善過程的一段經驗' }, '哪一類經驗最容易讓你說出具體過程？', [
    talentOption('verbal_reasoning', '指出說法裡不清楚或跳躍的地方，改寫後讓決定更嚴謹'),
    talentOption('emotional_perception', '留意對方沒有說出的顧慮，調整協助後讓互動更順'),
    talentOption('prioritization', '明確放下影響較小的部分，把有限時間用在關鍵處'),
    talentOption('creative_ideation', '提出原本沒人想到的做法，修改後真的被採用'),
  ]),
  scaled('EVD05', 'evidence', { domain: 'practical_task', scenario: '你在整理一份個人經驗紀錄，其中一欄要填「我怎麼處理陌生又混亂的場面」。你可以從學習、活動或日常生活選例子，但只能先寫證據最具體的一項。', decisionPoint: '從不同生活經驗中選出可驗證的實際貢獻' }, '哪一類貢獻最容易讓你提出實例？', [
    talentOption('spatial_mechanical', '曾重新安排物品、空間或動線，實際減少使用上的阻礙'),
    talentOption('learning_agility', '曾快速弄懂陌生方法，接著正確用在當時要處理的事'),
    talentOption('structuring_ambiguity', '曾把混在一起的問題分組，訂出別人也能跟著做的順序'),
    talentOption('conflict_navigation', '曾釐清意見不同的原因，讓原本僵持的人重新一起處理'),
  ]),
];

const positiveEnergyQuestions: Question[] = [
  choice('ENG01', 'energy', { domain: 'planning', scenario: '你剛花一小時整理好一個共用置物區，還有三十分鐘可以自由處理一件後續事情。四件事都不急，也都有人之後可以接手。', decisionPoint: '完成一段投入後選擇願意繼續的活動' }, '哪一件事最可能讓你還想繼續投入？', [
    energyOption('analytical_reasoning', '追查哪些物品總是放錯位置，以及真正原因', 1),
    energyOption('communication', '寫一份讓第一次來的人也看得懂的使用說明', 1),
    energyOption('planning', '安排接下來一個月的整理步驟與檢查時間', 1),
    energyOption('creative_ideation', '畫出幾種完全不同的收納與使用方式', 1),
  ]),
  choice('ENG02', 'energy', { domain: 'helping_someone', scenario: '你在一場物品募集活動協助了一個下午，現在可選一件事再做四十分鐘。四個部分都還需要人，但不會影響活動是否完成。', decisionPoint: '投入數小時後選擇仍願意承擔的協助' }, '哪一項最可能讓你做完後仍有精神？', [
    energyOption('pattern_recognition', '比對收到的物品，找出數量與類型反覆變化的規律', 1),
    energyOption('emotional_perception', '聽一位參與者說明困難，找出他沒有直接說出的需要', 1),
    energyOption('initiative', '看到一個沒人處理的缺口，從零開始設計做法並動手', 1),
    energyOption('precision', '逐件核對標籤與數量，把錯誤修到穩定', 1),
  ]),
  choice('ENG03', 'energy', { domain: 'unexpected_change', scenario: '三個人正在戶外準備野餐，突然下起大雨。大家先把物品移到遮蔽處，接著可以各自選一件事，重新安排剩下的下午。', decisionPoint: '突發變化後選擇最能恢復動力的活動' }, '哪一項最可能讓你重新有動力？', [
    energyOption('quantitative_reasoning', '比較各個室內選項的時間、費用和距離後做判斷', 1),
    energyOption('teaching_coaching', '陪不熟悉桌遊的人練一輪，直到他能自己玩', 1),
    energyOption('prioritization', '決定今天最重要的一項體驗，放下其他安排', 1),
    energyOption('adaptability', '利用現有物品立刻改出一個不受下雨影響的新活動', 1),
  ]),
  choice('ENG04', 'energy', { domain: 'creative_task', scenario: '一個公共空間有面空白牆面，四種佈置構想都已有人提出。你有兩小時可自由選一件事，讓其中一個構想更接近完成。', decisionPoint: '在創作活動中選擇最期待投入的內容' }, '你最期待先做哪一項？', [
    energyOption('verbal_reasoning', '修改牆面文字，讓每個主張和用詞都精確連貫', 1),
    energyOption('influence', '整理構想的價值，向使用空間的人爭取支持', 1),
    energyOption('coordination', '安排參與者、材料和使用時段能順利接上', 1),
    energyOption('persistence', '接手最費時的一部分，持續把它做到完成', 1),
  ]),
  choice('ENG05', 'energy', { domain: 'learning', scenario: '你第一次接觸一款零件很多的桌上遊戲，盒內只有簡短規則和一張配置圖。身邊另外兩個人也還不確定該怎麼開始。', decisionPoint: '面對陌生系統時選擇容易進入專注的活動' }, '哪一項最容易讓你進入專注狀態？', [
    energyOption('spatial_mechanical', '把零件擺出來，測試它們在空間和操作上如何配合', 1),
    energyOption('learning_agility', '快速讀完陌生規則，邊試邊吸收新的玩法', 1),
    energyOption('structuring_ambiguity', '把零散規則整理成開始、進行和結束三個階段', 1),
    energyOption('conflict_navigation', '釐清兩個人對規則的不同理解，找出都能接受的試法', 1),
  ]),
];

const drainingEnergyQuestions: Question[] = [
  choice('ENG06', 'energy', { domain: 'individual_problem', scenario: '你要用一週改善自己的日常安排，每天都得重複處理同一類活動四十分鐘。四種活動都能帶來幫助，也都在你的能力範圍內。', decisionPoint: '判斷長時間重複哪種活動最消耗能量' }, '哪一項最可能讓你到週末感到耗盡？', [
    energyOption('analytical_reasoning', '每天追查一個不順的原因，再驗證自己的推測', -1),
    energyOption('communication', '每天向不同的人說明安排，並逐一回應問題', -1),
    energyOption('planning', '每天更新步驟、時間和各項安排的前後關係', -1),
    energyOption('creative_ideation', '每天提出幾個尚未試過的新做法', -1),
  ]),
  choice('ENG07', 'energy', { domain: 'quality_check', scenario: '你和幾個人連續三晚整理一本社區資源小冊，每晚都可以選一種固定責任。四種責任同樣重要，而且你都有能力完成。', decisionPoint: '判斷持續承擔哪種責任後最需要休息' }, '哪一項做久後最可能讓你需要獨處或休息？', [
    energyOption('pattern_recognition', '長時間比對不同頁面的資訊，找出反覆出現的規律', -1),
    energyOption('emotional_perception', '持續聽取提供資料者的顧慮，判斷他們沒直接說出的需要', -1),
    energyOption('initiative', '每晚都先決定如何開始，並承擔做法還不確定的部分', -1),
    energyOption('precision', '逐字核對內容，長時間維持零錯誤和細節警覺', -1),
  ]),
  choice('ENG08', 'energy', { domain: 'limited_time', scenario: '一場社區活動三天後開始，但報名人數和可用空間每天都在變。你要連續三天負責其中一類高壓內容，每一類都能完成。', decisionPoint: '時間有限且條件變動時辨認額外能量消耗' }, '哪一項最可能額外消耗你的能量？', [
    energyOption('quantitative_reasoning', '反覆重算人數、份量和空間差異，確認數字仍可行', -1),
    energyOption('teaching_coaching', '逐一帶不同熟悉程度的人練習，配合各自的學習速度', -1),
    energyOption('prioritization', '每天替彼此衝突的需求重新做困難取捨', -1),
    energyOption('adaptability', '隨著新消息頻繁更換做法和做事節奏', -1),
  ]),
  choice('ENG09', 'energy', { domain: 'social_interaction', scenario: '四個人要共同決定一個空間的使用方式，但對規則有不同意見。你可以選一項責任，協助大家在今天結束前形成可執行的決定。', decisionPoint: '共同決策中辨認做得到但最耗能的責任' }, '哪一項即使做得不差，事後仍最容易讓你疲累？', [
    energyOption('verbal_reasoning', '逐句確認規則裡的定義和理由是否精確', -1),
    energyOption('influence', '整理一套理由，說服原本反對的人改變決定', -1),
    energyOption('coordination', '追蹤每個人答應處理的事，確認前後能接上', -1),
    energyOption('persistence', '討論幾次受阻後仍持續推進，直到形成決定', -1),
  ]),
  choice('ENG10', 'energy', { domain: 'information', scenario: '你拿到一盒混在一起的圖卡、零件和簡短說明，需要用兩小時把它整理成別人能接手使用的狀態。四種整理方式都可行。', decisionPoint: '複雜資訊與實體材料中辨認最耗腦力的活動' }, '哪一項最容易讓你覺得腦力透支？', [
    energyOption('spatial_mechanical', '持續推想多個零件的空間位置與互動方式', -1),
    energyOption('learning_agility', '短時間讀懂大量陌生名詞與使用規則', -1),
    energyOption('structuring_ambiguity', '替零散又不完整的內容建立清楚分類和框架', -1),
    energyOption('conflict_navigation', '處理兩位提供資料者對分類方式的高張力分歧', -1),
  ]),
];

const interestQuestions: Question[] = [
  choice('INT01', 'interest', { domain: 'creative_task', scenario: '圖書館開放一個週末展示區，你可以參加其中一項兩小時的小型體驗。這次只看你想探索什麼，不要求已有相關能力。', decisionPoint: '在無能力門檻下選擇最想探索的活動' }, '你會先選哪一項？', [
    interestOption('analytical_reasoning', '拆解過去展示少人停留的原因，設計方法驗證'),
    interestOption('emotional_perception', '觀察來訪者的反應，理解他們沒有直接說出的需要'),
    interestOption('initiative', '從零提出一個展示主題，先做出可以試看的版本'),
    interestOption('precision', '建立檢查方式，讓文字、物品和標示都正確一致'),
  ]),
  choice('INT02', 'interest', { domain: 'information', scenario: '你可以自由瀏覽一個活動資料庫，裡面有多年照片、留言、行程和臨時變更紀錄。你只有半小時，不需要交出任何成果。', decisionPoint: '在無任務壓力下選擇會主動深讀的內容' }, '哪一類內容最可能讓你多看幾頁？', [
    interestOption('pattern_recognition', '比對多年紀錄，看哪些狀況反覆出現並形成規律'),
    interestOption('communication', '追蹤同一則訊息換了說法後，別人的理解如何改變'),
    interestOption('planning', '研究一場活動如何從零拆解、安排並完成'),
    interestOption('adaptability', '查看突然變更後，人們如何即時換方法繼續進行'),
  ]),
  choice('INT03', 'interest', { domain: 'practical_task', scenario: '一個開放體驗日有四場動手做活動，時間相同，也不需要基礎。你只能完整參加其中一場。', decisionPoint: '在同等門檻的實作體驗中選擇主題' }, '哪一場最吸引你？', [
    interestOption('quantitative_reasoning', '用一組真實數據比較選項，做出可檢驗的決定'),
    interestOption('influence', '練習提出理由、回應反對意見，爭取別人支持'),
    interestOption('prioritization', '在時間和資源有限時，決定保留與放下什麼'),
    interestOption('persistence', '分段完成一個會反覆失敗、需要持續修正的挑戰'),
  ]),
  choice('INT04', 'interest', { domain: 'learning', scenario: '科學中心有四個互動展示，每個展示都能自由操作二十分鐘。你只來得及選一個深入看完。', decisionPoint: '在有限參觀時間中選擇最想理解的問題' }, '哪個問題最容易引起你的好奇？', [
    interestOption('verbal_reasoning', '同一句話換了用詞後，為什麼會改變人的理解與推論'),
    interestOption('teaching_coaching', '人卡在一個步驟時，什麼提示能讓他自己突破'),
    interestOption('spatial_mechanical', '幾個部件的位置與力量如何一起讓裝置運作'),
    interestOption('creative_ideation', '兩個原本無關的概念如何組合成新的用途'),
  ]),
  choice('INT05', 'interest', { domain: 'helping_someone', scenario: '一個小組在準備共同活動時卡住了。你可以旁觀一位熟練的協助者處理二十分鐘，四位協助者會從不同方向開始。', decisionPoint: '選擇最想觀察的一種解題方式' }, '你最想看哪一位怎麼做？', [
    interestOption('learning_agility', '快速補齊陌生背景，再把新資訊立刻用進目前問題的人'),
    interestOption('structuring_ambiguity', '把混在一起的問題分層，整理成可決定項目的人'),
    interestOption('coordination', '分清每個人的部分與接續方式，讓合作重新順起來的人'),
    interestOption('conflict_navigation', '找出不同立場真正卡住的地方，讓對話重新開始的人'),
  ]),
];

const environmentQuestions: Question[] = [
  choice('ENV01', 'environment', { domain: 'limited_time', scenario: '社區中心提供四種為期一個月的協助安排，每種每週總時數相同，內容也都在你的能力範圍內。差別只在每天投入的節奏。', decisionPoint: '在相同投入下選擇較能長期維持的節奏' }, '哪一種安排較能讓你穩定維持？', [
    dimensionOption('steady_pace', '每天時段固定，內容可預期，能長時間專注', 'environmentSignals'),
    dimensionOption('varied_pace', '每天內容不同，需要在幾件事情間頻繁切換', 'environmentSignals'),
    dimensionOption('sprint_pace', '集中幾天高強度完成，之後有明確收尾', 'environmentSignals'),
    dimensionOption('self_paced', '只訂每週成果，能依自己的狀態安排快慢', 'environmentSignals'),
  ]),
  choice('ENV02', 'environment', { domain: 'group_activity', scenario: '你要參加一次社區舊照片整理活動，四種分工都處理相同數量的照片，也都有清楚說明。差別只在與人互動的方式。', decisionPoint: '在任務相同時選擇較能穩定發揮的合作密度' }, '你會選哪一種分工？', [
    dimensionOption('independent', '大部分時間獨立整理，遇到疑問再與負責人確認', 'environmentSignals'),
    dimensionOption('small_team', '和固定的兩三個人一起整理，隨時互相確認', 'environmentSignals'),
    dimensionOption('cross_functional', '和擅長不同事情的人交換資訊，再整合各自結果', 'environmentSignals'),
    dimensionOption('public_facing', '在現場詢問許多不熟悉的人，依他們提供的資訊整理', 'environmentSignals'),
  ]),
  choice('ENV03', 'environment', { domain: 'unfamiliar_task', scenario: '你第一次協助照顧一小片共用花園，每種安排的目標都是讓植物穩定生長。四種安排只在規則清楚程度上不同。', decisionPoint: '在目標相同時選擇偏好的規則清楚程度' }, '哪一種安排最適合你持續投入？', [
    dimensionOption('clear_process', '每天步驟與判準清楚，可以照著做並逐漸熟練', 'environmentSignals'),
    dimensionOption('flexible_process', '有基本原則，但每天可依狀況調整方法', 'environmentSignals'),
    dimensionOption('build_process', '只有目標，照顧方法和紀錄方式都由你從零建立', 'environmentSignals'),
    dimensionOption('case_by_case', '不訂固定流程，每次依植物和天氣重新判斷', 'environmentSignals'),
  ]),
  choice('ENV04', 'environment', { domain: 'practical_task', scenario: '一個月的物品維護活動有四種負責方式，每種的重要性、時數和需要的技能相同。差別只在移動程度與現場不確定性。', decisionPoint: '在條件相同時選擇可長期承受的場景' }, '哪一種方式最接近你願意長期投入的狀態？', [
    dimensionOption('stationary_predictable', '在固定地點處理，風險和每天變化都可預期', 'environmentSignals'),
    dimensionOption('stationary_high_stakes', '在固定地點處理，但每次判斷錯誤的影響較大', 'environmentSignals'),
    dimensionOption('mobile_predictable', '在幾個地點之間移動，但流程和風險都清楚', 'environmentSignals'),
    dimensionOption('mobile_uncertain', '到不同地點處理，每次都要面對新的狀況和風險', 'environmentSignals'),
  ]),
  choice('ENV05', 'environment', { domain: 'creative_task', scenario: '四個人要用三週完成一件可公開展示的作品。每種貢獻方式需要的時間相同，也都會被清楚看見。', decisionPoint: '在同一成果中選擇偏好的貢獻模式' }, '你比較想負責哪一種方式？', [
    dimensionOption('solo_builder', '獨立把其中一個想法做成能使用的完整部分', 'workStyleSignals'),
    dimensionOption('team_integrator', '串起四個人的部分，協助彼此順利接續', 'workStyleSignals'),
    dimensionOption('direction_setter', '先看整體限制，決定作品方向與主要取捨', 'workStyleSignals'),
    dimensionOption('craft_guardian', '深入檢查細節，把最後成品的品質磨好', 'workStyleSignals'),
  ]),
];

const valueQuestions: Question[] = [
  choice('VAL01', 'values', { domain: 'choice_decision', scenario: '你在兩個未來有報酬的機會中選一個，兩者需要的時間、基本門檻和開始日期相近。你必須用一項最重要的條件做決定。', decisionPoint: '在條件相近的有報酬機會中選擇核心價值' }, '哪一項最可能成為你的決定因素？', [
    dimensionOption('mastery', '能長期累積一項能力，逐步做到更深入', 'valueSignals'),
    dimensionOption('impact', '做出的成果能對人或社會產生明顯影響', 'valueSignals'),
    dimensionOption('stability', '收入和生活安排可以穩定預期', 'valueSignals'),
    dimensionOption('autonomy', '能自己決定採取的方法與前進方向', 'valueSignals'),
  ]),
  choice('VAL02', 'values', { domain: 'creative_task', scenario: '你和幾個人正在製作一面公共資訊牆，但材料和時間只夠把一項特色做到最好。其他三項仍會達到基本可用程度。', decisionPoint: '資源有限時選擇最想保留的成果特色' }, '你會把最多資源留給哪一項？', [
    dimensionOption('quality', '逐項確認內容，讓成果的品質與可信度最高', 'valueSignals'),
    dimensionOption('speed', '先完成可使用版本，讓大家盡快看見進展', 'valueSignals'),
    dimensionOption('inclusion', '確認不同使用者的需要都在內容中被看見', 'valueSignals'),
    dimensionOption('innovation', '採用一種與現有做法明顯不同的新形式', 'valueSignals'),
  ]),
  choice('VAL03', 'values', { domain: 'social_interaction', scenario: '你投入幾週完成一場共同活動，結束後收到四種真實回饋。這些回饋都很正面，但肯定的是不同部分。', decisionPoint: '從不同形式的正面回饋中辨認最重視的肯定' }, '哪一種最容易讓你覺得這段投入很值得？', [
    dimensionOption('expert_recognition', '熟悉這件事的人表示信任你的判斷與能力', 'valueSignals'),
    dimensionOption('user_outcome', '實際參與的人說這項成果讓他的情況真的變好', 'valueSignals'),
    dimensionOption('team_success', '一起做事的人說因為你的貢獻，大家合作得更順利', 'valueSignals'),
    dimensionOption('visible_ownership', '別人清楚指出你完整主導並留下了一項成果', 'valueSignals'),
  ]),
  choice('VAL04', 'values', { domain: 'learning', scenario: '你受邀參加一個為期半年的成長機會，內容有吸引力，但必須先確認一項不可犧牲的條件。其餘條件都可以再協調。', decisionPoint: '接受長期成長機會前選擇不可犧牲的條件' }, '你會先守住哪一項？', [
    dimensionOption('work_life_fit', '時間安排能和休息、照顧責任及生活需求相容', 'valueSignals'),
    dimensionOption('learning', '過程中持續接觸新內容，能力能明顯成長', 'valueSignals'),
    dimensionOption('integrity', '採取的做法不需要違背自己的原則', 'valueSignals'),
    dimensionOption('international_collaboration', '能和不同文化背景的人實際交流與合作', 'valueSignals'),
  ]),
  choice('VAL05', 'values', { domain: 'helping_someone', scenario: '你協助改善一個大家會使用的共用空間，四項結果最後只能完整留下其中一項。每一項都能確實幫上忙。', decisionPoint: '從不同有用結果中選擇最希望長期留下的影響' }, '你最希望完整留下哪一項？', [
    dimensionOption('tangible_output', '一個看得到、摸得到，而且能繼續使用的具體成果', 'valueSignals'),
    dimensionOption('hard_problem', '一個原本反覆出現又難處理的問題被真正解開', 'valueSignals'),
    dimensionOption('people_growth', '一位參與者學會方法，之後能自己處理類似情況', 'valueSignals'),
    dimensionOption('system_improvement', '建立一套比以前更順、之後也能繼續使用的方式', 'valueSignals'),
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
