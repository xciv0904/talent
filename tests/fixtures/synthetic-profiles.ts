import { QUICK_DISCOVERY_QUESTIONS } from '../../src/data/questions';
import type { QuestionOption, QuestionResponse, TalentId } from '../../src/types';

export interface SyntheticProfile {
  id: string;
  targetTalents: TalentId[];
  responses: QuestionResponse[];
}

const optionTalentIds = (option: QuestionOption, channel: 'talentSignals' | 'energySignals' | 'talentInterestSignals') =>
  Object.keys(option[channel] ?? {}) as TalentId[];

export function makeResponses(targetTalents: readonly TalentId[], seed: number): QuestionResponse[] {
  const targetSet = new Set(targetTalents);

  return QUICK_DISCOVERY_QUESTIONS.map((question, questionIndex) => {
    let option = question.options[(questionIndex + seed) % question.options.length];

    if (['situational_choice', 'forced_choice', 'behavior', 'evidence'].includes(question.type)) {
      option =
        question.options.find((candidate) =>
          optionTalentIds(candidate, 'talentSignals').some((talentId) => targetSet.has(talentId)),
        ) ?? option;
    } else if (question.type === 'interest') {
      option =
        question.options.find((candidate) =>
          optionTalentIds(candidate, 'talentInterestSignals').some((talentId) => targetSet.has(talentId)),
        ) ?? option;
    } else if (question.type === 'energy' && question.id < 'ENG06') {
      option =
        question.options.find((candidate) =>
          optionTalentIds(candidate, 'energySignals').some((talentId) => targetSet.has(talentId)),
        ) ?? option;
    }

    if (question.type === 'energy' && question.id >= 'ENG06') {
      option =
        question.options.find((candidate) =>
          optionTalentIds(candidate, 'energySignals').every((talentId) => !targetSet.has(talentId)),
        ) ?? option;
    }

    return {
      questionId: question.id,
      selectedOptionIds: [option.id],
      scaleValue:
        question.type === 'behavior' || question.type === 'evidence'
          ? optionTalentIds(option, 'talentSignals').some((talentId) => targetSet.has(talentId))
            ? 5
            : 1
          : undefined,
      answeredAt: '2026-08-09T00:00:00.000Z',
    };
  });
}

const definitions: Array<Omit<SyntheticProfile, 'responses'>> = [
  {
    id: 'systems_analyst',
    targetTalents: ['analytical_reasoning', 'pattern_recognition', 'quantitative_reasoning', 'structuring_ambiguity'],
  },
  {
    id: 'story_catalyst',
    targetTalents: ['verbal_reasoning', 'creative_ideation', 'communication', 'influence'],
  },
  {
    id: 'people_developer',
    targetTalents: ['emotional_perception', 'teaching_coaching', 'conflict_navigation', 'communication'],
  },
  {
    id: 'operations_builder',
    targetTalents: ['initiative', 'planning', 'prioritization', 'coordination', 'persistence'],
  },
  {
    id: 'precision_maker',
    targetTalents: ['spatial_mechanical', 'precision', 'persistence', 'analytical_reasoning'],
  },
  {
    id: 'adaptive_learner',
    targetTalents: ['learning_agility', 'adaptability', 'creative_ideation', 'initiative'],
  },
  { id: 'quantitative_planner', targetTalents: ['quantitative_reasoning', 'planning', 'precision', 'prioritization'] },
  { id: 'verbal_teacher', targetTalents: ['verbal_reasoning', 'communication', 'teaching_coaching', 'learning_agility'] },
  { id: 'human_insight_reader', targetTalents: ['emotional_perception', 'pattern_recognition', 'communication', 'conflict_navigation'] },
  { id: 'ambiguity_builder', targetTalents: ['structuring_ambiguity', 'creative_ideation', 'initiative', 'adaptability'] },
  { id: 'calm_troubleshooter', targetTalents: ['analytical_reasoning', 'precision', 'adaptability', 'persistence'] },
  { id: 'operational_orchestrator', targetTalents: ['coordination', 'planning', 'prioritization', 'communication'] },
  { id: 'influential_storyteller', targetTalents: ['influence', 'verbal_reasoning', 'communication', 'creative_ideation'] },
  { id: 'spatial_builder', targetTalents: ['spatial_mechanical', 'initiative', 'precision', 'planning'] },
  { id: 'people_coach', targetTalents: ['teaching_coaching', 'emotional_perception', 'communication', 'persistence'] },
  { id: 'conflict_coordinator', targetTalents: ['conflict_navigation', 'coordination', 'emotional_perception', 'prioritization'] },
  { id: 'rapid_pattern_learner', targetTalents: ['learning_agility', 'pattern_recognition', 'analytical_reasoning', 'adaptability'] },
  { id: 'creative_maker', targetTalents: ['creative_ideation', 'spatial_mechanical', 'initiative', 'precision'] },
  { id: 'evidence_guardian', targetTalents: ['precision', 'quantitative_reasoning', 'analytical_reasoning', 'persistence'] },
  { id: 'strategic_catalyst', targetTalents: ['initiative', 'influence', 'prioritization', 'structuring_ambiguity'] },
  { id: 'service_translator', targetTalents: ['communication', 'verbal_reasoning', 'emotional_perception', 'teaching_coaching'] },
  { id: 'resilient_executor', targetTalents: ['persistence', 'adaptability', 'planning', 'initiative'] },
  { id: 'systems_coordinator', targetTalents: ['coordination', 'structuring_ambiguity', 'pattern_recognition', 'planning'] },
  { id: 'analytical_communicator', targetTalents: ['analytical_reasoning', 'communication', 'verbal_reasoning', 'pattern_recognition'] },
  { id: 'service_operator', targetTalents: ['emotional_perception', 'coordination', 'adaptability', 'persistence'] },
  { id: 'technical_diagnostician', targetTalents: ['spatial_mechanical', 'analytical_reasoning', 'precision', 'learning_agility'] },
  { id: 'research_synthesizer', targetTalents: ['pattern_recognition', 'verbal_reasoning', 'structuring_ambiguity', 'precision'] },
  { id: 'community_facilitator', targetTalents: ['communication', 'conflict_navigation', 'coordination', 'initiative'] },
  { id: 'creative_planner', targetTalents: ['creative_ideation', 'planning', 'prioritization', 'verbal_reasoning'] },
  { id: 'practical_teacher', targetTalents: ['teaching_coaching', 'spatial_mechanical', 'communication', 'persistence'] },
  { id: 'adaptive_influencer', targetTalents: ['adaptability', 'influence', 'initiative', 'emotional_perception'] },
  { id: 'quality_coordinator', targetTalents: ['precision', 'coordination', 'planning', 'conflict_navigation'] },
  { id: 'data_storyteller', targetTalents: ['quantitative_reasoning', 'pattern_recognition', 'verbal_reasoning', 'influence'] },
  { id: 'ambiguity_coach', targetTalents: ['structuring_ambiguity', 'teaching_coaching', 'emotional_perception', 'learning_agility'] },
  { id: 'resilient_maker', targetTalents: ['spatial_mechanical', 'initiative', 'adaptability', 'persistence'] },
  { id: 'careful_explorer', targetTalents: ['learning_agility', 'analytical_reasoning', 'creative_ideation', 'precision'] },
];

export const SYNTHETIC_PROFILES: SyntheticProfile[] = definitions.map((definition, index) => ({
  ...definition,
  responses: makeResponses(definition.targetTalents, index),
}));
