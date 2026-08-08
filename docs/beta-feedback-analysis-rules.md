# Beta Feedback Analysis Rules

## Core rule

Feedback is diagnostic evidence. It never automatically retrains scores, changes a Career vector, or lowers a recommendation because one user dislikes it. Career Fit and personal desire are different constructs.

## Investigation triggers

Open an investigation only when at least one condition is met:

1. The same Question is repeatedly marked difficult across independent sessions.
2. The same Talent receives repeated disagreement across meaningfully different user profiles.
3. The same Career repeatedly appears as unreasonable across different profiles.
4. An explanation is demonstrably inconsistent with its stored Answer, Signal, Evidence ID, Career requirement, or core task.
5. Version-segmented diagnostics show a system-wide dimension bias or abnormal distribution.

One report may still be inspected for a deterministic trace defect, but it cannot justify a vector or formula change by itself.

## Required classification

Every issue must receive one primary classification before a change is proposed:

| Classification | Diagnostic question |
|---|---|
| Question Problem | Is the situation unclear, inaccessible, or missing credible options? |
| Signal Mapping Problem | Does the selected option emit the wrong or disproportionate signal? |
| Talent Interpretation Problem | Is the scored construct described inaccurately or too broadly? |
| Career Dataset Problem | Are the role requirements, tasks, environment, or entry requirements inaccurate? |
| Match Formula Problem | Is there repeated cross-profile evidence that weighting or normalization causes a systemic error? |
| Explanation Problem | Is the score defensible but the user-facing reason unsupported or misleading? |
| UX / Copy Problem | Is the result correct but displayed as a grade, certainty, or unique answer? |
| User Preference ≠ Model Error | Does the user understand the reason but simply not want the work? |

## Review sequence

1. Confirm version fields and reject mixed-version aggregation.
2. Reproduce from the exported raw answers.
3. Trace Answer → Signal → Base Talent → Career Requirement → Core Task → Explanation.
4. Compare the component scores, Environment penalty, Entry Distance, and category rule.
5. Check whether the report recurs in other independent sessions.
6. Fix the narrowest demonstrated layer and add a regression test.
7. Re-run score distribution, Golden Personas, and raw-answer integration if an engine or dataset layer changes.

## Prohibited feedback loop

Never implement `user dislikes career → lower Career vector`. Feedback may lead to an audit; only reproducible evidence about the job definition or calculation can lead to a reviewed code/data change.

## Privacy and retention

The current Beta stores feedback locally under one anonymous random session ID. It does not collect name, email, fingerprint, precise location, or unnecessary free-form personal content. Users choose whether to export JSON. Any future server collection requires new, accurate privacy copy and an explicit inventory of transmitted fields.
