# Public Beta Success Metrics

These are product-learning metrics, not scientific validation and not evidence that the model predicts career success. Metrics must be segmented by `assessmentVersion`, `talentModelVersion`, `careerDatasetVersion`, `matchingEngineVersion`, and `explanationVersion`; different versions must not be pooled.

## Completion

- Assessment starts: sessions with `assessmentStartedAt`.
- Assessment completions: sessions with `assessmentCompletedAt` and a versioned result.
- Completion rate: completed sessions / started sessions.
- Drop-off location: last saved `assessmentProgress.currentIndex`, aggregated without device fingerprinting.

## Result Clarity

- Clear/useful responses: `clearer_direction`, `discovered_abilities`, and `useful_but_unclear` reported separately.
- Explicit clarity problem: `hard_to_understand`.
- Self-model disagreement: `very_different_from_self`; this is not automatically a scoring defect.

## Next-Step Clarity

- Primary Navigator metric: report `very_clear`, `mostly_clear`, `still_uncertain`, and `completely_unclear` separately.
- Positive clarity combines `very_clear` and `mostly_clear` only after displaying the separate counts.
- Do not infer Next-Step Clarity from Talent agreement or Career Fit; it measures whether the result created an actionable next step.

## Talent Agreement

- Agreement numerator: Composite Talent feedback marked `strongly_agree` or `mostly_agree`.
- Denominator: Composite Talents receiving an agreement response.
- Report each Composite Talent separately before producing an overall rate.

## Discovery Value

- Discovery responses: `felt_it_not_named` and `new_discovery`, reported separately and combined.
- Known strengths: `already_knew`.
- Disagreement: `disagree`; investigate the evidence path before changing the model.

## Career Reasoning Quality

- Positive or understandable reasoning: `strong_fit`, `already_considered`, `unexpected_interested`, or `reason_clear_not_desired`.
- Desire must remain separate: `reason_clear_not_desired` means the explanation can be valid even when the user does not want the work.
- Clearly questionable recommendation: `unreasonable`.

## Career Discovery Value

- Unexpected-but-interesting rate: `unexpected_interested` / Career recommendations receiving feedback.
- Already-considered rate: `already_considered` / Career recommendations receiving feedback.

## Surprise Match Usefulness

- Useful surprise: `unexpected_attractive` or `unexpected_reasonable`.
- Familiar but newly considered: `known_not_considered`.
- Preference rejection: `not_interested`; do not classify as a model error.
- Reason failure: `reason_invalid`; trace Answer → Signal → Talent → Career Requirement before deciding the cause.

## Question Quality

- Question unclear rate: sessions marking a Question / sessions that answered that Question.
- Reasons remain separate: none fit, multiple fit, unclear context, unclear difference, and no prior experience.
- Do not combine “multiple fit” with “none fit”; they imply different revisions.

## Pre-registration rule

No numerical pass threshold is declared before the first Beta sample. The first cohort establishes an observed baseline and confidence interval. Any later success threshold must be documented before examining the next cohort and cannot be described as scientific validation without a separate validation design.
