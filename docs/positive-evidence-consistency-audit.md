# Positive Evidence Gate and Career Taxonomy Audit

> Historical release audit. Its positive-evidence gate and legacy alignment labels were replaced by the coverage-separated demand-fit model in `docs/measurement-model.md`.

Audit date: 2026-08-10

## Root cause

The previous public interpretation treated relative Career Fit rank as sufficient for a strong public recommendation. Public Career Groups also aggregated requirements and tasks across several specific careers, while Career Detail reused that group-level interpretation. A high relative rank could therefore produce a strong label even when the selected specific career had no directly supported required talents.

The core Career Fit calculation was not the defect and was not changed. The defect was the semantic layer that translated a relative score into an absolute recommendation and then explained a specific career with group-level evidence.

## Evidence states

- `strong_alignment`: adequate coverage, a high talent signal, at least two independent positive evidence items, and sufficient overlap with career demand.
- `moderate_alignment`: adequate coverage, at least one positive evidence item, and partial overlap with career demand.
- `low_overlap`: adequate opportunity to observe the talent, with a supported result that is currently below the career demand.
- `insufficient_evidence`: coverage, confidence, or evidence count is inadequate. This is unknown, not low ability and not mismatch.

Required talents are ordered by their career requirement weights and assigned `core`, `supporting`, or `minor` importance. Public explanations inspect the highest-priority five requirements.

## Positive Evidence Gate

A strong recommendation requires all of the following:

1. At least two positive alignments (`strong_alignment` or `moderate_alignment`).
2. At least one positive alignment on a `core` talent.
3. Confidence is at least Medium.
4. No High environment friction.
5. No High energy risk.
6. For Public Career Groups, at least half of the included specific careers independently qualify as strong recommendations.
7. Relative percentile is at least 0.75, the result is meaningfully above the median, and Interest and Work Style are not materially low.

Relative rank and absolute evidence quality are stored separately. Zero positive alignments can never produce `strong_recommendation`, including at rank 1.

The interpretation gate does not recalculate or reduce Career Fit when evidence is missing. Missing evidence is represented through confidence and prevents a strong public conclusion until support is available. A lower public classification requires an explicit, adequately evidenced mismatch; missing evidence alone cannot produce it.

## Recommendation source

- `ability_led`: positive ability evidence is the main support.
- `interest_led`: interest is the main support and ability evidence is not yet broad enough.
- `environment_led`: Work Style and environment are the main support.
- `mixed`: ability evidence plus Interest or Work Style/environment support the result together.
- `weak_relative`: the career is mainly present because it ranks above alternatives, without concentrated absolute evidence.

## Career Detail source of truth

Specific Career Detail now reads that career's own talent requirements, core tasks, component scores, environment friction, energy risk, and evidence states. It no longer reuses the aggregate Public Career Group alignments.

The page order is:

1. Why this career appeared, recommendation strength, source, confidence, and up to three reasons.
2. Positive abilities and the exact task where each ability is used.
3. Normal work and common tasks.
4. Abilities that still need confirmation.
5. Low-overlap, environment, and energy considerations.
6. Related titles and skills.
7. Entry information, shown as background-insufficient until education, skills, experience, licences, and portfolio data are supplied.
8. A low-cost career experiment.

## Content Strategist reproduction

The browser QA profile that reproduced the contradiction now produces:

| Component | Index |
| --- | ---: |
| Talent Match | 3 / 100 |
| Interest Match | 56 / 100 |
| Work Style Match | 47 / 100 |
| Environment Match | 74 / 100 |
| Values Match | 40 / 100 |
| Skill Match | 0 / 100 |
| Environment Penalty Index | 26 / 100 |

It ranks 27 of 60 for this profile. The recommendation is now `exploratory`, the source is `interest_led`, and the public label is “需要更多證據”. The explanation explicitly says that interest and environment place it in the results while ability support remains unconfirmed.

## Very Suitable audit

The regression set covers 24 deterministic synthetic profiles and 12 Golden Personas. It produced 97 strong Public Career Group cases after the gate. Every one passed the gate, contained at least two positive alignments including one core alignment, and linked to a representative specific career that independently passed the same gate. Zero strong cases had zero positive evidence. Seventeen profiles legally produced no strong result and used the exploration fallback.

## Public taxonomy

Primary UI now uses only:

- 非常適合
- 普通
- 較不適合目前的你

When strong results are empty, the UI hides that empty classification and shows “目前較值得探索”. Empty moderate and lower sections are hidden. Surprise is conditional and appears only as “你可能沒想過的方向”. The complete 60-career ranking is secondary disclosure.

`Best Fit`, `Easier Transition`, `High Potential`, and `Surprise Me` remain only where needed as internal diagnostic/category data. They are not public primary tabs. Entry ease is not presented as a strong conclusion without user background data.

## Verification

- Regression A: rank 1 plus zero positive evidence is not strong — PASS.
- Regression B: high-relative result with multiple supported talents and low friction may be strong — PASS.
- Regression C: high interest plus insufficient ability evidence remains exploratory — PASS.
- Regression D: supported ability plus High energy risk is not strong — PASS.
- Regression E: strong talent support, moderate interest, and supportive environment may be strong — PASS.
- Empty-taxonomy regression A–E — PASS.
- Desktop and 390 px browser QA — PASS, with no horizontal overflow or console errors.
