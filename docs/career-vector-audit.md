# Career Vector Audit

## Scope

The first Career Knowledge Base contains 60 profiles across 20 families, with three deliberately differentiated careers in each family. The audit runs against the complete runtime profiles rather than the compact authoring seeds.

## Vector composition

Each comparison vector contains:

- 20 Base Talent requirements
- 6 RIASEC interest dimensions
- 6 work-style dimensions
- 8 environment demands
- 6 value dimensions

This produces 46 comparable dimensions per career. Unrequired talents are represented as zero. The career factory fills every non-talent dimension with an explicit baseline, so missing keys cannot silently disappear from matching.

## Automated checks

| Check | Rule | Current result |
| --- | --- | --- |
| Highly similar careers | Cosine similarity ≥ 0.98 | 0 pairs |
| Missing dimensions | Any interest, work-style, environment, or value key absent | 0 careers |
| All abilities elevated | More than 8 Talent requirements ≥ 0.75 | 0 careers |
| Low discrimination | Full-vector standard deviation below 0.14 | 0 careers |
| Family coverage | Every declared family represented | 20 of 20 |
| Family balance | Profiles per family | 3 each |

The executable audit is in `src/utils/career-vector-audit.ts` and is enforced by `tests/career-data.test.ts`.

## Design observations

- Technical profiles separate software analysis, security vigilance, physical mechanics, precision production, and licensed safety work instead of using one generic “analytical” vector.
- People-facing profiles distinguish emotional labor, social density, persuasion, teaching, conflict work, and operational coordination.
- Creative profiles distinguish language, sound, moving image, interactive narrative, spatial fabrication, and brand strategy.
- Planning-heavy profiles differ by risk, repetition, pace, mobility, structure, and required precision. This prevents Project Management, Clinical Research, Tour Operations, and Product Operations from collapsing into one vector.
- `entryBarrier` is descriptive metadata; personalized Entry Distance is calculated independently from education, skills, experience, certification, portfolio, language, and professional license gaps.

## Remaining QA work

The current vectors are expert-authored hypotheses, not labor-market norms. Before production use they need structured review by practitioners, user outcome calibration, localization of licensing requirements, and versioning. Similarity thresholds should be monitored when more careers are added; passing the current audit does not prove predictive validity.
