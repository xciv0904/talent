import {
  ENVIRONMENT_DIMENSIONS,
  INTEREST_DIMENSIONS,
  VALUE_DIMENSIONS,
  WORK_STYLE_DIMENSIONS,
  type AssessmentProfileVectors,
  type AssessmentResult,
  type DimensionVector,
} from '../types';
import { clamp } from './talent-engine';

const EXPECTED_PROFILE_QUESTION_COUNTS = { interest: 5, work_style: 1, environment: 4, value: 5 } as const;

function scoreVector<TDimension extends string>(
  dimensions: readonly TDimension[],
  channel: 'interest' | 'work_style' | 'environment' | 'value',
  assessment: AssessmentResult,
  relative: boolean,
): DimensionVector<TDimension> {
  const values = Object.fromEntries(dimensions.map((dimension) => {
    const opportunities = assessment.profileOpportunities.filter(
      (item) => item.channel === channel && item.key === dimension,
    );
    const maximum = opportunities.reduce((sum, item) => sum + item.maximumSignal, 0);
    const support = assessment.observations
      .filter((item) => item.channel === channel && item.key === dimension)
      .reduce((sum, item) => sum + item.value, 0);
    return [dimension, maximum > 0 ? clamp(support / maximum) : 0];
  })) as DimensionVector<TDimension>;

  if (!relative) return values;
  const maximumValue = Math.max(...Object.values(values) as number[]);
  if (maximumValue <= 0) return values;
  return Object.fromEntries(dimensions.map((dimension) => [dimension, values[dimension] / maximumValue])) as DimensionVector<TDimension>;
}

const channelCoverage = (
  assessment: AssessmentResult,
  channel: keyof typeof EXPECTED_PROFILE_QUESTION_COUNTS,
) => {
  const questions = new Set(
    assessment.profileOpportunities.filter((item) => item.channel === channel).map((item) => item.questionId),
  );
  return clamp(questions.size / EXPECTED_PROFILE_QUESTION_COUNTS[channel]);
};

export function buildAssessmentProfiles(assessment: AssessmentResult): AssessmentProfileVectors {
  return {
    interestProfile: scoreVector(INTEREST_DIMENSIONS, 'interest', assessment, true),
    workStyle: scoreVector(WORK_STYLE_DIMENSIONS, 'work_style', assessment, true),
    environmentTolerance: scoreVector(ENVIRONMENT_DIMENSIONS, 'environment', assessment, false),
    valuesProfile: scoreVector(VALUE_DIMENSIONS, 'value', assessment, true),
    coverage: {
      interest: channelCoverage(assessment, 'interest'),
      workStyle: channelCoverage(assessment, 'work_style'),
      environment: channelCoverage(assessment, 'environment'),
      values: channelCoverage(assessment, 'value'),
    },
  };
}
