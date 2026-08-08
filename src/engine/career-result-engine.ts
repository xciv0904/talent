import type { CareerMatchInput, CareerMatchResult, CategorizedCareerResults } from '../types';

const byScore = (a: CareerMatchResult, b: CareerMatchResult) => b.matchScore - a.matchScore;

export function categorizeCareerResults(
  matches: readonly CareerMatchResult[],
  user: CareerMatchInput,
  limit = 4,
  surpriseThreshold = 0.6,
): CategorizedCareerResults {
  const used = new Set<string>();
  const sorted = [...matches].sort(byScore);
  const take = (candidates: CareerMatchResult[]) => {
    const selected = candidates.filter((item) => !used.has(item.careerId)).slice(0, limit);
    selected.forEach((item) => used.add(item.careerId));
    return selected;
  };

  const bestFit = take(sorted.filter((item) => item.matchScore >= 0.62));
  const highPotential = take(
    sorted.filter(
      (item) =>
        item.matchScore >= 0.58 &&
        (item.entryDistance.level === 'high' || item.entryDistance.level === 'very_high'),
    ),
  );
  const bestFamilies = new Set(bestFit.map((item) => item.family));
  const surpriseCandidates = sorted.filter(
    (item) =>
      item.matchScore >= surpriseThreshold &&
      item.entryDistance.level !== 'very_high' &&
      !used.has(item.careerId) &&
      !user.consideredCareerIds.includes(item.careerId) &&
      !user.consideredFamilies.includes(item.family),
  ).filter(
    (item) => (user.careerFamiliarity?.[item.careerId] ?? 0) < 0.5,
  );
  const diverse: CareerMatchResult[] = [];
  const surpriseFamilies = new Set<string>();
  for (const item of [
    ...surpriseCandidates.filter((candidate) => !bestFamilies.has(candidate.family)),
    ...surpriseCandidates.filter((candidate) => bestFamilies.has(candidate.family)),
  ]) {
    if (surpriseFamilies.has(item.family)) continue;
    diverse.push(item);
    surpriseFamilies.add(item.family);
    if (diverse.length === limit) break;
  }
  const surpriseMe = take(diverse);

  const easierTransition = take(
    sorted
      .filter(
        (item) =>
          item.matchScore >= 0.52 &&
          (item.entryDistance.level === 'low' || item.entryDistance.level === 'medium'),
      )
      .sort((a, b) => {
        const rank = { low: 0, medium: 1, high: 2, very_high: 3 };
        return rank[a.entryDistance.level] - rank[b.entryDistance.level] || byScore(a, b);
      }),
  );

  return {
    best_fit: bestFit,
    easier_transition: easierTransition,
    high_potential: highPotential,
    surprise_me: surpriseMe,
  };
}
