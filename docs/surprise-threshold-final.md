# Surprise Threshold Final Validation

## Sample

12 Golden Personas plus 10 deterministic complete raw-answer profiles, all beginning with 45 Question Answers. Surprise selection also requires: not Best Fit, not already considered, familiarity below 0.5, Entry Distance below Very High, and family diversity.

| Threshold | Profiles with result | Surprise count | Average match | Minimum match | Family diversity | Mean conceptual overlap with Best Fit |
|---:|---:|---:|---:|---:|---:|---:|
| 0.60 | 2 / 22 (9.1%) | 2 | 0.616 | 0.612 | 2 | 0.389 |
| 0.65 | 0 / 22 (0%) | 0 | — | — | 0 | — |
| 0.70 | 0 / 22 (0%) | 0 | — | — | 0 | — |
| 0.75 | 0 / 22 (0%) | 0 | — | — | 0 | — |

## Manual review

| Profile | Best Fit | Surprise | Review |
|---|---|---|---|
| quantitative | Data Analyst, Product Analyst, Industrial Engineer | Market Researcher | Plausible adjacent use of quantitative, analysis, and research abilities in another family; not forced |
| people_developer | Career Coach, Customer Success Manager | Guest Experience Manager | Plausible transfer of empathy, communication, and conflict navigation into hospitality; not forced |

## Final decision

The formal threshold is **0.60**. On this score distribution, 0.60 is well above P90 (0.450), close to the observed maximum (0.659), and produced only two reviewable directions. Thresholds of 0.65 and above made the category permanently empty in the validation sample. Empty results remain allowed; the UI explicitly says that no direction cleared the threshold.

During this audit, category ordering was fixed: Surprise was previously evaluated after Easier Transition had consumed eligible low/medium-distance careers, making Surprise a residual bucket rather than an independent rule. Best Fit and the distinct high-entry High Potential category are selected first; Surprise is evaluated before Easier Transition. All four outputs remain disjoint.
