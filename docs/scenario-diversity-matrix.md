# Quick Discovery Scenario Diversity Matrix

Scope: all 45 Quick Discovery questions. This audit treats every question as a standalone page: no prior story, role, or answer is available to the reader.

## Release rules

Every item must pass all 12 checks before it can remain in Quick Discovery:

1. Understandable without another question.
2. No formal work experience required.
3. No occupation-specific knowledge required.
4. Concrete Who, What, and Constraint.
5. One primary decision point.
6. No preferred-answer or moral cue.
7. Every option is a reasonable response.
8. Options use a comparable level of detail.
9. Options describe an action, decision, or directly selectable condition—not a personality claim.
10. No unnecessary specialist terminology.
11. The reader does not have to invent the missing story.
12. Measurement intent and signal payload are preserved.

## Domain balance

| Scenario domain | Questions | Count |
|---|---|---:|
| `individual_problem` | EVD03, ENG06 | 2 |
| `learning` | SJT04, ENG05, INT04, VAL04 | 4 |
| `information` | SJT02, BEH05, ENG10, INT02 | 4 |
| `social_interaction` | FC01, BEH04, ENG09, VAL03 | 4 |
| `group_activity` | SJT01, SJT05, FC04, ENV02 | 4 |
| `helping_someone` | EVD04, ENG02, INT05, VAL05 | 4 |
| `planning` | BEH01, ENG01 | 2 |
| `unexpected_change` | BEH02, ENG03 | 2 |
| `limited_time` | SJT03, BEH03, ENG08, ENV01 | 4 |
| `unfamiliar_task` | FC05, ENV03 | 2 |
| `quality_check` | FC02, EVD02, ENG07 | 3 |
| `creative_task` | ENG04, INT01, ENV05, VAL02 | 4 |
| `practical_task` | EVD05, INT03, ENV04 | 3 |
| `choice_decision` | FC03, EVD01, VAL01 | 3 |
| **Total** |  | **45** |

No domain exceeds four questions (8.9% of the bank). Office, team project, school, and customer-service scenarios each account for zero questions.

## Per-question matrix

`Quality` means all 12 release checks above pass. `Signal` means the ordered option IDs and every scoring payload remain unchanged.

| ID | Domain | Reader role | Single decision point | Context requirement | Quality | Signal |
|---|---|---|---|---|---|---|
| SJT01 | group_activity | equal participant | first action when setup is stuck for an unknown reason | universal | 12/12 PASS | PASS |
| SJT02 | information | friend taking over preparation | first action when lists and messages are scattered | universal | 12/12 PASS | PASS |
| SJT03 | limited_time | equal participant | choose how to reduce an overfull day plan | universal | 12/12 PASS | PASS |
| SJT04 | learning | first-time learner | first way to understand an incompletely explained device | universal | 12/12 PASS | PASS |
| SJT05 | group_activity | equal participant | first action when completion criteria are unclear | universal | 12/12 PASS | PASS |
| FC01 | social_interaction | contributor | choose one contribution after readers interpret a notice differently | universal | 12/12 PASS | PASS |
| FC02 | quality_check | contributor | choose one improvement before a booklet is printed | universal | 12/12 PASS | PASS |
| FC03 | choice_decision | equal participant | choose a decision method between two feasible approaches | universal | 12/12 PASS | PASS |
| FC04 | group_activity | regular participant | choose one contribution to sustain for a month | universal | 12/12 PASS | PASS |
| FC05 | unfamiliar_task | equal participant | first action before assembling an undefined object | universal | 12/12 PASS | PASS |
| BEH01 | planning | friend helping a friend | first action on an unordered preparation list | universal | 12/12 PASS | PASS |
| BEH02 | unexpected_change | person preparing a meal | first action when a key ingredient is missing | universal | 12/12 PASS | PASS |
| BEH03 | limited_time | equal participant | first action when three tasks remain and pickup is near | universal | 12/12 PASS | PASS |
| BEH04 | social_interaction | discussion participant | first contribution when opposing views repeat | universal | 12/12 PASS | PASS |
| BEH05 | information | individual reader | first action on duplicated and conflicting instructions | universal | 12/12 PASS | PASS |
| EVD01 | choice_decision | person explaining an experience | select the contribution with a complete evidence chain | universal | 12/12 PASS | PASS |
| EVD02 | quality_check | person documenting an experience | select a result that external evidence can verify | universal | 12/12 PASS | PASS |
| EVD03 | individual_problem | person reviewing a year | select a repeated behavior rather than a one-off event | universal | 12/12 PASS | PASS |
| EVD04 | helping_someone | friend explaining how they helped | select an improvement with a clear before/action/after | universal | 12/12 PASS | PASS |
| EVD05 | practical_task | person documenting an experience | select a verifiable contribution from unfamiliar or messy situations | universal | 12/12 PASS | PASS |
| ENG01 | planning | person who finished organizing | choose the follow-up activity they still want to do | universal | 12/12 PASS | PASS |
| ENG02 | helping_someone | activity helper | choose an additional task that would preserve energy | universal | 12/12 PASS | PASS |
| ENG03 | unexpected_change | equal participant | choose the post-rain activity that restores motivation | universal | 12/12 PASS | PASS |
| ENG04 | creative_task | contributor | choose the creative contribution they most anticipate | universal | 12/12 PASS | PASS |
| ENG05 | learning | first-time game learner | choose the unfamiliar-system activity that supports focus | universal | 12/12 PASS | PASS |
| ENG06 | individual_problem | person changing a routine | choose the repeated activity most likely to drain energy | universal | 12/12 PASS | PASS |
| ENG07 | quality_check | booklet contributor | choose the sustained responsibility that most requires rest | universal | 12/12 PASS | PASS |
| ENG08 | limited_time | activity contributor | choose the high-pressure responsibility with greatest energy cost | universal | 12/12 PASS | PASS |
| ENG09 | social_interaction | decision participant | choose the group-decision responsibility with greatest energy cost | universal | 12/12 PASS | PASS |
| ENG10 | information | person organizing mixed materials | choose the organizing activity with greatest mental cost | universal | 12/12 PASS | PASS |
| INT01 | creative_task | first-time explorer | choose one no-prerequisite display activity | universal | 12/12 PASS | PASS |
| INT02 | information | curious browser | choose information they would voluntarily keep reading | universal | 12/12 PASS | PASS |
| INT03 | practical_task | first-time participant | choose one no-prerequisite hands-on activity | universal | 12/12 PASS | PASS |
| INT04 | learning | visitor | choose one question to explore deeply | universal | 12/12 PASS | PASS |
| INT05 | helping_someone | observer | choose one helper's approach to observe | universal | 12/12 PASS | PASS |
| ENV01 | limited_time | month-long helper | choose a sustainable pace with equal weekly hours | universal | 12/12 PASS | PASS |
| ENV02 | group_activity | photo-sorting participant | choose an interaction density with the task held constant | universal | 12/12 PASS | PASS |
| ENV03 | unfamiliar_task | first-time garden helper | choose a preferred level of rule clarity | universal | 12/12 PASS | PASS |
| ENV04 | practical_task | maintenance participant | choose tolerable mobility and uncertainty conditions | universal | 12/12 PASS | PASS |
| ENV05 | creative_task | equal contributor | choose a contribution mode with time and visibility held constant | universal | 12/12 PASS | PASS |
| VAL01 | choice_decision | person choosing a paid opportunity | choose the deciding value with other conditions held close | universal | 12/12 PASS | PASS |
| VAL02 | creative_task | public-display contributor | choose which product quality receives scarce resources | universal | 12/12 PASS | PASS |
| VAL03 | social_interaction | activity contributor | choose the form of feedback that makes effort worthwhile | universal | 12/12 PASS | PASS |
| VAL04 | learning | invited participant | choose the non-negotiable condition for a long opportunity | universal | 12/12 PASS | PASS |
| VAL05 | helping_someone | shared-space helper | choose which useful result should remain | universal | 12/12 PASS | PASS |

