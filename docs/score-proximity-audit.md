# Score Proximity Audit

## Input

The audit used 12 Golden Personas and 20 deterministic complete synthetic profiles. Each profile produced three Career Directions from the original 60 Career Match results. Adjacent Direction mean Career Fit gaps produced 64 observations.

| Gap statistic | Career Fit gap |
|---|---:|
| P25 | 0.0079 |
| Median | 0.0165 |
| P75 | 0.0338 |
| P90 | 0.0479 |
| Maximum | 0.0939 |

## Epsilon decision

The Score Proximity epsilon is **0.017 Career Fit units** (1.7 index points), aligned to the observed median adjacent Direction gap after Direction ranking was changed to use Career Fit as its primary signal. This is intentionally smaller than an arbitrary five-point band: directions separated by more than the typical observed adjacent gap retain separate priority clusters.

The regression test recalculates the audit sample and fails if the observed median moves outside 0.014–0.019. A future dataset or matching change must rerun this audit before changing epsilon.

## Interpretation

Directions within epsilon belong to the same priority cluster. They do not receive artificial `#1`, `#2`, `#3` claims. If the top cluster contains multiple directions, or confidence is too low to distinguish them, the UI activates a Guided Tie-breaker and reports Decision Clarity as ambiguous until direct preference evidence becomes consistent.
