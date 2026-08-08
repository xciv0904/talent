import { BASE_TALENTS } from '../data/talents';
import {
  ENVIRONMENT_DIMENSIONS,
  INTEREST_DIMENSIONS,
  CAREER_MATCH_VALUE_DIMENSIONS,
  WORK_STYLE_DIMENSIONS,
  type CareerProfile,
} from '../types';

export interface CareerVectorAudit {
  similarPairs: Array<{ first: string; second: string; similarity: number }>;
  missingDimensions: Array<{ careerId: string; dimension: string }>;
  overElevatedCareers: string[];
  lowDiscriminationCareers: string[];
}

export interface CareerNeighborPair {
  first: string;
  second: string;
  sameFamily: boolean;
  talentSimilarity: number;
  interestSimilarity: number;
  workStyleSimilarity: number;
  environmentSimilarity: number;
  valuesSimilarity: number;
  overallSimilarity: number;
}

export function careerVector(career: CareerProfile): number[] {
  return [
    ...BASE_TALENTS.map(({ id }) => career.talentRequirements[id] ?? 0),
    ...INTEREST_DIMENSIONS.map((id) => career.interestProfile[id]),
    ...WORK_STYLE_DIMENSIONS.map((id) => career.workStyle[id]),
    ...ENVIRONMENT_DIMENSIONS.map((id) => career.environmentProfile[id]),
    ...CAREER_MATCH_VALUE_DIMENSIONS.map((id) => career.valuesProfile[id]),
  ];
}

export function cosineSimilarity(first: readonly number[], second: readonly number[]): number {
  const dot = first.reduce((sum, value, index) => sum + value * (second[index] ?? 0), 0);
  const firstLength = Math.sqrt(first.reduce((sum, value) => sum + value ** 2, 0));
  const secondLength = Math.sqrt(second.reduce((sum, value) => sum + value ** 2, 0));
  return firstLength === 0 || secondLength === 0 ? 0 : dot / (firstLength * secondLength);
}

export function nearestCareerPairs(careers: readonly CareerProfile[], limit = 20): CareerNeighborPair[] {
  const pairs: CareerNeighborPair[] = [];
  const components = (career: CareerProfile) => ({
    talent: BASE_TALENTS.map(({ id }) => career.talentRequirements[id] ?? 0),
    interest: INTEREST_DIMENSIONS.map((id) => career.interestProfile[id]),
    workStyle: WORK_STYLE_DIMENSIONS.map((id) => career.workStyle[id]),
    environment: ENVIRONMENT_DIMENSIONS.map((id) => career.environmentProfile[id]),
    values: CAREER_MATCH_VALUE_DIMENSIONS.map((id) => career.valuesProfile[id]),
  });
  for (let firstIndex = 0; firstIndex < careers.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < careers.length; secondIndex += 1) {
      const first = careers[firstIndex];
      const second = careers[secondIndex];
      const a = components(first);
      const b = components(second);
      pairs.push({
        first: first.id,
        second: second.id,
        sameFamily: first.family === second.family,
        talentSimilarity: cosineSimilarity(a.talent, b.talent),
        interestSimilarity: cosineSimilarity(a.interest, b.interest),
        workStyleSimilarity: cosineSimilarity(a.workStyle, b.workStyle),
        environmentSimilarity: cosineSimilarity(a.environment, b.environment),
        valuesSimilarity: cosineSimilarity(a.values, b.values),
        overallSimilarity: cosineSimilarity(careerVector(first), careerVector(second)),
      });
    }
  }
  return pairs.sort((a, b) => b.overallSimilarity - a.overallSimilarity).slice(0, limit);
}

export function auditCareerVectors(
  careers: readonly CareerProfile[],
  similarityThreshold = 0.96,
): CareerVectorAudit {
  const similarPairs: CareerVectorAudit['similarPairs'] = [];
  const missingDimensions: CareerVectorAudit['missingDimensions'] = [];
  const overElevatedCareers: string[] = [];
  const lowDiscriminationCareers: string[] = [];
  const dimensionGroups = [
    ['interestProfile', INTEREST_DIMENSIONS],
    ['workStyle', WORK_STYLE_DIMENSIONS],
    ['environmentProfile', ENVIRONMENT_DIMENSIONS],
    ['valuesProfile', CAREER_MATCH_VALUE_DIMENSIONS],
  ] as const;

  careers.forEach((career, index) => {
    const vector = careerVector(career);
    const mean = vector.reduce((sum, value) => sum + value, 0) / vector.length;
    const deviation = Math.sqrt(vector.reduce((sum, value) => sum + (value - mean) ** 2, 0) / vector.length);
    if (deviation < 0.14) lowDiscriminationCareers.push(career.id);
    if (Object.values(career.talentRequirements).filter((value) => value >= 0.75).length > 8) {
      overElevatedCareers.push(career.id);
    }
    for (const [group, dimensions] of dimensionGroups) {
      for (const dimension of dimensions) {
        if (!(dimension in career[group])) missingDimensions.push({ careerId: career.id, dimension });
      }
    }
    for (let secondIndex = index + 1; secondIndex < careers.length; secondIndex += 1) {
      const similarity = cosineSimilarity(vector, careerVector(careers[secondIndex]));
      if (similarity >= similarityThreshold) {
        similarPairs.push({ first: career.id, second: careers[secondIndex].id, similarity });
      }
    }
  });

  return { similarPairs, missingDimensions, overElevatedCareers, lowDiscriminationCareers };
}