## Independent Base Talent signals

Each Base Talent still has four ability signals from four question types. Every Talent now spans at least three scenario domains and more than one reader role.

| Talent | Signal questions | Distinct domains | Result |
|---|---|---:|---|
| analytical_reasoning | SJT01, FC01, BEH01, EVD01 | 4 | PASS |
| pattern_recognition | SJT02, FC04, BEH05, EVD03 | 3 | PASS |
| quantitative_reasoning | SJT03, FC03, BEH03, EVD02 | 3 | PASS |
| verbal_reasoning | SJT04, FC05, BEH04, EVD04 | 4 | PASS |
| spatial_mechanical | SJT04, FC05, BEH05, EVD05 | 4 | PASS |
| creative_ideation | SJT04, FC01, BEH01, EVD04 | 4 | PASS |
| learning_agility | SJT05, FC02, BEH02, EVD05 | 4 | PASS |
| structuring_ambiguity | SJT05, FC05, BEH05, EVD05 | 4 | PASS |
| emotional_perception | SJT01, FC03, BEH01, EVD04 | 4 | PASS |
| communication | SJT02, FC01, BEH02, EVD02 | 4 | PASS |
| influence | SJT03, FC02, BEH04, EVD03 | 4 | PASS |
| teaching_coaching | SJT04, FC04, BEH04, EVD01 | 4 | PASS |
| coordination | SJT05, FC02, BEH03, EVD01 | 4 | PASS |
| conflict_navigation | SJT05, FC05, BEH04, EVD05 | 4 | PASS |
| initiative | SJT01, FC04, BEH05, EVD02 | 3 | PASS |
| planning | SJT02, FC03, BEH01, EVD03 | 4 | PASS |
| prioritization | SJT03, FC04, BEH03, EVD04 | 3 | PASS |
| precision | SJT01, FC02, BEH02, EVD02 | 3 | PASS |
| adaptability | SJT02, FC03, BEH02, EVD01 | 3 | PASS |
| persistence | SJT03, FC01, BEH03, EVD03 | 3 | PASS |

## Cognitive interpretation review

The manual review question was: “Does this reader see the same decision problem?” It was not: “Would this reader choose the same option?” All 45 questions were read from each perspective.

| Persona | Formal work required | Specialist terms required | Same decision problem | Result |
|---|---|---|---|---|
| 18-year-old with no formal work experience | no | no | yes | PASS |
| hotel / food-service worker | no | no | yes | PASS |
| skilled / on-site technical worker | no | no | yes | PASS |
| office worker | no | no | yes | PASS |
| healthcare / care worker | no | no | yes | PASS |
| freelancer / creator | no | no | yes | PASS |

## Semantic similarity audit

All 990 scenario pairs are compared with normalized character-bigram Jaccard similarity. The automated release gate requires the closest pair to remain below `0.35`. This catches paraphrased duplicates while allowing common plain-language connectors. The current bank passes.

## Signal integrity

Question IDs, question types, ordered option IDs, Talent signals, Energy signals, Interest signals, Talent-interest signals, Work Style signals, Environment signals, and Value signals are unchanged. The canonical signal-contract regression hash remains `7fb2bf31`; no question is marked `SIGNAL_REVIEW_REQUIRED`.
