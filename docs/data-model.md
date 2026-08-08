# Career Discovery Data Model

## Talent model

### `TalentDefinition`

A single observable capability. It includes a stable `id`, bilingual names, a behavior-centered description, and one category: `thinking`, `people`, or `execution`.

### `CompositeTalent`

A recognizable combination of base talents. `components` lists required base talent IDs; `weights` declares their relative contribution and must sum to 1; `minimumEvidence` prevents a composite result from appearing confident without enough behavioral support.

### `UserTalentProfile`

The calculated user result. It stores scored base talents with evidence and confidence, calculated composite scores, and a generation timestamp. It is a derived result, not raw questionnaire state.

## Evidence and confidence

`Evidence` records where a claim came from (`question`, `behavior_example`, `reflection`, or `experiment`), what it supports, its strength, and optionally when it occurred.

`ConfidenceResult` is separate from score. A high score means strong positive signals; high confidence means the result is supported by enough relevant evidence. Confidence uses question coverage, cross-method consistency, and evidence quality, then exposes only `low`, `medium`, or `high` as its conclusion. The supporting factors are normalized diagnostic inputs, not a claimed probability.

All normalized score and confidence fields use a `0..1` range unless a specific engine contract documents otherwise. Raw question signal weights may be negative or positive and are normalized later.

## Question schema

`Question` is a discriminated union keyed by `type`:

| Family | Types | Response contract |
| --- | --- | --- |
| Choice | `situational_choice`, `forced_choice`, `energy`, `interest`, `environment`, `values` | Single or multiple selection |
| Ranking | `ranking` | Ordered option IDs and required rank count |
| Scale | `behavior`, `evidence` | Bounded numeric scale |

Every `QuestionOption` can emit any combination of:

- `talentSignals`: weights keyed by the closed `TalentId` taxonomy
- `energySignals`: energy gained or drained by an activity
- `interestSignals`: RIASEC attraction (`realistic`, `investigative`, `artistic`, `social`, `enterprising`, `conventional`)
- `talentInterestSignals`: interest in using a specific Talent, kept separate for Talent Status
- `workStyleSignals`: preferred contribution method rather than external job conditions
- `environmentSignals`: preferred conditions such as autonomy or pace
- `valueSignals`: the 12-value user contract, such as stability, impact, learning, or work-life balance

Signals are optional so an option can measure one dimension without creating false implications in another. Questions and options use stable IDs; displayed labels may change without breaking stored responses.

Energy and interest signals use Talent IDs but are separate channels. They never contribute to ability normalization. This permits a result such as high communication ability with high communication energy cost.

`QuestionResponse` stores the selected IDs, optional ranking or scale value, and timestamp. It deliberately does not store computed scores.

## Profile model

### `InterestProfile`

Aggregated interest scores, the strongest interest IDs, and supporting evidence.

### `WorkEnvironmentProfile`

Preference scores plus explicit must-haves and avoidances. These constraints should be visible in match explanations rather than silently averaged away.

### `ValueProfile`

Value priorities and a user-visible ranking. A future engine should distinguish stated values from behaviorally demonstrated values when sufficient evidence exists.

## Career model

### `CareerProfile`

A curated career record with bilingual titles and aliases, family, description, core tasks, Base Talent requirements, complete interest/work-style/environment/value vectors, transferable skills, explicit entry requirements, related careers, and a low-cost career experiment.

### `CareerMatchResult`

A derived comparison containing the weighted match score and all six component scores, confidence level, Entry Distance, top Talent reasons, interest reasons, environment reasons, potential frictions, and supporting evidence IDs. It references a Career ID rather than duplicating the profile.

### `EntryDistance`

Estimates the practical gap between the user and an entry path: education, skills, experience, certification, portfolio, language, and professional license. It outputs `low`, `medium`, `high`, or `very_high` plus component gaps and reasons. It remains distinct from suitability—a career may fit well but require a longer transition.

## Career Match weights

- Talent Match: 35%
- Interest Match: 18%
- Work Style Match: 15%
- Environment Match: 15%
- Values Match: 10%
- Transferable Skills: 7%

Environment compares job demand against user tolerance. Demand above tolerance receives a 1.75× penalty; unused tolerance receives a smaller 0.65× preference difference. The eight dimensions are social density, pace, ambiguity, mobility, risk, repetition, emotional labor, and structure.

A dominant-mismatch term prevents one severe over-tolerance demand from disappearing when averaged with seven benign dimensions. The Environment component remains capped and only contributes its documented 15% to total Fit.

## Validation invariants

- Base talent and composite IDs are unique and stable.
- Composite components reference existing base talents only.
- Composite weights cover their components and sum to 1.
- Question responses only reference options belonging to their question.
- Ranking responses contain no duplicates and respect `rankCount`.
- Normalized results remain within `0..1`.
- Match results always include a confidence result and entry distance.

Compile-time TypeScript contracts enforce shape. Runtime validation for imported or persisted untrusted data should be added with the first storage boundary.

## Talent Status

Status is derived in the engine rather than UI code:

- `natural_strength`: demonstrated ability plus positive energy.
- `developed_strength`: demonstrated ability without positive energy, including a capability that is costly to sustain.
- `emerging_potential`: partial behavioral support or early interest support.
- `interest_only`: interest is present but demonstrated ability is not yet supported.
- `energy_drain`: the activity is consistently costly without strong ability evidence.
- `insufficient_evidence`: coverage/confidence is too low, or no positive status can yet be supported.

Status thresholds are centralized in `talent-engine.ts` and protected by unit tests.
