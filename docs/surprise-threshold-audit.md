# Surprise Match Threshold Audit

## Sample

The audit uses 17 complete match inputs against all 60 careers:

- 12 Golden Personas
- 5 profiles built end-to-end from raw Quick Discovery answers

Candidates must also be unconsidered, outside other result categories, not `very_high` Entry Distance, and family-diverse within each Surprise list.

| Minimum Fit | Surprise count | Average Fit | Dataset-wide family diversity | Review |
| ---: | ---: | ---: | ---: | --- |
| 0.60 | 46 | 0.650 | 19 | Too permissive; many candidates sit only slightly above the cutoff. |
| 0.65 | 19 | 0.677 | 13 | Better, but still includes several marginal extensions of broad profiles. |
| 0.70 | 3 | 0.706 | 3 | Conservative and explainable; some users correctly receive no Surprise result. |
| 0.75 | 0 | — | 0 | Too strict for the current short assessment and 60-career dataset. |

## Decision

The default is **0.70**. The product must allow an empty Surprise list and later display “目前還沒有足夠證據推薦意外方向” rather than insert a lower-fit career. The threshold remains a tested configuration input for future calibration; it is not lowered to guarantee content.
