# Post-Assessment Career Navigator

## Primary result flow

`Concrete work pattern → Top 3 strengths with evidence → 3 Career Directions → Direction choice or Guided Choice → One 20-minute next step`

The full Talent, interest, energy, environment, Career Match, Surprise Match, and methodology information remains available as a deep dive. Career Fit is evidence for exploration priority, not the headline or a life decision.

## Deterministic Career Directions

`career-direction-engine.ts` maps each Career Family to one plain-language activity direction. It then groups the existing ranked Career Match results, selects up to four non-duplicated representative careers per group, and derives shared Talent requirements. `exploration-priority-engine.ts` uses the representative careers' mean Career Fit as the primary ordering signal.

Confidence, Entry Distance, friction, energy drain risk, and explicit tie-breaker preferences are used only inside the same 0.017 Score Proximity Cluster. Talent and Environment are not added again because Career Fit already contains them. The layer produces labels, not another score, and does not change Career Fit, Talent scoring, Career vectors, or result categories.

## Guided Choice

If the user is still unsure, only the first two directions are compared through three deterministic activity and outcome trade-offs. The majority choice suggests which direction to explore first. Guided answers never enter scoring.

## Journey persistence

The versioned storage service persists `selectedDirection`, `exploredCareers`, `completedExperiences`, `reflectionResults`, and `navigatorState`. Returning users resume from their last exploration state instead of restarting at the report.

## 20-minute career experience

Before starting, the interface states purpose, duration, requirements, and expected outcome. Four steps are shown one at a time. Reflection records felt energy and the preferred part of the activity, then returns one of three guidance states: continue exploring, try a different task, or deprioritize the direction. Reflection does not modify Career Fit.
