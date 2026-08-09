# Beta Feedback Schema

Public Beta data is stored locally in `AppStorageState.betaFeedback`. The user must explicitly choose an export action before any JSON leaves the browser.

## Version envelope

- `sessionId`: random anonymous UUID prefixed with `beta_`
- `schemaVersion`: BetaFeedback schema version
- `assessmentVersion`
- `talentModelVersion`
- `careerDatasetVersion`
- `matchingEngineVersion`
- `explanationVersion`
- `storageSchemaVersion`
- `timestamp`: last feedback update
- `assessmentStartedAt`, `assessmentCompletedAt`: optional lifecycle timestamps

## Feedback arrays

- `overallFeedback`: one result-level response
- `nextStepClarity`: `very_clear`, `mostly_clear`, `still_uncertain`, or `completely_unclear`
- `talentFeedback[]`: `compositeTalentId`, agreement, discovery value, timestamp
- `careerFeedback[]`: `careerId`, response, timestamp
- `surpriseFeedback[]`: `careerId`, response, timestamp
- `questionFeedback[]`: `questionId`, reason, timestamp
- `optionalComment`: optional, trimmed and limited to 2,000 characters

Each entity array is upserted by its stable ID, so one session cannot inflate counts by repeatedly pressing the same control. Invalid enum values, timestamps, or malformed records are removed during storage parsing.

## Export structures

The Beta Feedback export adds `answeredQuestionCount`, `currentQuestionIndex`, and `completed`, enabling completion and drop-off aggregation. Diagnostic export separately contains answers, signals, normalized profiles, score components, Environment penalties, Entry Distance, evidence IDs, and result categories.

Neither export contains name, email, user agent, device fingerprint, precise location, browsing history, or other device metadata.

## Dashboard-ready aggregations

Version-segmented exports can calculate completion rate, question unclear rate, Talent agreement, Hidden Talent discovery, Career recommendation responses, unexpected-but-interesting responses, clearly-wrong responses, Surprise usefulness, result clarity, and Next-Step Clarity. Feedback is never an input to Career Match.
