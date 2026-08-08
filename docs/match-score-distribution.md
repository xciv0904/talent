# Match Score Distribution

## Sample and aggregate distribution

12 Golden Personas plus 20 deterministic synthetic complete raw-answer profiles × all 60 Careers = 1,920 Career Matches. No prebuilt TalentProfile was used for these runs.

| min | P10 | P25 | median | mean | P75 | P90 | max |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 0.151 | 0.266 | 0.304 | 0.349 | 0.355 | 0.400 | 0.450 | 0.659 |

## Per-profile ranking summary

| Profile | Top 1 | Top 5 avg | Top 10 avg | Median | Bottom 10 avg |
|---|---:|---:|---:|---:|---:|
| empathy_communicator | .565 | .520 | .502 | .392 | .300 |
| analytical_precision | .503 | .493 | .470 | .354 | .273 |
| creative_spatial | .499 | .466 | .451 | .367 | .287 |
| teacher | .647 | .578 | .542 | .401 | .256 |
| leadership | .442 | .419 | .408 | .332 | .270 |
| mechanical | .544 | .511 | .482 | .353 | .268 |
| planner | .552 | .490 | .468 | .359 | .261 |
| persuader | .521 | .469 | .442 | .328 | .244 |
| quantitative | .659 | .618 | .576 | .373 | .259 |
| ambiguity_structurer | .474 | .460 | .443 | .348 | .255 |
| verbal | .540 | .498 | .470 | .353 | .250 |
| adaptable | .496 | .443 | .421 | .332 | .260 |
| systems_analyst | .635 | .580 | .551 | .385 | .259 |
| story_catalyst | .507 | .484 | .463 | .338 | .258 |
| people_developer | .629 | .600 | .548 | .343 | .200 |
| operations_builder | .468 | .452 | .435 | .338 | .242 |
| precision_maker | .560 | .529 | .500 | .343 | .242 |
| adaptive_learner | .550 | .475 | .448 | .297 | .232 |
| quantitative_planner | .482 | .449 | .436 | .344 | .255 |
| verbal_teacher | .502 | .467 | .448 | .372 | .278 |
| human_insight_reader | .518 | .487 | .460 | .362 | .293 |
| ambiguity_builder | .503 | .493 | .459 | .328 | .245 |
| calm_troubleshooter | .420 | .412 | .403 | .356 | .300 |
| operational_orchestrator | .523 | .507 | .484 | .380 | .265 |
| influential_storyteller | .483 | .455 | .435 | .341 | .260 |
| spatial_builder | .464 | .428 | .412 | .334 | .262 |
| people_coach | .645 | .599 | .558 | .363 | .247 |
| conflict_coordinator | .470 | .426 | .412 | .334 | .250 |
| rapid_pattern_learner | .549 | .535 | .488 | .351 | .250 |
| creative_maker | .450 | .432 | .406 | .304 | .262 |
| evidence_guardian | .429 | .425 | .414 | .361 | .288 |
| strategic_catalyst | .493 | .480 | .451 | .348 | .242 |

## Rank separation

Mean Top 1 minus Top 5 average: **0.0325**. Mean Top 5 average minus median: **0.1395**. Mean Top 10 average minus Bottom 10 average: **0.2055**.

The distribution has no 60–80 compression, no >85 inflation, and no excessive polarization. Most careers sit in a plausible low-to-moderate comparison band, while top groups separate clearly from the median and bottom. The first few results are often close, so the UI must present them as several similarly fitting directions, not imply that rank one is uniquely correct. No display remapping was applied.
