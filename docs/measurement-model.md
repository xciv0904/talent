# Measurement Model

## Separation of concepts

- Evidence coverage: how many designed measurement opportunities were answered.
- Talent strength: the normalized directional support selected across those opportunities.
- Talent alignment: the observed strength and within-profile rank used to compare against a job demand.
- Consistency: whether independent contexts point in the same direction; consistently low support is still consistent.
- Confidence: coverage, independent methods, response consistency, and question evidence quality.
- Career suitability: talent demand fit plus interest, work style, environment, values, skills, and explicit energy risk.

Confidence never uses the talent score or number of positive signals as a proxy for measurement completeness. A competing option is a valid response and counts toward coverage.

## Per-talent measurement summary

Every base talent returns:

```ts
{
  talentId,
  opportunities,
  answeredOpportunities,
  validResponses,
  positiveSignals,
  negativeOrCompetingSignals,
  crossContextConsistency,
  normalizedScore,
  confidence,
}
```

`insufficient_evidence` is reserved for inadequate coverage or fewer than two independent methods. A low but fully measured score is `observed_not_prominent`.

## Career demand fit

Career demand comparison returns one of:

- `exceeds_requirement`
- `meets_requirement`
- `partial_gap`
- `significant_gap`
- `unknown`

The comparison combines the absolute talent score with its relative position among the user's 20 talents. This corrects the scale difference between four-way forced choices and career demand vectors without modifying the original Talent Score. Confidence and energy remain separate: neither lowers the ability score, while energy can still block a strong recommendation as an explicit risk.

## Calibration guardrails

- A complete 45-question assessment measures all 20 talents through four independent ability contexts.
- At least 95% completion cannot become Low confidence solely because a talent is not prominent.
- Strong career classification requires at least two demands met or exceeded, at least one core demand met, no multiple significant gaps, no high environment or energy risk, and adequate confidence.
- Relative rank may prioritize exploration but cannot by itself erase an evidenced mismatch.
