# Career Discovery Implementation Plan

## Round 1 — Foundation

- [x] Audit the repository and choose the initial stack.
- [x] Establish separated source, data, engine, test, and documentation boundaries.
- [x] Define the requested TypeScript domain types.
- [x] Create 20 base talents across Thinking, People, and Execution.
- [x] Create 12 weighted composite talents with minimum evidence requirements.
- [x] Define all nine question types and five option signal outputs.
- [x] Add a framework-independent signal aggregation primitive.
- [x] Add data integrity and engine unit tests.
- [x] Document architecture and the data model.
- [x] Author the first 45-question Quick Discovery bank with balanced coverage.
- [x] Add career records (completed in Round 3).
- [ ] Build the full interface (deliberately deferred).

## Round 2 — Measurement design

- [x] Define behavior-centered indicators for every Base Talent.
- [x] Author a balanced Quick Discovery bank across eight required question types.
- [x] Separate ability, energy, interest, environment, and value observations.
- [x] Implement response validation, scale normalization, status, and confidence calculation.
- [x] Add six synthetic profiles and deterministic output regression tests.
- [ ] Calibrate weights and thresholds with real users and expert review.
- [ ] Version the question bank before collecting persisted production responses.

Exit criteria: every scored claim traces to question options and evidence; measurement coverage and conflicts are tested.

## Future product delivery — Talent profile UI

- Implement base-talent normalization and composite calculation.
- Model energy separately from demonstrated capability.
- Build the questionnaire state flow, resume behavior, and accessible interaction components.
- Present behavior evidence, strengths, uncertainty, and exploration prompts.

Exit criteria: a user can complete the assessment and receive an explainable talent/work profile without any career recommendation.

## Round 3 — Career knowledge and matching

- [x] Define 20 Career Families and 60 differentiated profiles.
- [x] Add automated vector completeness, elevation, discrimination, and similarity audits.
- [x] Implement the 35/18/15/15/10/7 deterministic match formula.
- [x] Implement asymmetric environment penalties across eight dimensions.
- [x] Keep personalized Entry Distance independent from Career Fit.
- [x] Implement disjoint Best Fit, Easier Transition, High Potential, and Surprise Me selection.
- [x] Return structured explanation reasons, frictions, confidence, and evidence IDs.
- [x] Run 12 Golden Personas without persona-specific engine branches.
- [ ] Review profiles with practitioners and version the dataset before production persistence.

Exit criteria: each recommendation shows fit dimensions, evidence, uncertainty, cautions, and practical gaps.

## Round 3.5 — Integration acceptance

- [x] Replace the drifted eight-interest runtime schema with RIASEC six dimensions.
- [x] Connect raw answers to Interest, Work Style, Environment, and all 12 user Values.
- [x] Document the six Values matched in MVP and six retained for explanation only.
- [x] Add the raw-answer-to-final-results orchestration engine.
- [x] Trace Career reasons to Talent, Evidence, Question, option, and raw answer.
- [x] Audit four Surprise thresholds and adopt 0.70 without forcing results.
- [x] Audit the top 20 nearest Career pairs by component and overall similarity.
- [x] Stress-test Environment and Entry Distance behavior.
- [x] Preserve automated missing-data and full-pipeline regression tests.

## Future product delivery — Career experiments

- Define low-cost experiments tied to career hypotheses and missing evidence.
- Track completion, reflection, energy, and observed behaviors.
- Feed experiment evidence back into confidence without erasing prior contradictions.

Exit criteria: users can test a career hypothesis and see how new evidence changes—not merely confirms—their profile.

## Cross-cutting work

- Privacy and data retention for sensitive self-assessment responses.
- Accessibility, localization, analytics consent, and error handling.
- Versioning and migration for questions, scoring, and career data.
- CI for typecheck, unit tests, production build, and later end-to-end tests.
- Deployment configuration after the hosting target and base URL are confirmed.
