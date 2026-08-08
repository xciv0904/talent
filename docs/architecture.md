# Career Discovery Architecture

## Product boundary

Career Discovery turns observed behavior into increasingly actionable layers:

`Real behavior → Behavior Signals → Base Talents → Hidden/Composite Talents → Work Profile → Career Match → Career Experiment`

It is not a personality typing test and does not let an AI freely invent career recommendations. Deterministic data and scoring rules remain in the application; any future AI service must explain or summarize structured results rather than replace them.

## Repository audit (round 1)

The repository began as an empty Git repository on `main`, with no commits, remote, source files, framework, router, components, CSS system, state management, data, tests, build scripts, or deployment configuration. The initial foundation therefore uses the requested defaults:

- React, Vite, and TypeScript
- Tailwind CSS through the official Vite plugin
- Vitest for pure domain and data validation tests
- No router or global state library yet; neither is needed by the round-one placeholder page
- No deployment configuration yet

## Source boundaries

```text
src/
├── components/            shared presentational components
├── data/
│   ├── careers/           curated career profiles (deferred)
│   ├── questions/         typed question bank (authoring deferred)
│   └── talents/           base and composite talent definitions
├── engine/                deterministic scoring and matching logic
├── pages/                 route-level product screens
├── services/              persistence and external-service adapters
├── styles/                Tailwind entry point and global tokens
├── types/                 domain contracts, not runtime data
└── utils/                 framework-independent helpers
tests/                     domain, scoring, and data integrity tests
docs/                      architecture and domain documentation
```

Dependencies flow inward toward types and pure domain logic:

```text
pages/components → engine/services → data/types
```

`data` must not import React. `engine` must remain framework-independent. React components may render results and dispatch answers, but may not contain scoring weights or career-matching rules.

## Data and scoring flow

1. A `Question` presents typed `QuestionOption` records.
2. Selected options emit talent, energy, interest, environment, and value signals.
3. The engine aggregates signals and attaches user-provided behavioral `Evidence`.
4. Base-talent scores are derived from repeated signals, not one isolated answer.
5. Composite talents combine named base talents using explicit weights and a minimum evidence requirement.
6. Work profiles combine talents with interests, environment preferences, and values.
7. Career matching compares those profiles against curated `CareerProfile` records and reports fit, confidence, cautions, and entry distance.
8. Later career experiments gather new evidence and can update confidence.

Rounds one and two implement steps 1–5: the Quick Discovery bank, normalized signal observations, Base Talent scoring, Composite Talent scoring, energy/interest separation, Talent Status, and confidence. Work Profile and all Career Match stages remain deferred.

Round three adds the Career Knowledge Base and deterministic steps 6–7: multi-dimensional fit, asymmetric environment penalties, personalized Entry Distance, distinct result categories, Surprise Match, and structured explanations. Career UI and labor-market ranking remain deferred.

## Deterministic engine layers

- `assessment-engine` validates responses, normalizes bounded scales, and produces traceable observations plus question opportunities.
- `talent-engine` scores Base Talents against answered opportunities, derives energy and interest independently, assigns Talent Status, and calculates confidence.
- `composite-talent-engine` applies the explicit component weights from data and carries component confidence and energy into the composite result.

No engine reads the clock, calls a network service, or invokes AI. Identical question data and responses therefore produce identical scoring output. Timestamps remain input metadata and do not affect scores.

Career matching is split into three boundaries:

- `career-match-engine` calculates the six fit dimensions and explanation evidence.
- `entry-distance-engine` calculates transition difficulty without lowering Career Fit.
- `career-result-engine` selects Best Fit, Easier Transition, High Potential, and Surprise Me with separate filters and disjoint results.

Market popularity, salary, and job-opening counts are absent from both the Career Profile and formula.

## End-to-end integration

`integration-engine` is the single orchestration boundary from raw `QuestionResponse[]` to Assessment observations, Base and Composite Talents, profile vectors, Career matches, Entry Distance, categories, and explanations. It accepts optional background facts but defaults missing skills, familiarity, credentials, and experience safely. No UI state is required to run the pipeline.

Question evidence receives a deterministic ID plus `questionId`, `optionId`, and `talentId`. Career explanations collect evidence only from the exact Talent named by each reason, allowing `Career → Talent → Evidence → Question → Answer` tracing.

## State and persistence

No state library is selected yet. Local component state and typed engine functions are sufficient until the questionnaire flow is designed. Before adding a store, define its state transitions and persistence needs; prefer a small reducer or lightweight store over server-state machinery.

Future persistence belongs behind `src/services/`. Domain types must not depend on browser storage, network clients, or vendor SDKs.

## Routing and deployment

Routing is intentionally deferred until product routes are agreed. The current Vite entry renders one foundation status page. Deployment is also deferred; a later decision should account for SPA fallback behavior, base paths, environment variables, and privacy requirements for user responses.

## Testing strategy

- Data integrity: unique IDs, exact taxonomy counts, valid references, normalized composite weights.
- Engine unit tests: deterministic assessment, normalization, Base Talent, Composite Talent, energy, status, and confidence calculations.
- Schema fixtures: every supported question type and signal family.
- UI tests later: answer interactions and accessible states.
- Synthetic profile tests: six deliberately different answer patterns must produce distinct top-talent signatures.
- End-to-end tests later: questionnaire through career experiment.

## Guardrails

- Do not put question weights or scoring branches in React components.
- Do not infer talent from demographics or identity attributes.
- Do not treat a high match score as a promise of career success.
- Keep negative and contradictory evidence; confidence must reflect its quality and amount.
- Version future question banks, career taxonomies, and scoring formulas so results remain explainable.
