import { plainWorkText, simpleStoryOptions } from './plain-language';
import { COMMON_LAB_CAREERS } from './common-careers';
import { FIELD_CAREERS } from './field-careers';
import type { LabCareer, Choice, EventCard, Scenario } from './types';

export const LAB_CAREERS: LabCareer[] = [
  {
    careerId: 'brand_strategist', accent: '01 / STRATEGY', hook: '讓好的品牌，被對的人看見。', skills: ['客群洞察', '訊息策略', '成效衡量'],
    scenarios: [
      { title: '一個沒人記住的品牌', background: '你加入地方燕麥飲品牌。主管希望兩週內提升知名度，但第一線說顧客根本不懂產品差異。', problem: '第一份提案要先解決觸及，還是購買理由？', routes: ['先訪談十位回購客，收斂一個購買理由', '召集業務與設計，訂共同的上市目標', '先做一個小型社群測試，保留調整空間'] },
      { title: '流量很好，訂單很少', background: '短片觀看破萬，網站卻只有少量訂單。代理商建議把剩下預算全部投入廣告。', problem: '你要如何處理流量和轉換之間的落差？', routes: ['檢查漏斗與受眾，重新測試產品頁', '與業務共同訂轉換指標並協商預算', '縮小投放，保留時間做兩版訊息測試'] },
      { title: '品牌要成長，誰來承擔？', background: '公司準備進大型通路，銷售部想降價，創辦人擔心稀釋定位。你被要求明天提出方向。', problem: '短期銷量和品牌長期價值，如何取捨？', routes: ['做價格敏感度與競品研究，建立定位依據', '帶跨部門工作坊，承擔協調與決策責任', '先試單一通路，限制風險及投入時間'] },
    ],
    mission: {
      title: '替燕麥飲做一次小型上市', minutes: '10–15', objective: '用有限預算設計一個可驗證的品牌提案。', brief: '新品售價 80 元，毛利 35 元。你有 100 點預算；以下為教學用虛構資料，請先找到值得驗證的客群。',
      info: ['健身族：到站 500 人、購買 40 人、廣告成本 2,000 元。', '通勤族：到站 1,000 人、購買 30 人、廣告成本 3,000 元。', '任務目標是先驗證回購理由，尚無長期顧客價值資料。'],
      decisions: [{ prompt: '先用哪個客群做小規模驗證？', options: ['健身族', '通勤族', '所有人'], correct: '健身族', rationale: '本題資料中健身族轉換率 8%、獲客成本 50 元；通勤族為 3%、100 元。仍需驗證回購，不能宣稱獲利。' }],
      allocation: { labels: ['受眾研究', '小額投放', '成效追蹤'], minimum: [20, 20, 20], rationale: '總和 100，三項各留至少 20 點才能同時觀察需求、投放及結果；這是本任務的限制，並非通用最佳配比。' },
      priorities: [{ id: 'claim', label: '核對產品宣稱與受眾需求' }, { id: 'launch', label: '製作廣告素材' }, { id: 'scale', label: '擴大投放' }], first: 'claim', priorityAdvice: '先核對宣稱，再製作素材，成效與風險確認後才擴大。',
      output: '寫一段客群、核心訊息及驗證指標的提案。', checks: ['我寫出了目標客群及選擇依據', '我沒有使用未經證實的健康宣稱', '我提出可觀察的指標與停止條件'], example: '先向健身族測試「運動後方便補充的植物飲」；追蹤購買率與兩週回購意願，若獲客成本仍高於可承擔範圍則先停止擴量。',
    },
  },
  {
    careerId: 'ux_researcher', accent: '02 / PEOPLE', hook: '在別人說出口之前，找到真正的問題。', skills: ['訪談設計', '研究倫理', '洞察整理'],
    scenarios: [
      { title: '主管已經有答案了', background: '團隊認定註冊流失是按鈕不夠大，要你找三位使用者證明。', problem: '怎樣讓研究還能回答真正的問題？', routes: ['先觀察使用者完成註冊，保留反例', '協調研究問題，讓團隊共同旁聽', '用低成本可用性測試先驗證一個風險'] },
      { title: '訪談不如預期', background: '五位受訪者的說法互相矛盾，設計團隊下週就要交稿。', problem: '你如何在時程壓力下交付可信的發現？', routes: ['整理行為與說法差異，標記證據限制', '召集設計與工程，區分已知和待驗證', '縮小研究範圍，只交付最關鍵風險'] },
      { title: '研究報告沒人採用', background: '你的洞察很完整，但產品團隊說無法轉成開發項目。', problem: '接下來要深化專業，還是改變合作方式？', routes: ['把發現轉成可追溯的設計原則', '帶領跨部門共同定義實驗', '以短期顧問形式支持兩個小型團隊'] },
    ],
    mission: {
      title: '診斷預約流程為何中斷', minutes: '10–20', objective: '從觀察證據形成假設，避免把個別受訪者當成所有人。', brief: '診所預約原型測試，共 5 人。你只能再安排一輪研究。',
      info: ['P1、P2、P3 在送出前找不到取消規則，因此退出。', 'P4 說顏色不好看，但完成預約；P5 無障礙讀取失敗。', '樣本為方便抽樣，不能用 3/5 推估所有顧客比例。'],
      decisions: [{ prompt: '哪個結論最受現有資料支持？', options: ['取消資訊不清是待驗證障礙', '60% 的所有顧客會退出', '只要換顏色就能解決'], correct: '取消資訊不清是待驗證障礙', rationale: '觀察支持流程障礙假設；小型非隨機樣本不支持母體比例或因果結論。' }, { prompt: '下一輪訪談怎麼問？', options: ['你是不是也覺得按鈕太小？', '請回想最近一次取消預約的經驗', '你一定會使用新版嗎？'], correct: '請回想最近一次取消預約的經驗', rationale: '回到真實經驗，避免誘導與要求預測未來。' }],
      allocation: { labels: ['招募與同意', '觀察訪談', '整理與回饋'], minimum: [20, 30, 20], rationale: '合計 100；至少保留 20/30/20 點，讓招募、觀察與分析都有時間。' },
      priorities: [{ id: 'consent', label: '說明錄音用途並取得同意' }, { id: 'test', label: '進行任務觀察' }, { id: 'insight', label: '整理研究假設' }], first: 'consent', priorityAdvice: '研究前先取得知情同意，接著觀察，最後整理假設。',
      output: '交付一則洞察：觀察、假設、限制、下一輪驗證。', checks: ['我將觀察與推論分開', '我標示樣本限制與無障礙問題', '我提出中性、可驗證的研究問題'], example: '三人尋找取消規則後退出，可能與風險疑慮有關；此樣本不代表所有顧客。先改善規則可見度並安排不同背景受訪者測試，也要修復讀取障礙。',
    },
  },
  {
    careerId: 'data_analyst', accent: '03 / EVIDENCE', hook: '把一串數字，變成能採取的行動。', skills: ['資料品質', '比率判讀', '假設驗證'],
    scenarios: [
      { title: '兩份報表，兩個答案', background: '你第一週就收到互相矛盾的營收報表：財務按入帳日，業務按下單日。', problem: '下午的決策會議到底要用哪份？', routes: ['核對定義與資料血緣，列差異', '協調各部門採用共同指標', '先交付限定範圍的數字並標記限制'] },
      { title: '轉換率突然下滑', background: '主管說新設計害訂單減少，但這週同時增加了低意圖廣告流量。', problem: '如何分辨設計問題和流量組成改變？', routes: ['拆解來源與裝置，檢查樣本及埋點', '與行銷和產品共同規劃驗證', '先監控高風險區段，限制加班與分析範圍'] },
      { title: '模型還是溝通？', background: '你的預測模型有用，卻沒被營運團隊採用。公司想讓你負責分析團隊。', problem: '下一階段你想把時間放在哪裡？', routes: ['深化模型可解釋性及資料品質', '接下團隊，建立決策協作流程', '選擇專案合作，維持研究與生活彈性'] },
    ],
    mission: {
      title: '找出轉換下降的真相', minutes: '5–15', objective: '正確計算比率、診斷限制，提出下一步。', brief: '以下為虛構活動數據。主管詢問是否立即取消新版網站。',
      info: ['上週自然流量 1,000 人、100 筆訂單；廣告 100 人、5 筆訂單。', '本週自然流量 1,000 人、100 筆訂單；廣告 1,000 人、50 筆訂單。', '整體轉換率由 105/1,100（9.55%）降到 150/2,000（7.5%）。'],
      decisions: [{ prompt: '哪個解釋與數據一致？', options: ['自然流量轉換變差', '低轉換來源占比增加', '新版必然造成下滑'], correct: '低轉換來源占比增加', rationale: '自然流量維持 10%、廣告維持 5%；整體下滑可由來源組成解釋，尚不能歸因設計。' }, { prompt: '下一步最適當？', options: ['直接還原新版', '檢查埋點並分來源驗證', '宣稱已證明新版沒有影響'], correct: '檢查埋點並分來源驗證', rationale: '兩週描述資料不能辨識因果；先確認資料品質，再設計對照。' }],
      allocation: { labels: ['資料驗證', '分群分析', '溝通驗證'], minimum: [25, 25, 15], rationale: '合計 100；至少保留 25/25/15 點，防止未驗資料就產出結論。' },
      priorities: [{ id: 'quality', label: '核對指標定義與埋點' }, { id: 'segment', label: '依來源分群比較' }, { id: 'recommend', label: '提出決策建議' }], first: 'quality', priorityAdvice: '先查品質與定義，再分析，最後建議。',
      output: '寫給主管的一段結論，包含證據、限制與行動。', checks: ['我使用分群比率而非只看總量', '我沒有把相關當成因果', '我提出可驗證的下一步'], example: '總體轉換率降低，但各來源比率不變，低轉換廣告占比提高是可能原因。先核對埋點，按來源與裝置比較；若要判斷新版影響，需設計對照實驗。',
    },
  },
  {
    careerId: 'product_manager', accent: '04 / PRODUCT', hook: '在有限資源裡，決定先做什麼。', skills: ['優先排序', '範圍管理', '跨部門協作'],
    scenarios: [
      { title: '需求比人力多', background: '三位主管各有重要功能，工程團隊只能做一項。你剛接手這個產品。', problem: '第一版要承諾什麼？', routes: ['釐清使用問題與風險，定最小範圍', '協商共同目標及決策責任', '先交付低成本原型，保留驗證空間'] },
      { title: '上線前的壞消息', background: '測試發現付款重複扣款風險，行銷已買下廣告版位。', problem: '如何在商業時程和顧客損失間決策？', routes: ['暫停高風險流程，驗證修正', '帶跨部門重排發佈與對外溝通', '縮小推出對象並設定停止條件'] },
      { title: '你要做哪種產品人？', background: '產品進入成長期，主管邀你帶人，但你也想繼續理解問題。', problem: '哪種責任值得你長期投入？', routes: ['深化探索與產品策略專業', '帶產品團隊並協調跨組資源', '接受有明確邊界的顧問專案'] },
    ],
    mission: {
      title: '替一個兩週版本排出優先順序', minutes: '10–20', objective: '在 100 點容量中控制風險、定義驗收與溝通。', brief: '付款 bug 影響 2% 訂單；另有視覺改版與主管指定新功能。兩週容量有限。',
      info: ['付款修正 40 點、驗證與監控至少 20 點，其餘可用於需求澄清。', '視覺改版尚無驗證；新功能依賴未完成的外部介接。', '付款風險若未控制，不應向所有使用者推出。'],
      decisions: [{ prompt: '本輪主要目標？', options: ['先控制付款風險並驗證', '同時承諾三項全部完成', '依主管職級排順序'], correct: '先控制付款風險並驗證', rationale: '本題有已知顧客損失風險，先處理並保留驗證容量。' }],
      allocation: { labels: ['付款修正', '驗證監控', '需求澄清'], minimum: [40, 20, 10], rationale: '總和 100，修正至少 40、驗證至少 20、澄清至少 10，符合題目容量約束。' },
      priorities: [{ id: 'risk', label: '控制付款損失與確認重現' }, { id: 'scope', label: '定範圍及驗收標準' }, { id: 'release', label: '安排發佈與通知' }], first: 'risk', priorityAdvice: '先控制損失，再定修正範圍，驗收後發佈。',
      output: '寫一段版本說明，包括不做什麼、驗收條件與通知對象。', checks: ['我明確說明本輪範圍及延後項目', '我定義了驗收與停止條件', '我列出需要同步的利害關係人'], example: '本輪先修付款與增加監控，視覺和新功能延後。重複扣款測試及監控通過才逐步放量，異常立即停用；同步客服、工程與行銷。',
    },
  },
  {
    careerId: 'learning_development_specialist', accent: '05 / GROWTH', hook: '讓學習真的改變工作，而不只是一堂課。', skills: ['需求診斷', '學習設計', '成效驗證'],
    scenarios: [
      { title: '大家真的需要上課嗎？', background: '主管要求溝通訓練，員工卻說權責不明才是衝突原因。', problem: '你如何確認真正需要解決的問題？', routes: ['訪談與觀察工作，區分能力和制度問題', '帶主管與員工共同對齊工作責任', '先設計一場小型案例演練再評估'] },
      { title: '課程滿意度很高', background: '課後評分 4.8，但一個月後同樣的錯誤還在發生。', problem: '怎麼判斷訓練是否有效？', routes: ['追蹤工作行為及可觀察成果', '協調主管提供練習和回饋空間', '縮小課程，改成週期性短練習'] },
      { title: '成為專家還是帶團隊', background: '公司跨區擴張，邀你負責人才發展，但資源不夠每區都辦完整課程。', problem: '如何選擇你的長期工作模式？', routes: ['深化學習成效與課程設計', '建立區域講師網絡並帶領團隊', '以專案方式服務小團隊，保留彈性'] },
    ],
    mission: {
      title: '設計能改變工作行為的訓練', minutes: '10–15', objective: '辨識訓練可以解決的部分，提出可觀察的驗證。', brief: '客服新人常漏記交接資訊，主管要求辦一天課程。',
      info: ['8 位新人中 6 位會操作系統，但不清楚交接由誰負責。', '現有表單沒有未完成事項欄位；兩位新人也不熟升級流程。', '你有 100 點時間資源，四週後要確認改變。'],
      decisions: [{ prompt: '哪個方案更符合觀察？', options: ['只增加八小時講課', '澄清責任並練習升級案例', '以出席率證明成效'], correct: '澄清責任並練習升級案例', rationale: '制度缺口與能力缺口同時存在，課程不能代替權責與表單修正。' }, { prompt: '四週後看什麼？', options: ['交接完整率及案例處理行為', '投影片頁數', '課程照片數量'], correct: '交接完整率及案例處理行為', rationale: '工作行為與成果比出席或滿意度更接近本題目標。' }],
      allocation: { labels: ['診斷與權責', '案例練習', '追蹤回饋'], minimum: [25, 25, 20], rationale: '總和 100；至少保留 25/25/20 點，涵蓋制度、練習、追蹤。' },
      priorities: [{ id: 'diagnose', label: '確認權責與表單缺口' }, { id: 'practice', label: '安排升級案例練習' }, { id: 'follow', label: '追蹤工作行為' }], first: 'diagnose', priorityAdvice: '先診斷，接著練習，最後回到工作追蹤。',
      output: '寫一個四週改善計畫，區分制度調整與學習。', checks: ['我區分制度問題與技能問題', '我安排實作與主管回饋', '我訂定四週可觀察的行為指標'], example: '第一週澄清交接責任、補未完成欄位；第二週練習升級情境並由主管回饋。四週抽查交接完整率及升級流程使用情形，先與原始基準比較。',
    },
  },
  {
    careerId: 'guest_experience_manager', sector: '第一線與服務營運', accent: '06 / OPERATIONS', hook: '在忙亂現場，讓人被好好接住。', skills: ['風險分流', '服務補救', '流程改善'],
    scenarios: [
      { title: '滿房夜的第一班', background: '入住排隊、房間未清、還有客人反映門鎖異常。你當班只有兩位同仁。', problem: '你會先把注意力放在哪裡？', routes: ['先處理安全風險，建立事件紀錄', '安排分工，向等待客人清楚說明', '暫停非必要服務，保留恢復與支援空間'] },
      { title: '一次抱怨，兩種立場', background: '客人要求全額退款，同仁認為自己照規定辦理，主管要你立即平息爭議。', problem: '如何兼顧顧客感受、權限和團隊？', routes: ['核對事件與補償權限，提出可行方案', '主持交接與補救，支持現場同仁', '先處理當下需求，延後非必要承諾'] },
      { title: '旺季之後', background: '滿意度上升，但團隊疲憊。你被邀請接跨館管理，輪班時間也會增加。', problem: '哪種發展和你的生活條件相容？', routes: ['深化服務流程與品質改善', '帶領跨館團隊並承擔人力協調', '選擇穩定班表與限定範圍的改善專案'] },
    ],
    mission: {
      title: '排出滿房夜的應對計畫', minutes: '5–15', objective: '在人力限制下完成風險分流、服務補救與交接。', brief: '兩位同仁值班，三件事同時發生；不要只按客人聲量決定。',
      info: ['A 房門鎖故障且無法確認房內安全，需立即派員依安全流程確認。', 'B 客人排隊 20 分鐘，需要說明等候時間；C 要求餐廳推薦。', '補償超過當班額度需主管核准；不可承諾未授權金額。'],
      decisions: [{ prompt: '第一個處理對象？', options: ['A：門鎖與安全', 'B：聲音最大的客人', 'C：最快解決的推薦'], correct: 'A：門鎖與安全', rationale: '依本題安全風險優先；另一位同仁可同步向排隊客人說明。' }, { prompt: '超出補償權限時？', options: ['先承諾再說', '說明可提供方案並升級主管', '不回應'], correct: '說明可提供方案並升級主管', rationale: '明確回應需求與處理時間，避免無權限承諾。' }],
      allocation: { labels: ['安全處理', '等待溝通', '紀錄交接'], minimum: [40, 20, 15], rationale: '總和 100；安全至少 40、溝通 20、交接 15，是本情境的資源約束。' },
      priorities: [{ id: 'safe', label: '依流程確認門鎖及人身安全' }, { id: 'queue', label: '說明排隊與可行補救' }, { id: 'recommend', label: '提供餐廳推薦' }], first: 'safe', priorityAdvice: '安全先於等待體驗與一般資訊服務；可分工同步處理。',
      output: '寫一份交接紀錄：事實、已處理、未完成、負責人與回覆時間。', checks: ['我沒有承諾未授權補償', '我列出安全確認與升級負責人', '我寫出未完成事項與回覆時點'], example: 'A 房依安全流程確認並通知工程，當班主管追蹤；B 已說明等待與可用方案，超額補償待核准，30 分鐘內回覆。交接給晚班逐項確認並記錄結果。',
    },
  },
  ...FIELD_CAREERS,
  ...COMMON_LAB_CAREERS,
];

