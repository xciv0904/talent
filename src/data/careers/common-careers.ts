import { createCareer } from './create-career';

// Editorial exploration profiles, not occupational test norms or eligibility determinations.
export const COMMON_CAREERS = [
  createCareer({
    "id": "school_teacher",
    "zh": "中小學教師",
    "en": "School Teacher",
    "aliases": [
      "老師",
      "教師",
      "國小老師",
      "國中老師",
      "高中老師"
    ],
    "family": "education",
    "description": "準備課程、帶領班級，觀察學生是否理解並調整教法。",
    "tasks": [
      "備課並帶領課堂練習",
      "觀察學習困難並提供回饋",
      "與家長及同事合作支持學生"
    ],
    "talents": {
      "communication": 0.92,
      "learning_agility": 0.85,
      "emotional_perception": 0.78,
      "planning": 0.71,
      "teaching_coaching": 0.98
    },
    "themes": {
      "making": 0.25,
      "people": 0.92,
      "service": 0.85,
      "systems": 0.35,
      "data": 0.2,
      "creative_expression": 0.88
    },
    "workStyle": {
      "hands_on": 0.58,
      "detail_focused": 0.55,
      "collaborative": 0.8,
      "independent": 0.3
    },
    "environment": {
      "socialDensity": 0.85,
      "pace": 0.55,
      "ambiguity": 0.35,
      "mobility": 0.35,
      "risk": 0.3,
      "repetition": 0.45,
      "emotionalLabor": 0.85,
      "structure": 0.55
    },
    "values": {
      "mastery": 0.85,
      "service": 0.92,
      "stability": 0.65,
      "autonomy": 0.3,
      "creativity": 0.3
    },
    "skills": [
      "Lesson planning",
      "Student assessment",
      "Family communication"
    ],
    "entry": {
      "education": "bachelor",
      "professionalLicenses": [
        "教師證書；任教類科須相符，正式職缺另依甄選程序"
      ],
      "certifications": []
    },
    "barrier": "very_high",
    "related": [
      "instructional_designer",
      "learning_development_specialist"
    ],
    "experiment": "設計一段十分鐘的小教學，請成年朋友試學並說出哪裡聽不懂。"
  }),
  createCareer({
    "id": "preschool_teacher",
    "zh": "幼兒園教師",
    "en": "Preschool Teacher",
    "aliases": [
      "幼教老師",
      "幼稚園老師"
    ],
    "family": "education",
    "description": "透過遊戲與生活照顧支持幼兒發展，持續觀察並與家庭溝通。",
    "tasks": [
      "設計適齡的遊戲活動",
      "觀察並記錄幼兒的學習與互動",
      "與家長溝通生活及發展需要"
    ],
    "talents": {
      "emotional_perception": 0.98,
      "adaptability": 0.85,
      "communication": 0.78,
      "planning": 0.71,
      "creative_ideation": 0.75,
      "teaching_coaching": 0.9
    },
    "themes": {
      "making": 0.6,
      "people": 0.92,
      "service": 0.85,
      "systems": 0.35,
      "data": 0.2,
      "creative_expression": 0.75
    },
    "workStyle": {
      "hands_on": 0.58,
      "detail_focused": 0.55,
      "collaborative": 0.8,
      "independent": 0.3
    },
    "environment": {
      "socialDensity": 0.85,
      "pace": 0.55,
      "ambiguity": 0.35,
      "mobility": 0.35,
      "risk": 0.3,
      "repetition": 0.45,
      "emotionalLabor": 0.98,
      "structure": 0.78
    },
    "values": {
      "mastery": 0.85,
      "service": 0.92,
      "stability": 0.65,
      "autonomy": 0.3,
      "creativity": 0.3
    },
    "skills": [
      "Play-based learning",
      "Child observation",
      "Family communication"
    ],
    "entry": {
      "education": "bachelor",
      "professionalLicenses": [
        "幼兒園教師證書；與教保員資格不同"
      ],
      "certifications": []
    },
    "barrier": "very_high",
    "related": [
      "instructional_designer",
      "learning_development_specialist"
    ],
    "experiment": "用紙卡規劃一個適齡遊戲，請幼教工作者回饋規則與照顧安排。"
  }),
  createCareer({
    "id": "military_service_member",
    "zh": "職業軍人（志願役）",
    "en": "Military Service Member",
    "aliases": [
      "軍人",
      "軍職",
      "志願役",
      "軍官",
      "士官",
      "士兵"
    ],
    "family": "public_service",
    "description": "依軍種與專長接受訓練、執行勤務，維持裝備與團隊的任務準備。",
    "tasks": [
      "依單位規範訓練與執勤",
      "維護裝備及核對交接紀錄",
      "在指揮體系內回報並協作"
    ],
    "talents": {
      "persistence": 0.92,
      "precision": 0.85,
      "coordination": 0.78,
      "adaptability": 0.71
    },
    "themes": {
      "making": 0.25,
      "people": 0.92,
      "service": 0.85,
      "systems": 0.72,
      "data": 0.2,
      "creative_expression": 0.2
    },
    "workStyle": {
      "hands_on": 0.85,
      "detail_focused": 0.85,
      "collaborative": 0.8,
      "independent": 0.15
    },
    "environment": {
      "socialDensity": 0.85,
      "pace": 0.55,
      "ambiguity": 0.35,
      "mobility": 0.9,
      "risk": 1,
      "repetition": 0.85,
      "emotionalLabor": 0.85,
      "structure": 1
    },
    "values": {
      "mastery": 0.85,
      "service": 0.92,
      "stability": 0.8,
      "autonomy": 0.1,
      "creativity": 0.3
    },
    "skills": [
      "Duty readiness",
      "Equipment accountability",
      "Team reporting"
    ],
    "entry": {
      "education": "secondary",
      "professionalLicenses": [],
      "certifications": []
    },
    "barrier": "high",
    "related": [
      "public_program_manager",
      "emergency_management_specialist"
    ],
    "experiment": "閱讀公開招募資料，整理一種軍職專長的日常、服役義務與生活限制。"
  }),
  createCareer({
    "id": "police_officer",
    "zh": "警察",
    "en": "Police Officer",
    "aliases": [
      "警員",
      "行政警察",
      "員警"
    ],
    "family": "public_service",
    "description": "依法維護治安、受理民眾報案，處理事件並留下完整紀錄。",
    "tasks": [
      "受理報案並核實事件資訊",
      "依規範執勤與保護民眾權益",
      "整理紀錄並完成勤務交接"
    ],
    "talents": {
      "conflict_navigation": 0.92,
      "precision": 0.85,
      "emotional_perception": 0.78,
      "adaptability": 0.71
    },
    "themes": {
      "making": 0.25,
      "people": 0.92,
      "service": 0.85,
      "systems": 0.35,
      "data": 0.2,
      "creative_expression": 0.2
    },
    "workStyle": {
      "hands_on": 0.58,
      "detail_focused": 0.85,
      "collaborative": 0.8,
      "independent": 0.3
    },
    "environment": {
      "socialDensity": 0.85,
      "pace": 0.85,
      "ambiguity": 0.35,
      "mobility": 0.8,
      "risk": 0.95,
      "repetition": 0.45,
      "emotionalLabor": 0.85,
      "structure": 0.9
    },
    "values": {
      "mastery": 0.85,
      "service": 0.92,
      "stability": 0.65,
      "autonomy": 0.3,
      "creativity": 0.3
    },
    "skills": [
      "Incident recording",
      "Evidence organization",
      "Public communication"
    ],
    "entry": {
      "education": "secondary",
      "professionalLicenses": [
        "依警察教育或考試任用途徑取得資格並完成訓練"
      ],
      "certifications": []
    },
    "barrier": "very_high",
    "related": [
      "public_program_manager",
      "emergency_management_specialist"
    ],
    "experiment": "閱讀公開勤務介紹，練習把虛構事件的已知事實、待查事項和交接寫清楚。"
  }),
  createCareer({
    "id": "firefighter",
    "zh": "消防員",
    "en": "Firefighter",
    "aliases": [
      "消防人員",
      "消防警察",
      "消防隊員"
    ],
    "family": "public_service",
    "description": "接受消防救災與救護相關訓練，執行勤務、預防宣導及裝備整備。",
    "tasks": [
      "依訓練與指揮執行救災救護勤務",
      "檢查並記錄裝備狀態",
      "進行防災宣導與團隊演練"
    ],
    "talents": {
      "coordination": 0.98,
      "precision": 0.85,
      "adaptability": 0.95,
      "persistence": 0.71,
      "prioritization": 0.9,
      "emotional_perception": 0.8
    },
    "themes": {
      "making": 0.25,
      "people": 0.92,
      "service": 0.85,
      "systems": 0.35,
      "data": 0.2,
      "creative_expression": 0.2
    },
    "workStyle": {
      "hands_on": 0.58,
      "detail_focused": 0.85,
      "collaborative": 0.8,
      "independent": 0.3
    },
    "environment": {
      "socialDensity": 0.85,
      "pace": 0.95,
      "ambiguity": 0.8,
      "mobility": 0.8,
      "risk": 0.95,
      "repetition": 0.45,
      "emotionalLabor": 0.95,
      "structure": 0.9
    },
    "values": {
      "mastery": 0.85,
      "service": 0.92,
      "stability": 0.65,
      "autonomy": 0.3,
      "creativity": 0.3
    },
    "skills": [
      "Equipment readiness",
      "Incident reporting",
      "Team drills"
    ],
    "entry": {
      "education": "secondary",
      "professionalLicenses": [
        "依消防警察考試或相關教育任用途徑完成訓練"
      ],
      "certifications": []
    },
    "barrier": "very_high",
    "related": [
      "public_program_manager",
      "emergency_management_specialist"
    ],
    "experiment": "參訪開放的消防宣導活動，整理輪班、訓練與整備對生活的影響。"
  }),
  createCareer({
    "id": "physician",
    "zh": "醫師",
    "en": "Physician",
    "aliases": [
      "醫生",
      "西醫師"
    ],
    "family": "healthcare",
    "description": "整合病史與檢查資訊進行診療，向病人說明並與醫療團隊合作。",
    "tasks": [
      "詢問病史並進行專業評估",
      "說明診療選擇與追蹤安排",
      "記錄病情並與照護團隊交接"
    ],
    "talents": {
      "analytical_reasoning": 0.92,
      "precision": 0.85,
      "learning_agility": 0.78,
      "communication": 0.71
    },
    "themes": {
      "making": 0.25,
      "people": 0.92,
      "service": 0.85,
      "systems": 0.35,
      "data": 0.72,
      "creative_expression": 0.2
    },
    "workStyle": {
      "hands_on": 0.58,
      "detail_focused": 0.85,
      "collaborative": 0.8,
      "independent": 0.3
    },
    "environment": {
      "socialDensity": 0.85,
      "pace": 0.55,
      "ambiguity": 0.72,
      "mobility": 0.35,
      "risk": 0.95,
      "repetition": 0.45,
      "emotionalLabor": 0.85,
      "structure": 0.55
    },
    "values": {
      "mastery": 0.85,
      "service": 0.92,
      "stability": 0.65,
      "autonomy": 0.3,
      "creativity": 0.3
    },
    "skills": [
      "Clinical assessment",
      "Patient communication",
      "Clinical documentation"
    ],
    "entry": {
      "education": "bachelor",
      "professionalLicenses": [
        "醫師考試及證書、執業登記；須完成相應醫學教育與訓練"
      ],
      "certifications": []
    },
    "barrier": "very_high",
    "related": [
      "occupational_therapist",
      "clinical_research_coordinator"
    ],
    "experiment": "用虛構資料練習整理病人關心的問題與待問事項，不做診斷或用藥建議。"
  }),
  createCareer({
    "id": "registered_nurse",
    "zh": "護理師",
    "en": "Registered Nurse",
    "aliases": [
      "護士",
      "護理人員"
    ],
    "family": "healthcare",
    "description": "觀察照護需求、執行專業護理，協調病人、家屬與醫療團隊。",
    "tasks": [
      "觀察並記錄照護狀況",
      "依規範執行護理與衛教",
      "交接待辦並回報狀況變化"
    ],
    "talents": {
      "precision": 0.92,
      "emotional_perception": 0.85,
      "coordination": 0.78,
      "adaptability": 0.71
    },
    "themes": {
      "making": 0.25,
      "people": 0.92,
      "service": 0.85,
      "systems": 0.35,
      "data": 0.2,
      "creative_expression": 0.2
    },
    "workStyle": {
      "hands_on": 0.58,
      "detail_focused": 0.85,
      "collaborative": 0.8,
      "independent": 0.3
    },
    "environment": {
      "socialDensity": 0.85,
      "pace": 0.85,
      "ambiguity": 0.35,
      "mobility": 0.35,
      "risk": 0.3,
      "repetition": 0.45,
      "emotionalLabor": 0.85,
      "structure": 0.55
    },
    "values": {
      "mastery": 0.85,
      "service": 0.92,
      "stability": 0.65,
      "autonomy": 0.3,
      "creativity": 0.3
    },
    "skills": [
      "Nursing observation",
      "Care handover",
      "Patient education"
    ],
    "entry": {
      "education": "associate",
      "professionalLicenses": [
        "護理師考試及證書、執業登記；須符合護理教育與實習資格"
      ],
      "certifications": []
    },
    "barrier": "very_high",
    "related": [
      "occupational_therapist",
      "clinical_research_coordinator"
    ],
    "experiment": "用虛構班表整理照護交接，觀察自己是否喜歡細節追蹤與持續溝通。"
  }),
  createCareer({
    "id": "pharmacist",
    "zh": "藥師",
    "en": "Pharmacist",
    "aliases": [
      "藥劑師",
      "社區藥師"
    ],
    "family": "healthcare",
    "description": "核對處方與藥品、處理調劑，說明用藥資訊並管理藥事紀錄。",
    "tasks": [
      "核對處方並處理疑義",
      "依法調劑及提供用藥說明",
      "管理藥品與相關紀錄"
    ],
    "talents": {
      "precision": 0.92,
      "analytical_reasoning": 0.85,
      "communication": 0.78,
      "persistence": 0.71
    },
    "themes": {
      "making": 0.25,
      "people": 0.92,
      "service": 0.85,
      "systems": 0.72,
      "data": 0.72,
      "creative_expression": 0.2
    },
    "workStyle": {
      "hands_on": 0.58,
      "detail_focused": 0.85,
      "collaborative": 0.8,
      "independent": 0.3
    },
    "environment": {
      "socialDensity": 0.85,
      "pace": 0.55,
      "ambiguity": 0.35,
      "mobility": 0.35,
      "risk": 0.3,
      "repetition": 0.8,
      "emotionalLabor": 0.85,
      "structure": 0.9
    },
    "values": {
      "mastery": 0.85,
      "service": 0.92,
      "stability": 0.65,
      "autonomy": 0.3,
      "creativity": 0.3
    },
    "skills": [
      "Prescription review",
      "Medication counseling",
      "Pharmacy records"
    ],
    "entry": {
      "education": "bachelor",
      "professionalLicenses": [
        "藥師考試及證書、執業登記；須符合藥學教育與實習資格"
      ],
      "certifications": []
    },
    "barrier": "very_high",
    "related": [
      "occupational_therapist",
      "clinical_research_coordinator"
    ],
    "experiment": "用無真實藥品的虛構標籤練習資料核對，不提供實際用藥建議。"
  }),
  createCareer({
    "id": "veterinarian",
    "zh": "獸醫師",
    "en": "Veterinarian",
    "aliases": [
      "獸醫",
      "動物醫生"
    ],
    "family": "healthcare",
    "description": "評估動物健康、與飼主溝通診療，依工作場域參與動物防疫或照護。",
    "tasks": [
      "蒐集動物病史並進行專業診療",
      "向飼主說明照護與追蹤",
      "記錄病例並維持診療品質"
    ],
    "talents": {
      "analytical_reasoning": 0.92,
      "precision": 0.85,
      "communication": 0.78,
      "emotional_perception": 0.71
    },
    "themes": {
      "making": 0.25,
      "people": 0.92,
      "service": 0.85,
      "systems": 0.35,
      "data": 0.72,
      "creative_expression": 0.2
    },
    "workStyle": {
      "hands_on": 0.58,
      "detail_focused": 0.85,
      "collaborative": 0.8,
      "independent": 0.3
    },
    "environment": {
      "socialDensity": 0.85,
      "pace": 0.55,
      "ambiguity": 0.35,
      "mobility": 0.35,
      "risk": 0.3,
      "repetition": 0.45,
      "emotionalLabor": 0.85,
      "structure": 0.55
    },
    "values": {
      "mastery": 0.85,
      "service": 0.92,
      "stability": 0.65,
      "autonomy": 0.3,
      "creativity": 0.3
    },
    "skills": [
      "Veterinary assessment",
      "Owner communication",
      "Veterinary records"
    ],
    "entry": {
      "education": "bachelor",
      "professionalLicenses": [
        "獸醫師考試及證書、執業登記；須符合獸醫教育及實習資格"
      ],
      "certifications": []
    },
    "barrier": "very_high",
    "related": [
      "occupational_therapist",
      "clinical_research_coordinator"
    ],
    "experiment": "閱讀公開獸醫工作訪談，整理與飼主溝通、值班及醫療訓練的真實負擔。"
  }),
  createCareer({
    "id": "lawyer",
    "zh": "律師",
    "en": "Lawyer",
    "aliases": [
      "執業律師",
      "法律顧問"
    ],
    "family": "consulting",
    "description": "理解當事人的問題，查核事實與法規，提供法律意見並處理案件。",
    "tasks": [
      "訪談當事人並整理證據",
      "研究法規並分析可行方案",
      "撰寫法律文件與說明案件進度"
    ],
    "talents": {
      "verbal_reasoning": 0.92,
      "analytical_reasoning": 0.85,
      "precision": 0.78,
      "conflict_navigation": 0.71
    },
    "themes": {
      "making": 0.25,
      "people": 0.92,
      "service": 0.85,
      "systems": 0.35,
      "data": 0.72,
      "creative_expression": 0.2
    },
    "workStyle": {
      "hands_on": 0.58,
      "detail_focused": 0.85,
      "collaborative": 0.8,
      "independent": 0.6
    },
    "environment": {
      "socialDensity": 0.85,
      "pace": 0.55,
      "ambiguity": 0.72,
      "mobility": 0.35,
      "risk": 0.3,
      "repetition": 0.45,
      "emotionalLabor": 0.85,
      "structure": 0.55
    },
    "values": {
      "mastery": 0.85,
      "service": 0.92,
      "stability": 0.65,
      "autonomy": 0.8,
      "creativity": 0.3
    },
    "skills": [
      "Legal research",
      "Evidence organization",
      "Legal writing"
    ],
    "entry": {
      "education": "bachelor",
      "professionalLicenses": [
        "律師考試及職前訓練合格，並完成依法執業所需程序"
      ],
      "certifications": []
    },
    "barrier": "very_high",
    "related": [
      "policy_researcher",
      "management_consultant"
    ],
    "experiment": "替虛構爭議整理時間線、證據與待問問題，不代替個案法律意見。"
  }),
  createCareer({
    "id": "social_worker",
    "zh": "社會工作師",
    "en": "Social Worker",
    "aliases": [
      "社工",
      "社工師"
    ],
    "family": "public_service",
    "description": "了解個人與家庭的困難，連結資源並持續追蹤服務計畫。",
    "tasks": [
      "訪談服務對象並評估需求",
      "協調福利與社區支持資源",
      "記錄服務及追蹤後續狀況"
    ],
    "talents": {
      "emotional_perception": 0.92,
      "communication": 0.85,
      "coordination": 0.78,
      "conflict_navigation": 0.71
    },
    "themes": {
      "making": 0.25,
      "people": 0.92,
      "service": 0.85,
      "systems": 0.35,
      "data": 0.2,
      "creative_expression": 0.2
    },
    "workStyle": {
      "hands_on": 0.58,
      "detail_focused": 0.55,
      "collaborative": 0.8,
      "independent": 0.3
    },
    "environment": {
      "socialDensity": 0.85,
      "pace": 0.55,
      "ambiguity": 0.72,
      "mobility": 0.35,
      "risk": 0.3,
      "repetition": 0.45,
      "emotionalLabor": 0.85,
      "structure": 0.55
    },
    "values": {
      "mastery": 0.85,
      "service": 0.92,
      "stability": 0.65,
      "autonomy": 0.3,
      "creativity": 0.3
    },
    "skills": [
      "Needs assessment",
      "Resource coordination",
      "Case documentation"
    ],
    "entry": {
      "education": "bachelor",
      "professionalLicenses": [
        "社會工作師考試及證書；以社會工作師身分執業須完成相應登記"
      ],
      "certifications": []
    },
    "barrier": "high",
    "related": [
      "public_program_manager",
      "emergency_management_specialist"
    ],
    "experiment": "用虛構家庭情境整理需求與資源，請專業者回饋服務界線與轉介安排。"
  }),
  createCareer({
    "id": "chef",
    "zh": "廚師",
    "en": "Chef",
    "aliases": [
      "料理師",
      "中餐廚師",
      "西餐廚師"
    ],
    "family": "hospitality",
    "description": "安排備料與出餐，兼顧口味、食品衛生、成本及廚房節奏。",
    "tasks": [
      "備料並烹調餐點",
      "確認食材保存及衛生流程",
      "協調出餐順序並控制耗損"
    ],
    "talents": {
      "planning": 0.92,
      "precision": 0.85,
      "coordination": 0.78,
      "adaptability": 0.71
    },
    "themes": {
      "making": 0.9,
      "people": 0.48,
      "service": 0.5,
      "systems": 0.35,
      "data": 0.2,
      "creative_expression": 0.2
    },
    "workStyle": {
      "hands_on": 0.9,
      "detail_focused": 0.85,
      "collaborative": 0.55,
      "independent": 0.3
    },
    "environment": {
      "socialDensity": 0.4,
      "pace": 0.85,
      "ambiguity": 0.35,
      "mobility": 0.35,
      "risk": 0.55,
      "repetition": 0.45,
      "emotionalLabor": 0.35,
      "structure": 0.55
    },
    "values": {
      "mastery": 0.85,
      "service": 0.5,
      "stability": 0.65,
      "autonomy": 0.3,
      "creativity": 0.3
    },
    "skills": [
      "Food preparation",
      "Kitchen coordination",
      "Food hygiene"
    ],
    "entry": {
      "education": "secondary",
      "professionalLicenses": [],
      "certifications": []
    },
    "barrier": "medium",
    "related": [
      "guest_experience_manager",
      "hotel_operations_manager"
    ],
    "experiment": "在家做一道熟悉料理，記錄備料、清潔、時間與食材成本。"
  }),
  createCareer({
    "id": "baker",
    "zh": "烘焙師",
    "en": "Baker",
    "aliases": [
      "麵包師",
      "甜點師",
      "糕點師"
    ],
    "family": "hospitality",
    "description": "依配方製作麵包與糕點，反覆控制製程並規劃產量與交付。",
    "tasks": [
      "秤量材料並執行配方",
      "觀察製程與成品質量",
      "安排批次、清潔及訂單交付"
    ],
    "talents": {
      "precision": 0.92,
      "persistence": 0.85,
      "planning": 0.78,
      "spatial_mechanical": 0.71
    },
    "themes": {
      "making": 0.9,
      "people": 0.48,
      "service": 0.5,
      "systems": 0.35,
      "data": 0.2,
      "creative_expression": 0.88
    },
    "workStyle": {
      "hands_on": 0.9,
      "detail_focused": 0.85,
      "collaborative": 0.55,
      "independent": 0.3
    },
    "environment": {
      "socialDensity": 0.4,
      "pace": 0.55,
      "ambiguity": 0.35,
      "mobility": 0.35,
      "risk": 0.55,
      "repetition": 0.8,
      "emotionalLabor": 0.35,
      "structure": 0.55
    },
    "values": {
      "mastery": 0.85,
      "service": 0.5,
      "stability": 0.65,
      "autonomy": 0.3,
      "creativity": 0.85
    },
    "skills": [
      "Recipe control",
      "Batch planning",
      "Baking quality"
    ],
    "entry": {
      "education": "secondary",
      "professionalLicenses": [],
      "certifications": []
    },
    "barrier": "medium",
    "related": [
      "guest_experience_manager",
      "hotel_operations_manager"
    ],
    "experiment": "做一份熟悉的簡單點心，記錄重量、批次時間及下一次只想調整的一項變因。"
  }),
  createCareer({
    "id": "barista",
    "zh": "咖啡師",
    "en": "Barista",
    "aliases": [
      "咖啡店員",
      "沖煮師"
    ],
    "family": "hospitality",
    "description": "製作咖啡飲品、理解客人偏好，維持吧台品質與服務節奏。",
    "tasks": [
      "確認點單並製作飲品",
      "檢查飲品品質與吧台清潔",
      "補料並完成交班"
    ],
    "talents": {
      "precision": 0.92,
      "communication": 0.85,
      "adaptability": 0.78,
      "persistence": 0.71
    },
    "themes": {
      "making": 0.9,
      "people": 0.48,
      "service": 0.5,
      "systems": 0.35,
      "data": 0.2,
      "creative_expression": 0.2
    },
    "workStyle": {
      "hands_on": 0.9,
      "detail_focused": 0.85,
      "collaborative": 0.55,
      "independent": 0.3
    },
    "environment": {
      "socialDensity": 0.4,
      "pace": 0.85,
      "ambiguity": 0.35,
      "mobility": 0.35,
      "risk": 0.55,
      "repetition": 0.8,
      "emotionalLabor": 0.35,
      "structure": 0.55
    },
    "values": {
      "mastery": 0.85,
      "service": 0.5,
      "stability": 0.65,
      "autonomy": 0.3,
      "creativity": 0.3
    },
    "skills": [
      "Beverage preparation",
      "Order verification",
      "Bar hygiene"
    ],
    "entry": {
      "education": "secondary",
      "professionalLicenses": [],
      "certifications": []
    },
    "barrier": "low",
    "related": [
      "guest_experience_manager",
      "hotel_operations_manager"
    ],
    "experiment": "觀察一家店的點單到取餐流程，畫出尖峰時最容易出錯的交接點。"
  }),
  createCareer({
    "id": "retail_associate",
    "zh": "門市銷售人員",
    "en": "Retail Associate",
    "aliases": [
      "店員",
      "門市人員",
      "零售業",
      "專櫃人員"
    ],
    "family": "sales",
    "description": "了解顧客需要、介紹商品，處理結帳、陳列與門市日常。",
    "tasks": [
      "詢問顧客需要並介紹商品",
      "處理收銀與售後流程",
      "補貨、盤點與維持陳列"
    ],
    "talents": {
      "communication": 0.92,
      "emotional_perception": 0.85,
      "precision": 0.78,
      "adaptability": 0.71
    },
    "themes": {
      "making": 0.25,
      "people": 0.92,
      "service": 0.85,
      "systems": 0.35,
      "data": 0.2,
      "creative_expression": 0.2
    },
    "workStyle": {
      "hands_on": 0.58,
      "detail_focused": 0.85,
      "collaborative": 0.8,
      "independent": 0.3
    },
    "environment": {
      "socialDensity": 0.85,
      "pace": 0.55,
      "ambiguity": 0.35,
      "mobility": 0.35,
      "risk": 0.3,
      "repetition": 0.45,
      "emotionalLabor": 0.85,
      "structure": 0.55
    },
    "values": {
      "mastery": 0.85,
      "service": 0.92,
      "stability": 0.65,
      "autonomy": 0.3,
      "creativity": 0.3
    },
    "skills": [
      "Needs discovery",
      "Product presentation",
      "Stock checks"
    ],
    "entry": {
      "education": "secondary",
      "professionalLicenses": [],
      "certifications": []
    },
    "barrier": "low",
    "related": [
      "account_executive",
      "guest_experience_manager"
    ],
    "experiment": "挑一件熟悉商品，練習先問需要再介紹，記錄對方仍不理解的資訊。"
  }),
  createCareer({
    "id": "warehouse_operator",
    "zh": "倉儲物流人員",
    "en": "Warehouse Operator",
    "aliases": [
      "倉管",
      "物流人員",
      "理貨員",
      "揀貨員"
    ],
    "family": "operations",
    "description": "核對貨品數量與位置，完成入庫、揀貨、包裝及出貨交接。",
    "tasks": [
      "核對貨品並記錄庫位",
      "按訂單揀貨及覆核",
      "記錄異常並完成出貨交接"
    ],
    "talents": {
      "precision": 0.92,
      "planning": 0.85,
      "persistence": 0.78,
      "spatial_mechanical": 0.71
    },
    "themes": {
      "making": 0.9,
      "people": 0.48,
      "service": 0.5,
      "systems": 0.72,
      "data": 0.2,
      "creative_expression": 0.2
    },
    "workStyle": {
      "hands_on": 0.9,
      "detail_focused": 0.85,
      "collaborative": 0.55,
      "independent": 0.3
    },
    "environment": {
      "socialDensity": 0.4,
      "pace": 0.55,
      "ambiguity": 0.35,
      "mobility": 0.35,
      "risk": 0.55,
      "repetition": 0.8,
      "emotionalLabor": 0.35,
      "structure": 0.55
    },
    "values": {
      "mastery": 0.85,
      "service": 0.5,
      "stability": 0.65,
      "autonomy": 0.3,
      "creativity": 0.3
    },
    "skills": [
      "Order picking",
      "Inventory checks",
      "Dispatch records"
    ],
    "entry": {
      "education": "secondary",
      "professionalLicenses": [],
      "certifications": []
    },
    "barrier": "low",
    "related": [
      "supply_chain_planner",
      "industrial_engineer"
    ],
    "experiment": "用家中物品模擬三張訂單的揀貨覆核，記錄如何避免混單，不操作搬運設備。"
  }),
  createCareer({
    "id": "farmer",
    "zh": "農業生產工作者",
    "en": "Farmer",
    "aliases": [
      "農夫",
      "農民",
      "種植人員",
      "農業"
    ],
    "family": "skilled_technical",
    "description": "依作物與季節安排田間工作，觀察生長狀況並管理採收與銷售。",
    "tasks": [
      "觀察作物並記錄田間變化",
      "安排栽培、採收與分級",
      "追蹤成本並協調銷售通路"
    ],
    "talents": {
      "pattern_recognition": 0.92,
      "planning": 0.85,
      "persistence": 0.78,
      "adaptability": 0.71
    },
    "themes": {
      "making": 0.9,
      "people": 0.48,
      "service": 0.5,
      "systems": 0.35,
      "data": 0.2,
      "creative_expression": 0.2
    },
    "workStyle": {
      "hands_on": 0.9,
      "detail_focused": 0.55,
      "collaborative": 0.55,
      "independent": 0.6
    },
    "environment": {
      "socialDensity": 0.4,
      "pace": 0.55,
      "ambiguity": 0.72,
      "mobility": 0.8,
      "risk": 0.55,
      "repetition": 0.45,
      "emotionalLabor": 0.35,
      "structure": 0.55
    },
    "values": {
      "mastery": 0.85,
      "service": 0.5,
      "stability": 0.65,
      "autonomy": 0.8,
      "creativity": 0.3
    },
    "skills": [
      "Crop observation",
      "Harvest planning",
      "Farm cost records"
    ],
    "entry": {
      "education": "secondary",
      "professionalLicenses": [],
      "certifications": []
    },
    "barrier": "medium",
    "related": [
      "electrician",
      "cnc_technician"
    ],
    "experiment": "觀察一株安全的盆栽一週，記錄天氣與變化，或參加合法農場導覽了解勞動節奏。"
  }),
  createCareer({
    "id": "auto_mechanic",
    "zh": "汽車維修技師",
    "en": "Auto Mechanic",
    "aliases": [
      "汽修技師",
      "修車師傅",
      "汽車修護"
    ],
    "family": "skilled_technical",
    "description": "檢查車況、判讀故障並維修，向車主說明範圍與後續保養。",
    "tasks": [
      "蒐集故障描述並檢查車況",
      "依程序維修與確認品質",
      "記錄工單並向車主說明"
    ],
    "talents": {
      "spatial_mechanical": 0.92,
      "analytical_reasoning": 0.85,
      "precision": 0.78,
      "persistence": 0.71
    },
    "themes": {
      "making": 0.9,
      "people": 0.48,
      "service": 0.5,
      "systems": 0.72,
      "data": 0.2,
      "creative_expression": 0.2
    },
    "workStyle": {
      "hands_on": 0.9,
      "detail_focused": 0.85,
      "collaborative": 0.55,
      "independent": 0.3
    },
    "environment": {
      "socialDensity": 0.4,
      "pace": 0.55,
      "ambiguity": 0.35,
      "mobility": 0.35,
      "risk": 0.55,
      "repetition": 0.45,
      "emotionalLabor": 0.35,
      "structure": 0.55
    },
    "values": {
      "mastery": 0.85,
      "service": 0.5,
      "stability": 0.65,
      "autonomy": 0.3,
      "creativity": 0.3
    },
    "skills": [
      "Vehicle diagnosis",
      "Work order management",
      "Repair verification"
    ],
    "entry": {
      "education": "certificate",
      "professionalLicenses": [],
      "certifications": []
    },
    "barrier": "medium",
    "related": [
      "electrician",
      "cnc_technician"
    ],
    "experiment": "用虛構工單整理車主描述、待檢查項目與報價授權，不自行拆修車輛。"
  }),
  createCareer({
    "id": "hair_stylist",
    "zh": "美髮設計師",
    "en": "Hair Stylist",
    "aliases": [
      "髮型師",
      "美髮師",
      "髮型設計師"
    ],
    "family": "creative",
    "description": "理解客人的造型與維護需求，提供剪髮、造型等服務並維持衛生。",
    "tasks": [
      "詢問髮型期待與日常整理習慣",
      "設計並執行合適的造型服務",
      "說明維護方式與預約安排"
    ],
    "talents": {
      "creative_ideation": 0.92,
      "spatial_mechanical": 0.85,
      "communication": 0.78,
      "precision": 0.71
    },
    "themes": {
      "making": 0.9,
      "people": 0.48,
      "service": 0.5,
      "systems": 0.35,
      "data": 0.2,
      "creative_expression": 0.88
    },
    "workStyle": {
      "hands_on": 0.9,
      "detail_focused": 0.85,
      "collaborative": 0.55,
      "independent": 0.6
    },
    "environment": {
      "socialDensity": 0.4,
      "pace": 0.55,
      "ambiguity": 0.35,
      "mobility": 0.35,
      "risk": 0.55,
      "repetition": 0.45,
      "emotionalLabor": 0.35,
      "structure": 0.55
    },
    "values": {
      "mastery": 0.85,
      "service": 0.5,
      "stability": 0.65,
      "autonomy": 0.8,
      "creativity": 0.85
    },
    "skills": [
      "Hair consultation",
      "Hair design",
      "Salon hygiene"
    ],
    "entry": {
      "education": "certificate",
      "professionalLicenses": [],
      "certifications": []
    },
    "barrier": "medium",
    "related": [
      "exhibition_designer",
      "copywriter"
    ],
    "experiment": "替虛構客人做兩款髮型參考板，說明日常整理時間、費用與溝通重點。"
  }),
  createCareer({
    "id": "fitness_coach",
    "zh": "健身教練",
    "en": "Fitness Coach",
    "aliases": [
      "私人教練",
      "體適能教練",
      "運動教練"
    ],
    "family": "education",
    "description": "了解學員目標與限制，在專業範圍內指導訓練並追蹤參與情況。",
    "tasks": [
      "了解訓練目標與可投入時間",
      "依專業範圍示範並觀察動作",
      "追蹤出席、回饋與進度"
    ],
    "talents": {
      "communication": 0.92,
      "emotional_perception": 0.85,
      "planning": 0.78,
      "adaptability": 0.71,
      "initiative": 0.8,
      "teaching_coaching": 0.95
    },
    "themes": {
      "making": 0.8,
      "people": 0.92,
      "service": 0.85,
      "systems": 0.35,
      "data": 0.2,
      "creative_expression": 0.2,
      "persuasion": 0.85
    },
    "workStyle": {
      "hands_on": 0.9,
      "detail_focused": 0.55,
      "collaborative": 0.8,
      "independent": 0.7
    },
    "environment": {
      "socialDensity": 0.6,
      "pace": 0.65,
      "ambiguity": 0.35,
      "mobility": 0.35,
      "risk": 0.3,
      "repetition": 0.6,
      "emotionalLabor": 0.85,
      "structure": 0.35
    },
    "values": {
      "mastery": 0.85,
      "service": 0.92,
      "stability": 0.65,
      "autonomy": 0.65,
      "creativity": 0.3
    },
    "skills": [
      "Goal interviewing",
      "Exercise coaching",
      "Attendance tracking"
    ],
    "entry": {
      "education": "certificate",
      "professionalLicenses": [],
      "certifications": []
    },
    "barrier": "medium",
    "related": [
      "instructional_designer",
      "learning_development_specialist"
    ],
    "experiment": "用虛構學員資料安排習慣追蹤與回饋，不開立訓練處方或處理傷病。"
  }),
  createCareer({
    "id": "civil_engineer",
    "zh": "土木工程師",
    "en": "Civil Engineer",
    "aliases": [
      "土木",
      "營建工程師"
    ],
    "family": "engineering",
    "description": "規劃及檢查土木工程，協調圖面、施工條件與工程品質。",
    "tasks": [
      "閱讀圖面與核對工程條件",
      "協調施工進度與品質紀錄",
      "整理估算及現場問題"
    ],
    "talents": {
      "spatial_mechanical": 0.92,
      "analytical_reasoning": 0.85,
      "precision": 0.78,
      "planning": 0.71
    },
    "themes": {
      "making": 0.25,
      "people": 0.48,
      "service": 0.5,
      "systems": 0.35,
      "data": 0.2,
      "creative_expression": 0.2
    },
    "workStyle": {
      "hands_on": 0.58,
      "detail_focused": 0.85,
      "collaborative": 0.55,
      "independent": 0.3
    },
    "environment": {
      "socialDensity": 0.4,
      "pace": 0.55,
      "ambiguity": 0.35,
      "mobility": 0.35,
      "risk": 0.3,
      "repetition": 0.45,
      "emotionalLabor": 0.35,
      "structure": 0.55
    },
    "values": {
      "mastery": 0.85,
      "service": 0.5,
      "stability": 0.65,
      "autonomy": 0.3,
      "creativity": 0.3
    },
    "skills": [
      "Engineering drawings",
      "Construction coordination",
      "Quality records"
    ],
    "entry": {
      "education": "bachelor",
      "professionalLicenses": [],
      "certifications": []
    },
    "barrier": "high",
    "related": [
      "mechanical_engineer",
      "industrial_engineer"
    ],
    "experiment": "閱讀公開工程案例，整理圖面、施工與驗收各需要確認的資訊。"
  }),
  createCareer({
    "id": "construction_worker",
    "zh": "營建施工人員",
    "en": "Construction Worker",
    "aliases": [
      "營建工",
      "泥作工",
      "模板工",
      "工地人員"
    ],
    "family": "skilled_technical",
    "description": "依工種與現場規範施作，配合團隊維持施工品質及安全。",
    "tasks": [
      "確認當日工項與施工條件",
      "依專業工種配合現場施作",
      "檢查完成情況並整理工區"
    ],
    "talents": {
      "spatial_mechanical": 0.92,
      "precision": 0.85,
      "persistence": 0.78,
      "coordination": 0.71
    },
    "themes": {
      "making": 0.9,
      "people": 0.48,
      "service": 0.5,
      "systems": 0.35,
      "data": 0.2,
      "creative_expression": 0.2
    },
    "workStyle": {
      "hands_on": 0.9,
      "detail_focused": 0.85,
      "collaborative": 0.55,
      "independent": 0.3
    },
    "environment": {
      "socialDensity": 0.4,
      "pace": 0.55,
      "ambiguity": 0.35,
      "mobility": 0.35,
      "risk": 0.55,
      "repetition": 0.45,
      "emotionalLabor": 0.35,
      "structure": 0.55
    },
    "values": {
      "mastery": 0.85,
      "service": 0.5,
      "stability": 0.65,
      "autonomy": 0.3,
      "creativity": 0.3
    },
    "skills": [
      "Site preparation",
      "Trade execution",
      "Site housekeeping"
    ],
    "entry": {
      "education": "secondary",
      "professionalLicenses": [],
      "certifications": []
    },
    "barrier": "medium",
    "related": [
      "electrician",
      "cnc_technician"
    ],
    "experiment": "以模型或紙卡排列一道工序，訪談師傅了解體力、天候與安全限制。"
  }),
  createCareer({
    "id": "delivery_driver",
    "zh": "配送司機",
    "en": "Delivery Driver",
    "aliases": [
      "貨運司機",
      "送貨員",
      "物流司機"
    ],
    "family": "operations",
    "description": "核對貨品與路線，依交通和交付規範完成配送並處理異常。",
    "tasks": [
      "檢查貨單與安排配送路線",
      "依車種資格駕駛及完成交付",
      "記錄未交付原因與回報"
    ],
    "talents": {
      "planning": 0.92,
      "precision": 0.85,
      "adaptability": 0.78,
      "persistence": 0.71
    },
    "themes": {
      "making": 0.9,
      "people": 0.48,
      "service": 0.5,
      "systems": 0.35,
      "data": 0.2,
      "creative_expression": 0.2
    },
    "workStyle": {
      "hands_on": 0.8,
      "detail_focused": 0.85,
      "collaborative": 0.55,
      "independent": 0.85
    },
    "environment": {
      "socialDensity": 0.35,
      "pace": 0.8,
      "ambiguity": 0.35,
      "mobility": 0.95,
      "risk": 0.85,
      "repetition": 0.45,
      "emotionalLabor": 0.35,
      "structure": 0.55
    },
    "values": {
      "mastery": 0.85,
      "service": 0.5,
      "stability": 0.65,
      "autonomy": 0.6,
      "creativity": 0.3
    },
    "skills": [
      "Route planning",
      "Delivery verification",
      "Transport records"
    ],
    "entry": {
      "education": "secondary",
      "professionalLicenses": [
        "符合車種的駕駛資格；營業用途依相關規定"
      ],
      "certifications": []
    },
    "barrier": "medium",
    "related": [
      "supply_chain_planner",
      "industrial_engineer"
    ],
    "experiment": "用虛構地址與時間窗排配送順序，預留交通、休息及聯絡時間。"
  }),
  createCareer({
    "id": "bus_driver",
    "zh": "客運司機",
    "en": "Bus Driver",
    "aliases": [
      "公車司機",
      "大客車駕駛"
    ],
    "family": "operations",
    "description": "依路線與規範提供載客服務，兼顧行車安全、乘客需要和勤務交接。",
    "tasks": [
      "執行出車前檢查與紀錄",
      "依規範駕駛並服務乘客",
      "回報車況與完成勤務交接"
    ],
    "talents": {
      "precision": 0.92,
      "persistence": 0.85,
      "emotional_perception": 0.78,
      "adaptability": 0.71
    },
    "themes": {
      "making": 0.9,
      "people": 0.48,
      "service": 0.5,
      "systems": 0.35,
      "data": 0.2,
      "creative_expression": 0.2
    },
    "workStyle": {
      "hands_on": 0.9,
      "detail_focused": 0.85,
      "collaborative": 0.55,
      "independent": 0.3
    },
    "environment": {
      "socialDensity": 0.4,
      "pace": 0.55,
      "ambiguity": 0.35,
      "mobility": 0.35,
      "risk": 0.55,
      "repetition": 0.45,
      "emotionalLabor": 0.35,
      "structure": 0.55
    },
    "values": {
      "mastery": 0.85,
      "service": 0.5,
      "stability": 0.65,
      "autonomy": 0.3,
      "creativity": 0.3
    },
    "skills": [
      "Vehicle checks",
      "Passenger service",
      "Driving compliance"
    ],
    "entry": {
      "education": "secondary",
      "professionalLicenses": [
        "符合營業大客車駕駛及職務要求的資格"
      ],
      "certifications": []
    },
    "barrier": "high",
    "related": [
      "supply_chain_planner",
      "industrial_engineer"
    ],
    "experiment": "閱讀客運公司公開招募介紹，整理輪班、資格、休息與乘客服務的要求。"
  }),
  createCareer({
    "id": "security_guard",
    "zh": "保全人員",
    "en": "Security Guard",
    "aliases": [
      "警衛",
      "保全",
      "駐衛保全"
    ],
    "family": "public_service",
    "description": "依服務場所規範管理出入、巡查及回報異常，維持紀錄與交接。",
    "tasks": [
      "核對訪客與管理出入",
      "巡查場所並通報異常",
      "記錄事件及交接待辦"
    ],
    "talents": {
      "precision": 0.92,
      "persistence": 0.85,
      "communication": 0.78,
      "adaptability": 0.71
    },
    "themes": {
      "making": 0.25,
      "people": 0.92,
      "service": 0.85,
      "systems": 0.35,
      "data": 0.2,
      "creative_expression": 0.2
    },
    "workStyle": {
      "hands_on": 0.58,
      "detail_focused": 0.85,
      "collaborative": 0.8,
      "independent": 0.3
    },
    "environment": {
      "socialDensity": 0.85,
      "pace": 0.55,
      "ambiguity": 0.35,
      "mobility": 0.35,
      "risk": 0.3,
      "repetition": 0.45,
      "emotionalLabor": 0.85,
      "structure": 0.55
    },
    "values": {
      "mastery": 0.85,
      "service": 0.92,
      "stability": 0.65,
      "autonomy": 0.3,
      "creativity": 0.3
    },
    "skills": [
      "Access checks",
      "Patrol reporting",
      "Shift handover"
    ],
    "entry": {
      "education": "secondary",
      "professionalLicenses": [],
      "certifications": []
    },
    "barrier": "medium",
    "related": [
      "public_program_manager",
      "emergency_management_specialist"
    ],
    "experiment": "用虛構訪客名單練習核對、聯繫與交接，不模擬追捕或強制處置。"
  }),
  createCareer({
    "id": "caregiver",
    "zh": "照顧服務員",
    "en": "Caregiver",
    "aliases": [
      "照服員",
      "長照人員",
      "看護"
    ],
    "family": "healthcare",
    "description": "在照護計畫與服務範圍內支持日常生活，觀察需要並與家屬及團隊聯繫。",
    "tasks": [
      "依計畫協助生活照顧",
      "觀察並回報服務對象變化",
      "記錄照護並維持服務界線"
    ],
    "talents": {
      "emotional_perception": 0.92,
      "persistence": 0.85,
      "precision": 0.78,
      "communication": 0.71
    },
    "themes": {
      "making": 0.25,
      "people": 0.92,
      "service": 0.85,
      "systems": 0.35,
      "data": 0.2,
      "creative_expression": 0.2
    },
    "workStyle": {
      "hands_on": 0.58,
      "detail_focused": 0.85,
      "collaborative": 0.8,
      "independent": 0.3
    },
    "environment": {
      "socialDensity": 0.85,
      "pace": 0.55,
      "ambiguity": 0.35,
      "mobility": 0.35,
      "risk": 0.3,
      "repetition": 0.45,
      "emotionalLabor": 0.85,
      "structure": 0.55
    },
    "values": {
      "mastery": 0.85,
      "service": 0.92,
      "stability": 0.65,
      "autonomy": 0.3,
      "creativity": 0.3
    },
    "skills": [
      "Daily living support",
      "Care observation",
      "Care documentation"
    ],
    "entry": {
      "education": "certificate",
      "professionalLicenses": [
        "依服務場域完成照顧服務訓練及所需資格"
      ],
      "certifications": []
    },
    "barrier": "medium",
    "related": [
      "occupational_therapist",
      "clinical_research_coordinator"
    ],
    "experiment": "用虛構服務時段安排生活支持、休息與回報，不執行移位、餵食或醫療處置。"
  }),
  createCareer({
    "id": "childcare_worker",
    "zh": "托育人員",
    "en": "Childcare Worker",
    "aliases": [
      "保母",
      "保姆",
      "托嬰人員"
    ],
    "family": "education",
    "description": "依托育規範提供嬰幼兒生活照顧、活動陪伴與家庭溝通。",
    "tasks": [
      "安排日常照顧與適齡活動",
      "觀察作息及記錄照顧狀況",
      "向家長交接與維護環境"
    ],
    "talents": {
      "emotional_perception": 0.92,
      "precision": 0.85,
      "planning": 0.78,
      "persistence": 0.71
    },
    "themes": {
      "making": 0.25,
      "people": 0.92,
      "service": 0.85,
      "systems": 0.35,
      "data": 0.2,
      "creative_expression": 0.2
    },
    "workStyle": {
      "hands_on": 0.58,
      "detail_focused": 0.85,
      "collaborative": 0.8,
      "independent": 0.3
    },
    "environment": {
      "socialDensity": 0.85,
      "pace": 0.55,
      "ambiguity": 0.35,
      "mobility": 0.35,
      "risk": 0.3,
      "repetition": 0.45,
      "emotionalLabor": 0.85,
      "structure": 0.55
    },
    "values": {
      "mastery": 0.85,
      "service": 0.92,
      "stability": 0.65,
      "autonomy": 0.3,
      "creativity": 0.3
    },
    "skills": [
      "Childcare routines",
      "Child observation",
      "Family handover"
    ],
    "entry": {
      "education": "certificate",
      "professionalLicenses": [
        "依服務型態符合托育資格、訓練與登記要求"
      ],
      "certifications": []
    },
    "barrier": "high",
    "related": [
      "instructional_designer",
      "learning_development_specialist"
    ],
    "experiment": "以虛構作息表練習日誌與家長交接，不在未具資格或無監督下照顧幼兒。"
  }),
  createCareer({
    "id": "cleaner",
    "zh": "清潔人員",
    "en": "Cleaner",
    "aliases": [
      "清潔員",
      "清潔工",
      "環境清潔人員"
    ],
    "family": "hospitality",
    "description": "依場域規範清潔與整理環境，核對清潔範圍並回報異常。",
    "tasks": [
      "確認清潔區域與用品規範",
      "分區清潔並維護動線",
      "檢查完成狀況及交接"
    ],
    "talents": {
      "precision": 0.92,
      "planning": 0.85,
      "persistence": 0.78,
      "adaptability": 0.71
    },
    "themes": {
      "making": 0.9,
      "people": 0.2,
      "service": 0.7,
      "systems": 0.35,
      "data": 0.2,
      "creative_expression": 0.2
    },
    "workStyle": {
      "hands_on": 0.9,
      "detail_focused": 0.85,
      "collaborative": 0.55,
      "independent": 0.3
    },
    "environment": {
      "socialDensity": 0.2,
      "pace": 0.55,
      "ambiguity": 0.35,
      "mobility": 0.7,
      "risk": 0.55,
      "repetition": 0.92,
      "emotionalLabor": 0.35,
      "structure": 0.85
    },
    "values": {
      "mastery": 0.6,
      "service": 0.5,
      "stability": 0.65,
      "autonomy": 0.3,
      "creativity": 0.3
    },
    "skills": [
      "Cleaning planning",
      "Cleaning procedures",
      "Site checks"
    ],
    "entry": {
      "education": "secondary",
      "professionalLicenses": [],
      "certifications": []
    },
    "barrier": "low",
    "related": [
      "guest_experience_manager",
      "hotel_operations_manager"
    ],
    "experiment": "整理熟悉的桌面區域，記錄先後順序與完成標準，不混用清潔劑。"
  }),
  createCareer({
    "id": "aquaculture_worker",
    "zh": "水產養殖人員",
    "en": "Aquaculture Worker",
    "aliases": [
      "養殖人員",
      "養魚",
      "漁業人員"
    ],
    "family": "skilled_technical",
    "description": "觀察養殖生物與水域狀況，依專業管理計畫安排生產及紀錄。",
    "tasks": [
      "觀察並記錄水質與生物狀況",
      "依管理計畫照料養殖場",
      "配合採收與整理生產紀錄"
    ],
    "talents": {
      "pattern_recognition": 0.92,
      "precision": 0.85,
      "persistence": 0.78,
      "adaptability": 0.71
    },
    "themes": {
      "making": 0.9,
      "people": 0.48,
      "service": 0.5,
      "systems": 0.35,
      "data": 0.2,
      "creative_expression": 0.2
    },
    "workStyle": {
      "hands_on": 0.9,
      "detail_focused": 0.85,
      "collaborative": 0.55,
      "independent": 0.3
    },
    "environment": {
      "socialDensity": 0.4,
      "pace": 0.55,
      "ambiguity": 0.35,
      "mobility": 0.35,
      "risk": 0.55,
      "repetition": 0.45,
      "emotionalLabor": 0.35,
      "structure": 0.55
    },
    "values": {
      "mastery": 0.85,
      "service": 0.5,
      "stability": 0.65,
      "autonomy": 0.3,
      "creativity": 0.3
    },
    "skills": [
      "Water monitoring",
      "Aquaculture husbandry",
      "Production records"
    ],
    "entry": {
      "education": "secondary",
      "professionalLicenses": [],
      "certifications": []
    },
    "barrier": "medium",
    "related": [
      "electrician",
      "cnc_technician"
    ],
    "experiment": "參加合法養殖場導覽，整理季節、監測紀錄與生產風險，不自行投藥。"
  }),
  createCareer({
    "id": "livestock_farmer",
    "zh": "畜牧飼養人員",
    "en": "Livestock Farmer",
    "aliases": [
      "畜牧人員",
      "牧場人員",
      "養豬",
      "養牛"
    ],
    "family": "skilled_technical",
    "description": "照料牧場動物，依規範維護環境、生產及動物健康紀錄。",
    "tasks": [
      "觀察動物並記錄日常狀況",
      "依規範執行飼養與環境管理",
      "配合防疫與生產作業"
    ],
    "talents": {
      "precision": 0.92,
      "persistence": 0.85,
      "pattern_recognition": 0.78,
      "planning": 0.71
    },
    "themes": {
      "making": 0.9,
      "people": 0.48,
      "service": 0.5,
      "systems": 0.35,
      "data": 0.2,
      "creative_expression": 0.2
    },
    "workStyle": {
      "hands_on": 0.9,
      "detail_focused": 0.85,
      "collaborative": 0.55,
      "independent": 0.3
    },
    "environment": {
      "socialDensity": 0.4,
      "pace": 0.55,
      "ambiguity": 0.35,
      "mobility": 0.35,
      "risk": 0.55,
      "repetition": 0.45,
      "emotionalLabor": 0.35,
      "structure": 0.55
    },
    "values": {
      "mastery": 0.85,
      "service": 0.5,
      "stability": 0.65,
      "autonomy": 0.3,
      "creativity": 0.3
    },
    "skills": [
      "Animal observation",
      "Farm hygiene",
      "Livestock records"
    ],
    "entry": {
      "education": "secondary",
      "professionalLicenses": [],
      "certifications": []
    },
    "barrier": "medium",
    "related": [
      "electrician",
      "cnc_technician"
    ],
    "experiment": "閱讀公開牧場介紹，整理每日照料、環境管理與休假安排的工作負擔。"
  }),
  createCareer({
    "id": "forestry_worker",
    "zh": "林業作業人員",
    "en": "Forestry Worker",
    "aliases": [
      "林務人員",
      "造林人員",
      "森林作業員"
    ],
    "family": "skilled_technical",
    "description": "依工作計畫參與育苗、造林、森林維護及野外觀察紀錄。",
    "tasks": [
      "配合育苗造林與林地維護",
      "觀察並記錄林地狀況",
      "依野外規範準備工作與回報"
    ],
    "talents": {
      "persistence": 0.92,
      "pattern_recognition": 0.85,
      "planning": 0.78,
      "adaptability": 0.71,
      "spatial_mechanical": 0.85
    },
    "themes": {
      "making": 0.9,
      "people": 0.48,
      "service": 0.5,
      "systems": 0.35,
      "data": 0.2,
      "creative_expression": 0.2
    },
    "workStyle": {
      "hands_on": 0.9,
      "detail_focused": 0.55,
      "collaborative": 0.55,
      "independent": 0.3
    },
    "environment": {
      "socialDensity": 0.4,
      "pace": 0.55,
      "ambiguity": 0.35,
      "mobility": 1,
      "risk": 0.85,
      "repetition": 0.45,
      "emotionalLabor": 0.35,
      "structure": 0.55
    },
    "values": {
      "mastery": 0.85,
      "service": 0.7,
      "stability": 0.65,
      "autonomy": 0.3,
      "creativity": 0.3,
      "impact": 0.85
    },
    "skills": [
      "Forest observation",
      "Site preparation",
      "Field reporting"
    ],
    "entry": {
      "education": "secondary",
      "professionalLicenses": [],
      "certifications": []
    },
    "barrier": "medium",
    "related": [
      "electrician",
      "cnc_technician"
    ],
    "experiment": "參加公開森林教育活動，了解戶外工作、季節及山區交通的限制。"
  }),
  createCareer({
    "id": "laboratory_technician",
    "zh": "實驗室技術人員",
    "en": "Laboratory Technician",
    "aliases": [
      "實驗室人員",
      "生技實驗員",
      "化學實驗員"
    ],
    "family": "research",
    "description": "依實驗室規範處理樣本、協助測試，維持可追查的紀錄與品質。",
    "tasks": [
      "核對樣本及測試條件",
      "依程序協助實驗與檢測",
      "整理數據並維護設備紀錄"
    ],
    "talents": {
      "precision": 0.92,
      "analytical_reasoning": 0.85,
      "persistence": 0.78,
      "planning": 0.71
    },
    "themes": {
      "making": 0.25,
      "people": 0.48,
      "service": 0.5,
      "systems": 0.35,
      "data": 0.2,
      "creative_expression": 0.2
    },
    "workStyle": {
      "hands_on": 0.58,
      "detail_focused": 0.85,
      "collaborative": 0.55,
      "independent": 0.3
    },
    "environment": {
      "socialDensity": 0.4,
      "pace": 0.55,
      "ambiguity": 0.35,
      "mobility": 0.35,
      "risk": 0.3,
      "repetition": 0.45,
      "emotionalLabor": 0.35,
      "structure": 0.55
    },
    "values": {
      "mastery": 0.85,
      "service": 0.5,
      "stability": 0.65,
      "autonomy": 0.3,
      "creativity": 0.3
    },
    "skills": [
      "Sample verification",
      "Laboratory procedures",
      "Laboratory records"
    ],
    "entry": {
      "education": "bachelor",
      "professionalLicenses": [],
      "certifications": []
    },
    "barrier": "high",
    "related": [
      "market_researcher",
      "clinical_research_coordinator"
    ],
    "experiment": "用虛構樣本編號檢查標示與數據完整性，不操作化學品或生物材料。"
  }),
  createCareer({
    "id": "electronics_engineer",
    "zh": "電子工程師",
    "en": "Electronics Engineer",
    "aliases": [
      "電子研發工程師",
      "硬體工程師"
    ],
    "family": "engineering",
    "description": "設計與測試電子硬體，判讀量測資料並協助改善產品可靠性。",
    "tasks": [
      "整理硬體規格與設計需求",
      "規劃測試並分析問題",
      "與製造團隊確認版本與品質"
    ],
    "talents": {
      "analytical_reasoning": 0.92,
      "spatial_mechanical": 0.85,
      "precision": 0.78,
      "learning_agility": 0.71
    },
    "themes": {
      "making": 0.25,
      "people": 0.48,
      "service": 0.5,
      "systems": 0.35,
      "data": 0.2,
      "creative_expression": 0.2
    },
    "workStyle": {
      "hands_on": 0.58,
      "detail_focused": 0.85,
      "collaborative": 0.55,
      "independent": 0.3
    },
    "environment": {
      "socialDensity": 0.4,
      "pace": 0.55,
      "ambiguity": 0.35,
      "mobility": 0.35,
      "risk": 0.3,
      "repetition": 0.45,
      "emotionalLabor": 0.35,
      "structure": 0.55
    },
    "values": {
      "mastery": 0.85,
      "service": 0.5,
      "stability": 0.65,
      "autonomy": 0.3,
      "creativity": 0.3
    },
    "skills": [
      "Hardware requirements",
      "Test analysis",
      "Design verification"
    ],
    "entry": {
      "education": "bachelor",
      "professionalLicenses": [],
      "certifications": []
    },
    "barrier": "high",
    "related": [
      "mechanical_engineer",
      "industrial_engineer"
    ],
    "experiment": "用虛構測試結果整理異常與待確認的設計條件，不自行接電或拆機。"
  }),
  createCareer({
    "id": "translator",
    "zh": "翻譯人員",
    "en": "Translator",
    "aliases": [
      "譯者",
      "筆譯",
      "翻譯師"
    ],
    "family": "media",
    "description": "理解原文目的與語境，完成譯文、用語查證與品質核對。",
    "tasks": [
      "釐清用途並閱讀原文",
      "翻譯及查核專有用語",
      "覆核譯文並處理回饋"
    ],
    "talents": {
      "verbal_reasoning": 0.92,
      "precision": 0.85,
      "learning_agility": 0.78,
      "persistence": 0.71
    },
    "themes": {
      "making": 0.25,
      "people": 0.48,
      "service": 0.5,
      "systems": 0.35,
      "data": 0.2,
      "creative_expression": 0.2
    },
    "workStyle": {
      "hands_on": 0.58,
      "detail_focused": 0.85,
      "collaborative": 0.55,
      "independent": 0.3
    },
    "environment": {
      "socialDensity": 0.4,
      "pace": 0.55,
      "ambiguity": 0.35,
      "mobility": 0.35,
      "risk": 0.3,
      "repetition": 0.45,
      "emotionalLabor": 0.35,
      "structure": 0.55
    },
    "values": {
      "mastery": 0.85,
      "service": 0.5,
      "stability": 0.65,
      "autonomy": 0.3,
      "creativity": 0.3
    },
    "skills": [
      "Translation",
      "Terminology research",
      "Translation review"
    ],
    "entry": {
      "education": "bachelor",
      "professionalLicenses": [],
      "certifications": []
    },
    "barrier": "medium",
    "related": [
      "journalist",
      "video_editor"
    ],
    "experiment": "翻譯一段有授權的公開短文，記錄用語查核與修訂理由。"
  }),
  createCareer({
    "id": "insurance_agent",
    "zh": "保險業務員",
    "en": "Insurance Agent",
    "aliases": [
      "保險業務",
      "保險顧問"
    ],
    "family": "sales",
    "description": "了解客戶保障需求，說明保單條件並依規範處理投保與服務。",
    "tasks": [
      "訪談需求與說明保障條件",
      "核對投保資料並依規範送件",
      "追蹤服務需求及保單異動"
    ],
    "talents": {
      "communication": 0.92,
      "precision": 0.85,
      "emotional_perception": 0.78,
      "initiative": 0.71
    },
    "themes": {
      "making": 0.25,
      "people": 0.92,
      "service": 0.85,
      "systems": 0.35,
      "data": 0.2,
      "creative_expression": 0.2
    },
    "workStyle": {
      "hands_on": 0.58,
      "detail_focused": 0.85,
      "collaborative": 0.8,
      "independent": 0.3
    },
    "environment": {
      "socialDensity": 0.85,
      "pace": 0.55,
      "ambiguity": 0.35,
      "mobility": 0.35,
      "risk": 0.3,
      "repetition": 0.45,
      "emotionalLabor": 0.85,
      "structure": 0.55
    },
    "values": {
      "mastery": 0.85,
      "service": 0.92,
      "stability": 0.65,
      "autonomy": 0.3,
      "creativity": 0.3
    },
    "skills": [
      "Coverage discovery",
      "Policy explanation",
      "Application checks"
    ],
    "entry": {
      "education": "secondary",
      "professionalLicenses": [
        "依銷售商品完成相關測驗與登錄資格"
      ],
      "certifications": []
    },
    "barrier": "medium",
    "related": [
      "account_executive",
      "guest_experience_manager"
    ],
    "experiment": "用虛構保單比較保障、除外與費用，不對真實個案推薦投保。"
  }),
  createCareer({
    "id": "administrative_assistant",
    "zh": "行政助理",
    "en": "Administrative Assistant",
    "aliases": [
      "行政人員",
      "行政專員",
      "文書人員"
    ],
    "family": "operations",
    "description": "整理文件、安排庶務與協調時程，讓團隊日常運作順利。",
    "tasks": [
      "整理文件與維護資料",
      "安排會議並追蹤待辦",
      "處理庶務及跨窗口聯繫"
    ],
    "talents": {
      "precision": 0.92,
      "planning": 0.85,
      "coordination": 0.78,
      "communication": 0.71
    },
    "themes": {
      "making": 0.9,
      "people": 0.48,
      "service": 0.5,
      "systems": 0.35,
      "data": 0.2,
      "creative_expression": 0.2
    },
    "workStyle": {
      "hands_on": 0.9,
      "detail_focused": 0.85,
      "collaborative": 0.55,
      "independent": 0.3
    },
    "environment": {
      "socialDensity": 0.4,
      "pace": 0.55,
      "ambiguity": 0.35,
      "mobility": 0.35,
      "risk": 0.55,
      "repetition": 0.45,
      "emotionalLabor": 0.35,
      "structure": 0.55
    },
    "values": {
      "mastery": 0.85,
      "service": 0.5,
      "stability": 0.65,
      "autonomy": 0.3,
      "creativity": 0.3
    },
    "skills": [
      "Document management",
      "Meeting coordination",
      "Task tracking"
    ],
    "entry": {
      "education": "secondary",
      "professionalLicenses": [],
      "certifications": []
    },
    "barrier": "low",
    "related": [
      "supply_chain_planner",
      "industrial_engineer"
    ],
    "experiment": "替虛構會議安排通知、資料核對與待辦追蹤表。"
  }),
  createCareer({
    "id": "flight_attendant",
    "zh": "空服員",
    "en": "Flight Attendant",
    "aliases": [
      "空服人員",
      "航空客艙組員"
    ],
    "family": "travel",
    "description": "接受航空公司訓練，依規範維持客艙安全並提供旅客服務。",
    "tasks": [
      "依程序執行客艙安全檢查",
      "照顧旅客並處理服務需要",
      "與組員合作並完成勤務交接"
    ],
    "talents": {
      "coordination": 0.92,
      "communication": 0.85,
      "precision": 0.78,
      "adaptability": 0.71
    },
    "themes": {
      "making": 0.25,
      "people": 0.48,
      "service": 0.5,
      "systems": 0.35,
      "data": 0.2,
      "creative_expression": 0.2
    },
    "workStyle": {
      "hands_on": 0.58,
      "detail_focused": 0.85,
      "collaborative": 0.55,
      "independent": 0.3
    },
    "environment": {
      "socialDensity": 0.4,
      "pace": 0.55,
      "ambiguity": 0.35,
      "mobility": 0.35,
      "risk": 0.3,
      "repetition": 0.45,
      "emotionalLabor": 0.35,
      "structure": 0.55
    },
    "values": {
      "mastery": 0.85,
      "service": 0.5,
      "stability": 0.65,
      "autonomy": 0.3,
      "creativity": 0.3
    },
    "skills": [
      "Cabin readiness",
      "Passenger service",
      "Crew coordination"
    ],
    "entry": {
      "education": "associate",
      "professionalLicenses": [
        "通過航空公司甄選與相應訓練、考核及健康要求"
      ],
      "certifications": []
    },
    "barrier": "high",
    "related": [
      "tour_operations_specialist",
      "guest_experience_manager"
    ],
    "experiment": "閱讀航空公司公開招募資料，整理輪班、訓練、服務與生活作息的取捨。"
  }),
  createCareer({
    "id": "dentist",
    "zh": "牙醫師",
    "en": "Dentist",
    "aliases": [
      "牙醫",
      "牙科醫師"
    ],
    "family": "healthcare",
    "description": "評估口腔健康並提供診療，說明治療選擇、照護與追蹤。",
    "tasks": [
      "專業評估口腔健康",
      "執行牙科治療並說明選擇",
      "紀錄診療及安排追蹤"
    ],
    "talents": {
      "precision": 0.92,
      "spatial_mechanical": 0.85,
      "analytical_reasoning": 0.78,
      "communication": 0.71
    },
    "themes": {
      "making": 0.25,
      "people": 0.92,
      "service": 0.85,
      "systems": 0.35,
      "data": 0.2,
      "creative_expression": 0.2
    },
    "workStyle": {
      "hands_on": 0.58,
      "detail_focused": 0.85,
      "collaborative": 0.8,
      "independent": 0.3
    },
    "environment": {
      "socialDensity": 0.85,
      "pace": 0.55,
      "ambiguity": 0.35,
      "mobility": 0.35,
      "risk": 0.3,
      "repetition": 0.45,
      "emotionalLabor": 0.85,
      "structure": 0.55
    },
    "values": {
      "mastery": 0.85,
      "service": 0.92,
      "stability": 0.65,
      "autonomy": 0.3,
      "creativity": 0.3
    },
    "skills": [
      "Dental assessment",
      "Dental treatment",
      "Patient communication"
    ],
    "entry": {
      "education": "bachelor",
      "professionalLicenses": [
        "牙醫師考試及證書、執業登記；須符合牙醫教育與實習資格"
      ],
      "certifications": []
    },
    "barrier": "very_high",
    "related": [
      "occupational_therapist",
      "clinical_research_coordinator"
    ],
    "experiment": "用虛構門診情境練習整理病人疑問，不做口腔診斷或治療建議。"
  }),
  createCareer({
    "id": "graphic_designer",
    "zh": "平面設計師",
    "en": "Graphic Designer",
    "aliases": [
      "視覺設計師",
      "美編",
      "平面美術"
    ],
    "family": "creative",
    "description": "將文字與圖像編排成清楚的視覺，協調需求並交付可用的設計檔。",
    "tasks": [
      "釐清受眾與視覺需求",
      "製作版面與視覺提案",
      "依回饋修訂並檢查輸出"
    ],
    "talents": {
      "creative_ideation": 0.92,
      "spatial_mechanical": 0.85,
      "precision": 0.78,
      "communication": 0.71
    },
    "themes": {
      "making": 0.9,
      "people": 0.48,
      "service": 0.5,
      "systems": 0.35,
      "data": 0.2,
      "creative_expression": 0.2
    },
    "workStyle": {
      "hands_on": 0.9,
      "detail_focused": 0.85,
      "collaborative": 0.55,
      "independent": 0.3
    },
    "environment": {
      "socialDensity": 0.4,
      "pace": 0.55,
      "ambiguity": 0.35,
      "mobility": 0.35,
      "risk": 0.55,
      "repetition": 0.45,
      "emotionalLabor": 0.35,
      "structure": 0.55
    },
    "values": {
      "mastery": 0.85,
      "service": 0.5,
      "stability": 0.65,
      "autonomy": 0.3,
      "creativity": 0.3
    },
    "skills": [
      "Visual layout",
      "Design communication",
      "Print preparation"
    ],
    "entry": {
      "education": "certificate",
      "professionalLicenses": [],
      "certifications": []
    },
    "barrier": "medium",
    "related": [
      "exhibition_designer",
      "copywriter"
    ],
    "experiment": "為一場虛構活動設計海報，請人用五秒找出時間、地點與報名方式。"
  }),
  createCareer({
    "id": "interior_designer",
    "zh": "室內設計師",
    "en": "Interior Designer",
    "aliases": [
      "空間設計師",
      "室內設計"
    ],
    "family": "design",
    "description": "理解空間使用需要，規劃配置、材質與工程合作，追蹤設計落地。",
    "tasks": [
      "訪談使用需求與丈量空間",
      "繪製配置及溝通材料預算",
      "與施工人員核對設計及進度"
    ],
    "talents": {
      "spatial_mechanical": 0.92,
      "creative_ideation": 0.85,
      "precision": 0.78,
      "coordination": 0.71
    },
    "themes": {
      "making": 0.25,
      "people": 0.48,
      "service": 0.5,
      "systems": 0.35,
      "data": 0.2,
      "creative_expression": 0.2
    },
    "workStyle": {
      "hands_on": 0.58,
      "detail_focused": 0.85,
      "collaborative": 0.55,
      "independent": 0.3
    },
    "environment": {
      "socialDensity": 0.4,
      "pace": 0.55,
      "ambiguity": 0.35,
      "mobility": 0.35,
      "risk": 0.3,
      "repetition": 0.45,
      "emotionalLabor": 0.35,
      "structure": 0.55
    },
    "values": {
      "mastery": 0.85,
      "service": 0.5,
      "stability": 0.65,
      "autonomy": 0.3,
      "creativity": 0.3
    },
    "skills": [
      "Space planning",
      "Material coordination",
      "Construction drawings"
    ],
    "entry": {
      "education": "bachelor",
      "professionalLicenses": [],
      "certifications": []
    },
    "barrier": "high",
    "related": [
      "ux_designer",
      "exhibition_designer"
    ],
    "experiment": "用紙筆替熟悉房間畫兩款配置，說明動線、收納與施工待確認條件。"
  }),
] as const;
