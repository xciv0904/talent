# 上架前 UX／QA 審查

審查日期：2026-08-12

範圍：首次使用流程、Assessment 作答與保存、路由、錯誤復原、公開文案、前端安全標頭、production bundle。核心 Talent／Career scoring、題庫 signal 與 Career Dataset 均未修改。

## 第一次使用最容易卡住的地方

1. **進入測驗前不知道要花多久、會遇到什麼題型。** 原流程從 CTA 直接跳到第 1 題，使用者無法先建立預期。現在先說明 25 題核心探索約 5–7 分鐘，完成後可看初步結果，再選擇是否用 10 題補充驗證提高完整度；自動保存、能量題規則與「結果不是定論」仍保留。
2. **選了行為選項後，系統原本會默認最低頻率。** 使用者可能未注意就進下一題，卻留下「很少發生」的資料。已改為一定要明確選 1–5 程度才能前進。
3. **能量題選滿兩項後不好改答案。** 原本點第三項沒有反應。現在保留第一個「較有精神」選擇，第三次點擊會替換第二個「較消耗」選擇，並提供重新選擇按鈕。
4. **舊版 45 題進度可能和新版 35 題結果混用。** 已按 assessment、talent model、matching engine、career dataset 與 explanation 版本驗證；舊結果會失效，但有效答案保留並帶回第一個未完整作答處。
5. **頁面錯誤時直接清空進度，代價過高。** 現在先提供保留資料的重新載入；清除進度改成次要操作並要求確認。
6. **鍵盤使用者換頁後不知道焦點在哪裡。** 已新增跳至主要內容、換頁聚焦主內容、回到頂端、Escape 關閉行動版選單，以及 textarea／summary 的焦點樣式。
7. **結果與比較頁有中英混雜的公共標籤。** 已將職涯吻合、分析信心、能力吻合、能量消耗風險、個人進入距離等關鍵標籤統一成中文。
8. **首次載入包含過多非當頁程式。** 已做頁面 lazy loading、直接引用服務模組，並避免錯誤頁靜態載入 assessment storage。

## 使用者體驗改善方案評分

每項以 0–100 分評估；總分為五個欄位各佔 20% 的加權平均。

| # | 改善方案 | 必要性 | 功能性 | 使用者有感 | 易維護性 | 低風險性 | 加權總分 | 建議／狀態 |
|---|---|---:|---:|---:|---:|---:|---:|---|
| 1 | 測驗前預期管理與能量題說明 | 96 | 94 | 97 | 95 | 96 | 95.6 | 已完成；保留一屏內可讀，不增加教學輪播。 |
| 2 | 頻率／證據程度改為明確作答 | 100 | 99 | 97 | 95 | 92 | 96.6 | 已完成；這是資料完整性修正，應持續由共用 validator 與測試保護。 |
| 3 | 能量題兩步選擇、改選與完成驗證 | 98 | 99 | 94 | 95 | 92 | 95.6 | 已完成；不改 signal mapping，只修互動與資料合法性。 |
| 4 | 版本化保存、去重與安全恢復 | 100 | 98 | 96 | 93 | 90 | 95.4 | 已完成；舊結果失效、答案保留，不在背景偷偷重算。 |
| 5 | 錯誤頁保留進度與清除確認 | 98 | 96 | 96 | 96 | 97 | 96.6 | 已完成；重新載入是主操作，清除只作最後手段。 |
| 6 | 路由焦點、skip link、Escape 與焦點外框 | 94 | 95 | 90 | 96 | 96 | 94.2 | 已完成；之後新增 route 時沿用 AppLayout，不在頁面各自複製。 |
| 7 | 頁面分割與服務直接引用 | 92 | 95 | 88 | 94 | 96 | 93.0 | 已完成；初始 JS 傳輸量明顯下降，沒有改變 engine 輸出。 |
| 8 | 公共標籤中文一致化 | 86 | 90 | 92 | 96 | 98 | 92.4 | 已完成主要結果、比較與體驗標籤；英文職稱與產品名稱保留。 |

## 上架前審查與前後評分

下列為本次 release readiness rubric，不是 Lighthouse、滲透測試或真實使用者研究分數。

