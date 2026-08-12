# Quick Discovery 題目清晰度審查

審查日期：2026-08-12

範圍：35 題 Quick Discovery 的可理解性。這次只修改 `scenario`、`decisionPoint`、`prompt` 與 option label；Question ID、option ID、題型及所有 signal payload 均維持不變。

## 判定規則

- `CLEAR`：第一次閱讀就能知道發生什麼、要選什麼，不需要猜隱含設定。
- `MINOR REWRITE`：核心事件可理解，但句子偏繞、目的不明或塞入過多公平條件。
- `MAJOR REWRITE`：使用者需要先解讀情境設計，才知道題目到底在問什麼。

## Audit

| 題號 | 原判定 | 問題與處理 |
| --- | --- | --- |
| SJT01 | CLEAR | 事情卡住、原因未知，動作具體。 |
| SJT02 | CLEAR | 搬家資訊分散，下一步清楚。 |
| SJT03 | CLEAR | 活動無法全排入，取捨明確。 |
| SJT04 | CLEAR | 缺少完整步驟的裝置，四種理解方式可區分。 |
| SJT05 | MINOR REWRITE | 「怎樣才算完成」偏抽象；改成「要講哪些內容、準備到什麼程度」。 |
| BEH01 | CLEAR | 聚會事項未排序，行動明確。 |
| BEH02 | CLEAR | 食材用完，四種反應合理。 |
| BEH03 | CLEAR | 三十分鐘、三件未完成事情，限制具體。 |
| BEH04 | MAJOR REWRITE | 「安靜時段怎麼安排」不知道在安排什麼；改為決定晚上幾點後不製造噪音，並簡化四個選項。 |
| BEH05 | MINOR REWRITE | 不知道操作說明用來做什麼；補上組裝簡單置物架的具體目的。 |
| EVD01 | MAJOR REWRITE | 像在準備面試，需同時理解半年、陌生人、STAR 式說明；改成直接回想可說清楚過程與結果的經驗。 |
| EVD02 | MINOR REWRITE | 「整理一頁紀錄」是多餘任務；直接問哪個結果最能提出成品、數字、紀錄或回饋。 |
| EVD03 | MINOR REWRITE | 「不是偶然的做事方式」偏抽象；直接問哪種做法至少出現兩次且結果相近。 |
| EVD04 | MINOR REWRITE | 透過「一位朋友想知道」繞一層；直接回想改善前、做法與改變。 |
| EVD05 | MINOR REWRITE | 填表情境增加理解成本；直接回想陌生又混亂的生活經驗。 |
| ENG01 | MINOR REWRITE | 「都不急，也不影響整理成果」難理解；改成四件同樣重要、每天投入相同時間。 |
| ENG02 | CLEAR | 募集活動與四項責任清楚。 |
| ENG03 | CLEAR | 下雨後重新安排下午，事件具體。 |
| ENG04 | CLEAR | 公共牆面四種貢獻，持續投入條件清楚。 |
| ENG05 | CLEAR | 陌生桌遊的四種理解活動清楚。 |
| INT01 | CLEAR | 週末展示體驗，無能力門檻。 |
| INT02 | CLEAR | 自由瀏覽資料，無成果壓力。 |
| INT03 | CLEAR | 四場同時段實作活動，選擇清楚。 |
| INT04 | CLEAR | 四個展示選一個深入理解。 |
| INT05 | MINOR REWRITE | 「旁觀協助者處理」不自然；改成選一位熟練者觀察其解題方式。 |
| ENV01 | CLEAR | 只比較投入節奏。 |
| ENV02 | CLEAR | 任務相同，只比較互動密度。 |
| ENV03 | CLEAR | 花園照顧方式，只比較規則程度。 |
| ENV04 | MINOR REWRITE | 「物品維護活動／負責方式」缺少具體事件；改為社區用品的現場檢查與維護。 |
| ENV05 | CLEAR | 同一作品中四種貢獻模式清楚。 |
| VAL01 | CLEAR | 兩個有報酬機會，以一項條件決定。 |
| VAL02 | CLEAR | 資源只夠強化一項特色。 |
| VAL03 | CLEAR | 四種肯定對應不同價值。 |
| VAL04 | MINOR REWRITE | 「成長機會」內容不明；改為半年、每週固定投入的學習機會。 |
| VAL05 | CLEAR | 四種長期影響只能完整保留一項。 |

## 統計

- CLEAR：23
- MINOR REWRITE：10
- MAJOR REWRITE：2
- 完成後仍需使用者自行猜測題目背景：0

## Signal Integrity

改寫前後保留相同 Question ID、Question Type、Option ID 與 signal objects。既有 `question-context-neutrality.test.ts` 的 signal contract hash 以及 coverage、scoring、normalization tests 必須全部通過。
