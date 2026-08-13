# Assessment phases

Quick Discovery uses two explicit stages. This reduces first-session time without hiding unanswered questions or changing any signal weight.

## Stage 1 — Core discovery

- 25 questions, presented as approximately 5–7 minutes.
- Includes all 15 ability questions: five situational, five behavior, and five evidence questions.
- Every Base Talent retains three independent ability signals across three methods.
- Also includes two energy, two interest, three environment/work-style, and three values questions.
- Produces a deterministic **preliminary result**. The UI must not present it as the completed assessment.

Question order:

`SJT01, BEH01, INT01, SJT02, EVD01, ENV01, BEH02, SJT03, VAL01, EVD02, ENG02, BEH03, SJT04, ENV02, EVD03, INT03, BEH04, SJT05, VAL03, EVD04, ENG04, BEH05, ENV05, EVD05, VAL04`

Initial profile coverage:

- Interest: 40%
- Work style: 100%
- Environment: 50%
- Values: 60%

## Stage 2 — Supplemental validation

- 10 questions, presented as approximately 2–3 minutes.
- Optional after the preliminary result; progress remains saved.
- Adds three energy, three interest, two environment, and two values questions.
- Completing it updates the existing result to full profile coverage.

Question order:

`ENG01, INT02, ENV03, VAL02, ENG03, INT04, ENV04, VAL05, ENG05, INT05`

## Integrity rules

- Question IDs, options, signal mappings, normalization, Talent Engine, Composite Talent Engine, and Career Match formulas are unchanged.
- The same answer set always produces the same result.
- Supplemental questions refine energy and preference profiles; they do not change Base Talent ability scores.
- Preliminary-result screens must show a visible status notice and a route back to the remaining questions.
- A storage-schema migration maps incomplete version 5 sessions to the first unanswered question in the new presentation order.
