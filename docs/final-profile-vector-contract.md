# Final Profile Vector Contract

Release Candidate contract, 2026-08-09. All numeric vector values are finite and bounded to `0..1`. Career Fit is a deterministic weighted similarity index, not a probability.

## Talent

The 20 Base Talent IDs are:

`analytical_reasoning`, `pattern_recognition`, `quantitative_reasoning`, `verbal_reasoning`, `spatial_mechanical`, `creative_ideation`, `learning_agility`, `structuring_ambiguity`, `emotional_perception`, `communication`, `influence`, `teaching_coaching`, `coordination`, `conflict_navigation`, `initiative`, `planning`, `prioritization`, `precision`, `adaptability`, `persistence`.

| Contract | Assessment directly measures | User Profile stores | Career Profile has | Career Match uses | Match weight | Other calculation |
|---|---|---|---|---|---:|---|
| Each of the 20 IDs | Yes; four different ability questions and four question types | Yes; score, energy, talent-interest, status, confidence, evidence | Yes; sparse `talentRequirements` | Yes | 35% as one Talent component | Energy modifies sustainable use of the required Talent; Base Talents also derive Composite Talents |

Composite Talents are derived from Base Talents for interpretation. They are not scored again in Career Fit, which prevents their Base Talent components being counted twice.

## Interest

Yes. The public runtime contract is exactly the six RIASEC dimensions:

| Dimension | Assessment | User Profile | Career Profile | Career Match | Weight | Other calculation |
|---|---|---|---|---|---:|---|
| `realistic` | INT01–INT05 | Yes | Yes | Yes | 18% group | Relative RIASEC profile |
| `investigative` | INT01–INT05 | Yes | Yes | Yes | 18% group | Relative RIASEC profile |
| `artistic` | INT01–INT05 | Yes | Yes | Yes | 18% group | Relative RIASEC profile |
| `social` | INT01–INT05 | Yes | Yes | Yes | 18% group | Relative RIASEC profile |
| `enterprising` | INT01–INT05 | Yes | Yes | Yes | 18% group | Relative RIASEC profile |
| `conventional` | INT01–INT05 | Yes | Yes | Yes | 18% group | Relative RIASEC profile |

The internal career-authoring themes are converted to RIASEC before a `CareerProfile` is created. They are not hidden match dimensions.

## Work Style

| Dimension | Assessment | User Profile | Career Profile | Career Match | Weight | Other calculation |
|---|---|---|---|---|---:|---|
| `independent` | ENV05 | Yes | Yes | Yes | 15% group | No |
| `collaborative` | ENV05 | Yes | Yes | Yes | 15% group | No |
| `strategic` | ENV05 | Yes | Yes | Yes | 15% group | No |
| `hands_on` | ENV05 | Yes | Yes | Yes | 15% group | No |
| `detail_focused` | ENV05 | Yes | Yes | Yes | 15% group | No |
| `facilitative` | ENV05 | Yes | Yes | Yes | 15% group | No |

## Environment

Assessment stores user tolerance; Career Profiles store job demand.

| Dimension | Assessment | User Profile | Career Profile | Career Match | Weight | Other calculation |
|---|---|---|---|---|---:|---|
| `socialDensity` | ENV02 | Yes | Yes | Yes | 15% group | Asymmetric over-demand penalty |
| `pace` | ENV01 | Yes | Yes | Yes | 15% group | Asymmetric over-demand penalty |
| `ambiguity` | ENV03 | Yes | Yes | Yes | 15% group | Asymmetric over-demand penalty |
| `mobility` | ENV04 | Yes | Yes | Yes | 15% group | Asymmetric over-demand penalty |
| `risk` | ENV04 | Yes | Yes | Yes | 15% group | Asymmetric over-demand penalty |
| `repetition` | ENV01 | Yes | Yes | Yes | 15% group | Asymmetric over-demand penalty |
| `emotionalLabor` | ENV02 | Yes | Yes | Yes | 15% group | Asymmetric over-demand penalty |
| `structure` | ENV03 | Yes | Yes | Yes | 15% group | Asymmetric over-demand penalty |

## Values

| Dimension | Assessment | User Profile | Career Profile | Career Match | Weight | Other calculation |
|---|---|---|---|---|---:|---|
| `stability` | VAL01–VAL05 | Yes | Yes | Yes | 10% group | No |
| `impact` | VAL01–VAL05 | Yes | Yes | Yes | 10% group | No |
| `autonomy` | VAL01–VAL05 | Yes | Yes | Yes | 10% group | No |
| `learning` | VAL01–VAL05 | Yes | Yes | Yes | 10% group | No |
| `creativity` | VAL01–VAL05 | Yes | Yes | Yes | 10% group | No |
| `helpingOthers` | VAL01–VAL05 | Yes | Yes | Yes | 10% group | No |
| `income` | VAL01–VAL05 | Yes | No | No | 0% | User reflection only |
| `achievement` | VAL01–VAL05 | Yes | No | No | 0% | User reflection only |
| `recognition` | VAL01–VAL05 | Yes | No | No | 0% | User reflection only |
| `workLifeBalance` | VAL01–VAL05 | Yes | No | No | 0% | User reflection only |
| `internationalExposure` | VAL01–VAL05 | Yes | No | No | 0% | User reflection only |
| `careerGrowth` | VAL01–VAL05 | Yes | No | No | 0% | User reflection only |

The six excluded values vary strongly by employer, seniority, location, or role arrangement. `income` is deliberately excluded because salary cannot be part of Career Fit.

## Skills

`transferableSkills` is an explicit background input with shape `Record<string, number>`, where the key is the normalized Career skill ID and the value is `0..1`. Assessment does not infer this field. The public assessment currently supplies an empty record unless a caller provides verified background data; therefore it contributes zero rather than an invented skill level.

| Assessment directly measures | User match input stores | Career Profile has | Career Match uses | Match weight | Other calculation |
|---|---|---|---|---:|---|
| No; external factual input | Yes, if provided | Yes; skill ID, label, importance | Yes | 7% | Entry Distance skill gap, independently |

This is not a hidden dimension: it is an optional, typed, inspectable input. Missing skills are never inferred from Talent or Interest.

## Hidden-dimension conclusion

PASS. Every Career Fit dimension is either directly measured by Assessment or explicitly supplied as background data. Profile coverage reduces unmeasured Assessment groups to zero contribution. Education, experience, certification, portfolio, language, and professional license affect Entry Distance only, never Career Fit.