| 審查面向 | 修改前 | 修改後 | 驗證與修正 |
|---|---:|---:|---|
| 按鈕驗證 | 72 | 96 | 下一題／產生結果依完整作答鎖定；第一題上一題停用；Energy 可改選；清除資料需確認。 |
| 資料輸入驗證 | 64 | 97 | scale 不再自動填 1；Energy 必須剛好兩項；送出前逐題檢查；storage 去重、過濾舊題與非法資料。 |
| 功能驗證 | 78 | 95 | 瀏覽器實測開始、前進、scale、Energy、refresh 恢復、route focus；既有 unit／integration suite 全跑。 |
| BUG 與復原 | 70 | 95 | 修正默認低分、Energy 無法改選、舊版結果混用與錯誤頁清資料四個問題。 |
| 資安 | 76 | 93 | npm production audit 無已知漏洞；增加 CSP、nosniff、referrer、permissions、COOP；不記錄 assessment answer 到 console。 |
| 效能 | 74 | 94 | route lazy loading、direct imports；初始 JS 約 508.80 kB／158.34 kB gzip 降至 239.02 kB／77.94 kB gzip。 |
| 維護性 | 79 | 94 | 共用 `isQuestionResponseComplete`；storage migration 集中；頁面不再透過 service barrel 拉入無關依賴。 |
| **平均** | **73.3** | **94.9** | 五大 UX 高風險點均有 regression tests 或瀏覽器驗證。 |

## 已修正的具體問題

- 選取 behavior／evidence option 時自動寫入 scale 最低值。
- Energy 超過兩項時第三次點擊無反應。
- Assessment 由 45 題縮為 35 題後，舊結果版本未被完整檢查。
- 儲存資料可能包含重複 question ID 或已移除題目。
- 完成時只檢查當頁，沒有逐題 preflight。
- 任一 rendering error 都直接清空 assessment 資料。
- route change 缺少 scroll／focus reset；沒有 skip link。
- textarea 與 details summary 缺少一致 focus-visible 樣式。
- 首次開始前缺少時間、題型與自動保存預期。
- 方法頁仍描述舊的四題／四題型 coverage。
- 初始 bundle 包含所有 route 與無關 service/data modules。
- Vercel 回應缺少多項瀏覽器安全標頭。
- 重要結果標籤中英混雜。

## 93% 以上的五個改善方案

目標指標採「Release Readiness」，因為沒有在本次環境執行正式 Lighthouse lab 與真實 RUM；五項各自仍用相同 20% 權重評分。

| # | 方案 | 必要性 | 功能性 | 使用者有感 | 易維護性 | 低風險性 | 加權總分 | 建議 |
|---|---|---:|---:|---:|---:|---:|---:|---|
| 1 | 作答完整性閘門：option、scale、ranking、Energy 統一驗證 | 100 | 99 | 97 | 95 | 92 | 96.6 | 視為 release blocker；任何新題型都要先擴充共用 validator。 |
| 2 | 保存與復原：版本比對、答案去重、錯誤時不清資料 | 100 | 98 | 97 | 94 | 93 | 96.4 | 每次題庫版本變更都新增 migration regression。 |
| 3 | 首次使用引導：時間、題數、題型與結果定位 | 96 | 94 | 97 | 95 | 96 | 95.6 | 維持簡短，不做多頁 onboarding。 |
| 4 | 無障礙路由：skip、focus、keyboard、reduced motion | 95 | 95 | 91 | 96 | 96 | 94.6 | 上線後補一次實機 VoiceOver／TalkBack 驗收。 |
| 5 | 路由分割與依賴邊界：按頁載入 engine/data | 94 | 96 | 90 | 94 | 96 | 94.0 | 設定 bundle budget，避免之後 service barrel 再讓首頁載入全部資料。 |

## 驗證證據

- 首次 `/assessment` 顯示 25 題核心探索、約 5–7 分鐘、自動保存、10 題補充驗證與能量題說明。
- 第 6 題選 option 後「下一題」仍 disabled；明確選程度 3 後才 enabled。
- refresh 後仍停在第 6 題，option 與程度 3 保留。
- 第 16 題 Energy 先選 A／B，再選 C，C 正確取代 B；下一題維持可用。
- 點擊「方法」後，URL 為 `/methodology`、scrollY 為 0、activeElement 為 `main-content`。
- 1280 px browser viewport 無水平 overflow；既有 responsive breakpoints、`overflow-x-clip`／`overflow-x-auto` 與 reduced-motion 規則保留。
- `npm audit --omit=dev --audit-level=moderate`：0 vulnerabilities。

## 尚需外部驗證

- 本次沒有 Lighthouse lab、WebPageTest 或 production RUM，因此不宣稱 Core Web Vitals 已達 93 分。
- 安全標頭要部署後再以正式 Vercel response headers 驗證；目前 live 站仍是部署前版本。
- 仍建議在實體 iPhone／Android 各跑一次 25 題核心、10 題補充與結果頁；本次變更沒有新增寬版固定尺寸元件。
