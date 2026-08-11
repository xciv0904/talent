# Quick Discovery Scenario Diversity Matrix

Scope: all 35 Quick Discovery 1.1 questions. Every question is self-contained and can be answered without formal work experience.

## Question mix

| Measurement | IDs | Count |
| --- | --- | ---: |
| Situational ability | SJT01–SJT05 | 5 |
| Behavior | BEH01–BEH05 | 5 |
| Evidence | EVD01–EVD05 | 5 |
| Bidirectional energy | ENG01–ENG05 | 5 |
| Interest | INT01–INT05 | 5 |
| Environment / Work Style | ENV01–ENV05 | 5 |
| Values | VAL01–VAL05 | 5 |
| **Total** |  | **35** |

The former FC01–FC05 pages were removed because they repeated the same four-option choice pattern already measured by Situational, Behavior, and Evidence questions. The former ENG06–ENG10 draining pages were merged into ENG01–ENG05: the respondent now chooses the relatively energizing activity first and the relatively draining activity second in one scenario.

## Domain balance

| Scenario domain | Questions | Count |
| --- | --- | ---: |
| `individual_problem` | EVD03 | 1 |
| `learning` | SJT04, ENG05, INT04, VAL04 | 4 |
| `information` | BEH05, INT02 | 2 |
| `social_interaction` | BEH04, VAL03 | 2 |
| `group_activity` | SJT01, SJT05, ENV02 | 3 |
| `helping_someone` | EVD04, ENG02, INT05, VAL05 | 4 |
| `planning` | BEH01, ENG01 | 2 |
| `unexpected_change` | BEH02, ENG03 | 2 |
| `limited_time` | BEH03, ENV01 | 2 |
| `unfamiliar_task` | SJT02, ENV03 | 2 |
| `quality_check` | EVD02 | 1 |
| `creative_task` | ENG04, INT01, ENV05, VAL02 | 4 |
| `practical_task` | EVD05, INT03, ENV04 | 3 |
| `choice_decision` | SJT03, EVD01, VAL01 | 3 |

No domain exceeds four questions. Each Base Talent still appears in three ability questions from three methods and three scenario domains; exact mappings are maintained in `docs/question-coverage.md`.

## Release rules

Every item must remain understandable without another question, require no formal work or specialist knowledge, describe one concrete decision point, keep all options reasonable, and preserve its declared signal payload. The semantic QA additionally reviews repeated decision structures; lexical similarity alone is not treated as sufficient duplicate detection.

## Persona readability

The complete 35-question bank is reviewed from four contexts: an 18-year-old student without formal work experience, a hospitality or service worker, a skilled technical worker, and a healthcare or care worker. No question may require the reader to imagine being an office worker, manager, project owner, presenter, or client-facing employee.
