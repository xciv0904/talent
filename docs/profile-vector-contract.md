# Profile Vector Contract

This is the runtime contract shared by Assessment, persisted user profiles, Career Profiles, and Career Match. Career authoring themes are converted at the data boundary and are not profile dimensions.

## Talent and energy

All 20 Base Talent IDs are produced by Assessment, stored in `UserTalentProfile`, represented by `CareerProfile.talentRequirements`, and read by Talent Match. Energy is stored independently per Base Talent; Career Match uses it only as a sustainability modifier for required talents. Composite Talents are derived and shown as explanations, but are not weighted again in Career Match because their Base Talent components are already counted.

## Interest — RIASEC

| Group | Dimension | Assessment | User Profile | Career | Match Engine |
| --- | --- | --- | --- | --- | --- |
| Interest | realistic | INT01–INT05 | Yes | Yes | Yes |
| Interest | investigative | INT01–INT05 | Yes | Yes | Yes |
| Interest | artistic | INT01–INT05 | Yes | Yes | Yes |
| Interest | social | INT01–INT05 | Yes | Yes | Yes |
| Interest | enterprising | INT01–INT05 | Yes | Yes | Yes |
| Interest | conventional | INT01–INT05 | Yes | Yes | Yes |

The former eight `data/systems/people/ideas/making/service/persuasion/creative_expression` fields were development-time career-authoring themes, not the specified user Interest model. They are now private inputs to the Career factory and are converted into RIASEC before a `CareerProfile` exists. Assessment, User Profile, Career Profile, and Match Engine all use RIASEC only.

Assessment scoring: each interest option emits one or two RIASEC signals. Selected support is divided by available question opportunities, then the six-dimensional profile is normalized relative to the user's strongest RIASEC dimension.

## Work Style

| Group | Dimension | Assessment | User Profile | Career | Match Engine |
| --- | --- | --- | --- | --- | --- |
| Work Style | independent | ENV05 | Yes | Yes | Yes |
| Work Style | collaborative | ENV05 | Yes | Yes | Yes |
| Work Style | strategic | ENV05 | Yes | Yes | Yes |
| Work Style | hands_on | ENV05 | Yes | Yes | Yes |
| Work Style | detail_focused | ENV05 | Yes | Yes | Yes |
| Work Style | facilitative | ENV05 | Yes | Yes | Yes |

## Environment tolerance / demand

| Group | Dimension | Assessment | User Profile | Career | Match Engine |
| --- | --- | --- | --- | --- | --- |
| Environment | socialDensity | ENV02 | Yes | Yes | Yes |
| Environment | pace | ENV01 | Yes | Yes | Yes |
| Environment | ambiguity | ENV03 | Yes | Yes | Yes |
| Environment | mobility | ENV04 | Yes | Yes | Yes |
| Environment | risk | ENV04 | Yes | Yes | Yes |
| Environment | repetition | ENV01 | Yes | Yes | Yes |
| Environment | emotionalLabor | ENV02 | Yes | Yes | Yes |
| Environment | structure | ENV03 | Yes | Yes | Yes |

Assessment stores user tolerance; Career Profiles store job demand. Job demand above tolerance receives the asymmetric penalty.

## Values

| Group | Dimension | Assessment | User Profile | Career | Match Engine |
| --- | --- | --- | --- | --- | --- |
| Values | stability | VAL01–VAL05 | Yes | Yes | Yes |
| Values | income | VAL01–VAL05 | Yes | Yes | No — explanation only |
| Values | achievement | VAL01–VAL05 | Yes | Yes | No — explanation only |
| Values | impact | VAL01–VAL05 | Yes | Yes | Yes |
| Values | autonomy | VAL01–VAL05 | Yes | Yes | Yes |
| Values | learning | VAL01–VAL05 | Yes | Yes | Yes |
| Values | creativity | VAL01–VAL05 | Yes | Yes | Yes |
| Values | helpingOthers | VAL01–VAL05 | Yes | Yes | Yes |
| Values | recognition | VAL01–VAL05 | Yes | Yes | No — explanation only |
| Values | workLifeBalance | VAL01–VAL05 | Yes | Yes | No — explanation only |
| Values | internationalExposure | VAL01–VAL05 | Yes | Yes | No — explanation only |
| Values | careerGrowth | VAL01–VAL05 | Yes | Yes | No — explanation only |

The six matched Values are reasonably expressible as occupation-level work characteristics. The other six are retained in the user result but excluded from Career Fit because they depend heavily on employer, seniority, location, compensation, or role arrangement. In particular, `income` is excluded to preserve the rule that Career Fit cannot contain salary. These Values may later support explanation or user-controlled filters, but are not silently discarded.

## Missing data

Every vector group carries coverage metadata. Missing groups are stored as zero evidence with zero coverage; Matching multiplies that component by coverage instead of assuming a neutral or high preference. Missing skills remain zero, missing energy remains `null`, and Talent confidence falls when question coverage is incomplete.
