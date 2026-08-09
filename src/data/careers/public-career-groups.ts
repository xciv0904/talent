import type { PublicCareerGroup } from '../../types';

export const PUBLIC_CAREER_GROUPS = [
  {
    id: 'software_development', title: '軟體開發', description: '把需求轉成可以穩定運作的數位工具與系統。',
    specificCareerIds: ['software_engineer'], commonTitles: ['軟體工程師', '軟體開發工程師'],
    dailyTasks: ['理解要解決的問題與使用需求', '設計並撰寫程式功能', '測試、除錯並改善系統穩定度'],
  },
  {
    id: 'data_analysis', title: '資料分析', description: '整理資料、找出趨勢，協助別人做出更有根據的決定。',
    specificCareerIds: ['data_analyst', 'product_analyst', 'sales_operations_analyst'], commonTitles: ['資料分析師', '產品分析師', '營運分析師'],
    dailyTasks: ['整理與檢查資料品質', '比較數字並找出規律或異常', '用圖表與說明把發現轉成行動建議'],
  },
  {
    id: 'cybersecurity', title: '資訊安全', description: '找出系統風險、調查異常，降低資訊與營運受到攻擊的可能。',
    specificCareerIds: ['cybersecurity_analyst'], commonTitles: ['資安分析師', '資訊安全分析師'],
    dailyTasks: ['監看並判讀安全警報', '追查異常發生的原因與影響', '安排需要優先修補的風險'],
  },
  {
    id: 'product_management', title: '產品管理', description: '在使用者需求、商業目標與執行限制之間排出產品方向。',
    specificCareerIds: ['product_manager'], commonTitles: ['產品經理', '數位產品經理'],
    dailyTasks: ['釐清使用者真正需要解決的問題', '比較不同方案並決定優先順序', '協調不同專業的人把產品做出來'],
  },
  {
    id: 'operations_management', title: '營運管理', description: '整理流程、資訊與協作方式，讓日常運作更順暢可靠。',
    specificCareerIds: ['product_operations', 'business_operations_analyst', 'research_operations_specialist'], commonTitles: ['產品營運', '商業營運分析師', '研究營運專員'],
    dailyTasks: ['整理現有流程與重要資訊', '找出交接或運作卡住的地方', '建立更清楚的做事方式並追蹤改善'],
  },
  {
    id: 'experience_design', title: '使用者體驗與服務設計', description: '理解人如何使用產品或服務，再把流程設計得更清楚順手。',
    specificCareerIds: ['ux_designer', 'service_designer'], commonTitles: ['使用者體驗設計師', '服務設計師', '產品設計師'],
    dailyTasks: ['觀察使用者在哪裡感到困難', '整理一段完整的使用或服務流程', '做出原型並根據測試結果調整'],
  },
  {
    id: 'user_market_research', title: '使用者與市場研究', description: '透過訪談、觀察與資料找出人的需求和市場規律。',
    specificCareerIds: ['ux_researcher', 'market_researcher'], commonTitles: ['使用者研究員', '市場研究員', '消費者洞察研究'],
    dailyTasks: ['設計訪談、觀察或問卷', '比較不同人的行為與意見', '整理反覆出現的需求並說明研究發現'],
  },
  {
    id: 'marketing_planning', title: '行銷與品牌企劃', description: '理解受眾與市場，用內容、品牌或實驗讓訊息產生影響。',
    specificCareerIds: ['content_strategist', 'growth_marketer', 'brand_strategist', 'destination_marketing_specialist'], commonTitles: ['內容企劃', '數位行銷', '品牌企劃', '旅遊行銷'],
    dailyTasks: ['研究受眾在意什麼', '規劃訊息、內容或推廣活動', '觀察成效並調整下一次做法'],
  },
  {
    id: 'sales_solutions', title: '業務與解決方案銷售', description: '理解對方需求、提出合適方案，推進合作與成交。',
    specificCareerIds: ['solutions_consultant', 'account_executive'], commonTitles: ['業務代表', '客戶開發', '解決方案顧問'],
    dailyTasks: ['了解對方的需求與顧慮', '說明方案能解決什麼問題', '跟進進度、協商條件並推進決定'],
  },
  {
    id: 'human_resources', title: '人力資源', description: '協助組織找到、支持與管理合適的人才。',
    specificCareerIds: ['talent_acquisition_specialist', 'people_operations_specialist'], commonTitles: ['招募專員', '人資專員', '人力資源營運'],
    dailyTasks: ['了解職務或人員需要', '安排招募、任用與人事流程', '維護制度、資料與溝通'],
  },
  {
    id: 'learning_training', title: '教育、培訓與職涯輔導', description: '把知識和經驗整理成別人能理解、練習與採取行動的方法。',
    specificCareerIds: ['learning_development_specialist', 'instructional_designer', 'customer_education_specialist', 'career_coach'], commonTitles: ['教育訓練專員', '教學設計師', '職涯教練', '客戶教育專員'],
    dailyTasks: ['了解學習者目前卡住的地方', '設計教材、活動或引導問題', '觀察學習結果並調整教學方式'],
  },
  {
    id: 'customer_success', title: '客戶成功與系統導入', description: '協助使用者把產品或服務真正用起來並解決採用問題。',
    specificCareerIds: ['customer_success_manager', 'implementation_specialist'], commonTitles: ['客戶成功經理', '系統導入顧問', '客戶服務顧問'],
    dailyTasks: ['了解使用者想達成的目標', '安排導入步驟並協助解決問題', '追蹤使用情況與長期合作成果'],
  },
  {
    id: 'hospitality_service', title: '旅宿與服務管理', description: '在現場協調人員與服務細節，讓來訪者獲得順暢體驗。',
    specificCareerIds: ['hotel_operations_manager', 'guest_experience_manager'], commonTitles: ['飯店營運', '賓客體驗', '旅宿服務管理'],
    dailyTasks: ['留意現場服務與來訪者需求', '處理臨時狀況或客訴', '協調人員、空間與服務流程'],
  },
  {
    id: 'event_operations', title: '活動企劃與執行', description: '把活動從想法排成可執行的流程，並處理現場變化。',
    specificCareerIds: ['event_operations_coordinator'], commonTitles: ['活動企劃', '活動執行', '活動營運統籌'],
    dailyTasks: ['安排活動流程、時間與資源', '和參與者及合作人員確認細節', '在現場處理變化並確保活動完成'],
  },
  {
    id: 'travel_planning', title: '旅遊規劃與營運', description: '規劃旅遊內容與行程，協調訂位、供應商及突發狀況。',
    specificCareerIds: ['travel_product_planner', 'tour_operations_specialist'], commonTitles: ['旅遊產品企劃', '旅行團務', '行程規劃'],
    dailyTasks: ['設計符合客群需要的行程', '確認交通、住宿與活動安排', '處理行前及旅途中出現的變化'],
  },
  {
    id: 'education_public_programs', title: '教育與公共計畫', description: '規劃能服務特定人群的教育活動或公共方案。',
    specificCareerIds: ['school_program_coordinator', 'public_program_manager'], commonTitles: ['教育活動企劃', '學校方案協調', '公共計畫管理'],
    dailyTasks: ['了解服務對象需要什麼', '安排活動、人力與執行流程', '追蹤方案成果並向相關的人說明'],
  },
  {
    id: 'policy_research', title: '政策研究', description: '分析社會問題與制度資料，提出公共決策可用的建議。',
    specificCareerIds: ['policy_researcher'], commonTitles: ['政策研究員', '政策分析師'],
    dailyTasks: ['蒐集法規、資料與不同觀點', '比較政策方案可能帶來的影響', '把分析整理成清楚的建議'],
  },
  {
    id: 'clinical_research', title: '臨床與研究執行', description: '依照研究規範安排資料、人員與流程，確保研究可靠完成。',
    specificCareerIds: ['clinical_research_coordinator'], commonTitles: ['臨床研究協調員', '臨床試驗專員'],
    dailyTasks: ['依規範安排研究流程', '核對參與者與研究資料', '協調醫療人員並追蹤重要進度'],
  },
  {
    id: 'rehabilitation_care', title: '復健與生活能力照護', description: '觀察個人的生活困難，設計練習與環境調整來提升自主能力。',
    specificCareerIds: ['occupational_therapist'], commonTitles: ['職能治療師', '復健照護人員'],
    dailyTasks: ['評估個人在生活活動中的困難', '設計復健活動或輔具調整', '陪伴練習並記錄能力變化'],
  },
  {
    id: 'healthcare_information', title: '醫療資訊管理', description: '整理醫療資料與系統需求，讓照護資訊能正確、安全地使用。',
    specificCareerIds: ['health_informatics_specialist'], commonTitles: ['醫療資訊專員', '健康資料管理'],
    dailyTasks: ['整理醫療流程與資料需求', '檢查資訊品質與使用規則', '協助醫療與資訊人員解決系統問題'],
  },
  {
    id: 'finance_accounting', title: '財務與管理會計', description: '分析金錢、成本與營運資料，協助控制風險並做決策。',
    specificCareerIds: ['financial_analyst', 'management_accountant'], commonTitles: ['財務分析師', '管理會計', '成本分析'],
    dailyTasks: ['整理財務與成本資料', '建立預測並比較實際結果', '說明數字變化對決策的影響'],
  },
  {
    id: 'risk_compliance', title: '風險與法規遵循', description: '檢查制度和作業是否符合規範，提早找出可能造成損失的風險。',
    specificCareerIds: ['risk_compliance_analyst'], commonTitles: ['風險分析師', '法遵專員', '內控人員'],
    dailyTasks: ['查核資料與流程是否符合規定', '辨認可能出錯或違規的地方', '記錄問題並追蹤改善'],
  },
  {
    id: 'project_management', title: '專案管理', description: '把有期限的目標拆成步驟，協調資源並處理進度風險。',
    specificCareerIds: ['project_manager'], commonTitles: ['專案經理', '專案管理師', '專案協調'],
    dailyTasks: ['把目標拆成時間與執行步驟', '確認不同人需要完成的事情', '追蹤進度並處理變動或卡點'],
  },
  {
    id: 'supply_chain', title: '供應鏈與物料規劃', description: '安排需求、庫存與供應節奏，讓物料和產品在需要時到位。',
    specificCareerIds: ['supply_chain_planner'], commonTitles: ['供應鏈規劃師', '物料規劃', '需求規劃'],
    dailyTasks: ['預估未來的需求量', '檢查庫存、交期與供應狀況', '在需求變動時重新安排優先順序'],
  },
  {
    id: 'management_consulting', title: '管理與組織顧問', description: '釐清組織問題、比較方案，協助團隊改變做事方式。',
    specificCareerIds: ['management_consultant', 'organizational_development_consultant'], commonTitles: ['管理顧問', '組織發展顧問', '企業顧問'],
    dailyTasks: ['訪談相關的人並整理問題', '分析制度、流程與行為資料', '提出改善方案並協助落實'],
  },
  {
    id: 'sustainability_environment', title: '永續與環境改善', description: '分析環境影響，設計能符合法規並降低資源消耗的方案。',
    specificCareerIds: ['sustainability_consultant', 'environmental_engineer'], commonTitles: ['永續顧問', '環境工程師', '環境管理'],
    dailyTasks: ['蒐集能源、排放或環境資料', '評估法規與實際風險', '提出降低環境影響的改善做法'],
  },
  {
    id: 'media_production', title: '媒體與影音製作', description: '採集資訊與故事，再用文字、聲音或影像製作成內容。',
    specificCareerIds: ['journalist', 'podcast_producer', 'video_editor'], commonTitles: ['記者', 'Podcast 製作人', '影音剪輯師'],
    dailyTasks: ['蒐集資料、訪問或挑選素材', '規劃內容的敘事順序', '剪輯、編寫並完成可發布的作品'],
  },
  {
    id: 'urban_planning', title: '都市與空間規劃', description: '分析人口、土地與公共需求，規劃空間和城市如何發展。',
    specificCareerIds: ['urban_planner'], commonTitles: ['都市規劃師', '城鄉規劃人員'],
    dailyTasks: ['整理土地、交通與人口資料', '了解不同群體對空間的需求', '評估方案並提出規劃建議'],
  },
  {
    id: 'emergency_management', title: '災害與緊急應變', description: '預先規劃風險，並在突發事件中協調資訊、資源和行動。',
    specificCareerIds: ['emergency_management_specialist'], commonTitles: ['災害防救專員', '緊急應變管理'],
    dailyTasks: ['辨認可能發生的風險情境', '規劃演練、通報與資源安排', '事件發生時快速整理資訊並協調行動'],
  },
  {
    id: 'mechanical_industrial_engineering', title: '機械與製程工程', description: '設計或改善機械、設備和生產流程，讓系統更可靠有效率。',
    specificCareerIds: ['mechanical_engineer', 'industrial_engineer'], commonTitles: ['機械工程師', '工業工程師', '製程改善工程師'],
    dailyTasks: ['分析設備或流程如何運作', '設計零件、配置或改善方案', '測試結果並修正效率與可靠性問題'],
  },
  {
    id: 'creative_writing', title: '文字與敘事創作', description: '把概念、資訊和情緒轉成能吸引人理解的文字或故事。',
    specificCareerIds: ['copywriter', 'game_narrative_designer'], commonTitles: ['文案創作者', '遊戲敘事設計師', '內容創作者'],
    dailyTasks: ['理解受眾與作品要傳達的重點', '發展文字、角色或故事結構', '根據回饋反覆修改內容'],
  },
  {
    id: 'exhibition_design', title: '展覽與空間設計', description: '把內容轉成可以在實體空間中觀看、移動與互動的體驗。',
    specificCareerIds: ['exhibition_designer'], commonTitles: ['展覽設計師', '空間展示設計'],
    dailyTasks: ['把展示內容整理成空間動線', '設計視覺、裝置與互動方式', '配合場地限制完成設計調整'],
  },
  {
    id: 'technical_trades', title: '技術與設備實作', description: '使用工具、圖面與標準程序，安裝、製作或維修實體設備。',
    specificCareerIds: ['electrician', 'cnc_technician', 'aviation_maintenance_technician'], commonTitles: ['電氣技術員', 'CNC 技術員', '航空維修技術員'],
    dailyTasks: ['閱讀圖面、規格或維修紀錄', '使用工具安裝、加工或檢修設備', '量測結果並確認安全與品質'],
  },
] as const satisfies readonly PublicCareerGroup[];