export const labCareer = (id: string) => LAB_CAREERS.find((career) => career.careerId === id);
const routes = ['specialist', 'leader', 'flexible'] as const;
const effects = [{ skill: 12, energy: -5, stress: 6, money: -4, time: -5, opportunity: 6 }, { skill: 6, stress: 10, satisfaction: 6, opportunity: 12, money: 6, time: -8 }, { energy: 8, stress: -6, balance: 10, autonomy: 8, money: -6 }] as const;
function choices(scenario: Scenario): Choice[] {
  return routes.map((id, index) => ({ id, label: scenario.routes[index], result: [ '你留下可追溯的專業產出，但需要投入更多學習時間。', '你取得跨部門能見度，也承擔更多協調與責任。', '你守住工作邊界並採取小步驗證，成長速度與資源也有取捨。' ][index], effects: { ...effects[index] }, flag: id }));
}
function event(year: number, id: string, scenario: Scenario, extra: Partial<EventCard> = {}): EventCard {
  return { id, year, ...scenario, choices: choices(scenario), ...extra };
}
export function eventsFor(careerId: string): EventCard[] {
  const career = labCareer(careerId);
  if (!career) throw new Error('這個職業尚未開放完整模擬。');
  const skill = career.skills[0];
  const field = career.onsite || career.sector === '製造與技術現場' || career.sector === '第一線與服務營運';
  const events: EventCard[] = [
    ...career.scenarios.map((scenario, i) => event([0, 1, 3][i], `${careerId}-core-${i}`, scenario, { mission: i === 1 })),
    event(5, 'burnout', { title: '累積的壓力需要被看見', background: `長期投入${skill}與專案後，你開始難以恢復精力。單位希望你再接一項急迫工作。`, problem: '如何處理工作負荷與下一步？', routes: ['爭取培訓與專業支援，縮小急件範圍', '與主管協商人力及責任分配', '暫緩擴張，先建立可恢復的工作節奏'] }, { conditions: [{ stat: 'stress', min: 55 }] }),
    event(5, 'mission-opportunity', { title: '一份作品帶來的新邀請', background: '你在工作任務中留下可檢視的產出，團隊願意讓你帶著這份作品試新角色。', problem: '要如何把任務中的練習轉成發展？', routes: [`深化${skill}，找專業導師檢視作品`, '帶一個小團隊，把方法交給別人', field ? '先依資格與制度評估新的安排' : '用短期合作驗證新的工作模式'] }, { conditions: [{ missionScore: 70 }] }),
    event(5, 'lead-invite', { title: '第一次正式帶人', background: '先前的協調讓主管看見你；團隊需要有人負責排程與衝突，專業工作時間會減少。', problem: '如何分配你的責任？', routes: ['保留專家角色，帶教但不全面管理', '接受帶人職責，安排固定的一對一', '協商輪值領導，保留生活邊界'] }, { conditions: [{ flag: 'leader' }] }),
    event(5, 'deepening', { title: '工具變了，工作也變了', background: `新工具可以加速部分${skill}工作，但仍需要人判斷品質。組織正在調整分工。`, problem: '你要把學習時間用在哪裡？', routes: ['學新方法並檢驗輸出品質', '建立團隊共同使用規範', '先在低風險專案試用並保留邊界'] }),
    event(7, 'stable-role', { title: '成長與穩定，可以重新協商', background: '你這次把穩定放在前面。組織調整後，有一份範圍較清楚的內部職位，但新專案機會會減少。', problem: '什麼樣的穩定才對你有意義？', routes: ['深化既有專業，協商固定練習時間', '接受帶教責任，換取明確的人力支持', '縮小職責範圍，優先維持生活節奏'] }, { conditions: [{ goal: 'stability' }] }),
    event(7, 'learning-invite', { title: '熟悉的能力，遇上新的方法', background: `原測驗有學習敏捷的多方法訊號，團隊邀你試做新工具與${skill}的整合；這不是能力保證，仍需作品驗證。`, problem: '要怎麼安排這次練習？', routes: ['建立可重現的小型案例並請同行檢視', '和同事共學，建立品質檢查規範', '限制投入時數，先測是否願意持續'] }, { conditions: [{ talent: 'learning_agility' }] }),
    event(7, 'renewed-interest', { title: '先前的投入，值得再驗證', background: '你先前的任務反思或短時間實驗顯示投入。這次收到不同工作內容的邀約，可以檢查那份喜歡是否能持續。', problem: '你想再收集哪一種證據？', routes: ['換一個更有深度的案例，檢查作品品質', '帶同事一起實作，觀察協作能量', field ? '先依工作制度確認可調整的範圍' : '用短期合作驗證，避免一次承諾過多'] }, { conditions: [{ priorEngagement: true }] }),
    event(7, 'autonomy', { title: field ? '輪值與工作分工的新安排' : '遠端合作的試行邀約', background: field ? '你先前重視工作邊界，現在想了解輪值、支援與分工可調整的範圍。實際安排依工作制度、資格與授權確認；實際現場工作仍需到場。' : '你先前守住了工作邊界，現在有機會以遠端專案合作；自由增加，但需要自己協商交付與資源。', problem: '如何設計可持續的合作方式？', routes: ['用專業交付換取彈性，保留品質審查', field ? '帶輪值小組，建立現場責任與交接規則' : '帶遠端小組，建立非同步協作規則', field ? '確認工作量與休息安排能否調整' : '限制案量，留下休息與現實驗證的時間'] }, { conditions: [{ flag: 'flexible' }] }),
    event(7, 'expansion', { title: '跨區專案與生活條件', background: `跨區團隊需要你的${skill}經驗，但合作時間會侵入晚間。這也是重新檢視生活安排的時候。`, problem: '機會和時間資源，怎樣交換才值得？', routes: ['限定專業支援範圍，建立可重用方法', '接受跨區協調，協商替補與資源', '拒絕常態晚間工作，選擇穩定節奏'] }),
    event(10, 'review', { title: '十年之後，下一段由你定義', background: '你已走過入職、適應、選擇與調整。這段模擬留下的是工作取捨，不是現實的職位或薪資預言。', problem: '回顧累積的狀態與作品，你想把下一階段投向哪裡？', routes: ['以專業深化為下一階段主軸', '以帶領團隊與組織影響為主軸', '以彈性合作與生活整合為主軸'] }),
  ];
  return events.map((e) => ({ ...e, background: plainWorkText(e.background), problem: plainWorkText(e.problem), choices: e.choices.map((c) => ({ ...c, label: (e.id === 'review' ? career.development?.[e.choices.indexOf(c)] : undefined) ?? simpleStoryOptions(careerId, e.id)?.[e.choices.indexOf(c)] ?? plainWorkText(c.label) })) }));
}
export const ENDINGS = {
  specialist: { title: '專業深化之路', body: '你把時間放在作品、方法與品質。下一步要驗證：你是否喜歡持續鑽研，以及能否承受反覆練習。' },
  leader: { title: '團隊與組織之路', body: '你承擔協調、帶人與資源取捨。下一步要驗證：人際協作是否帶來投入，以及責任是否有足夠支持。' },
  flexible: { title: '自主與生活整合之路', body: '你傾向以明確邊界換取持續投入。下一步要驗證：資源緩衝、合作管道與現實生活條件能否支持。' },
};
