import { BASE_TALENTS } from '../../src/data/talents';
import {
  ENVIRONMENT_DIMENSIONS,
  INTEREST_DIMENSIONS,
  VALUE_DIMENSIONS,
  WORK_STYLE_DIMENSIONS,
  type CareerFamily,
  type CareerMatchInput,
  type DimensionVector,
  type EnvironmentDimension,
  type TalentId,
  type TalentScore,
  type WorkStyleDimension,
} from '../../src/types';
import type { QuestionResponse } from '../../src/types';
import { makeResponses } from './synthetic-profiles';

const vector = <T extends string>(
  dimensions: readonly T[],
  values: Partial<Record<T, number>>,
  baseline: number,
): DimensionVector<T> => Object.fromEntries(dimensions.map((id) => [id, values[id] ?? baseline])) as DimensionVector<T>;

const talentScores = (highTalents: readonly TalentId[]): TalentScore[] => {
  const high = new Set(highTalents);
  return BASE_TALENTS.map(({ id }) => ({
    talentId: id,
    score: high.has(id) ? 0.92 : 0.28,
    energyScore: high.has(id) ? 0.65 : null,
    interestScore: high.has(id) ? 0.7 : 0.2,
    status: high.has(id) ? 'natural_strength' : 'insufficient_evidence',
    confidence: {
      level: high.has(id) ? 'high' : 'medium',
      evidenceCount: 4,
      questionCoverage: 1,
      crossMethodConsistency: high.has(id) ? 0.9 : 0.65,
      evidenceQuality: 0.8,
      reasons: [],
    },
    evidence: high.has(id)
      ? [{ id: `evidence_${id}`, source: 'behavior_example', talentId: id, description: 'Golden persona evidence', strength: 0.9 }]
      : [],
  }));
};

interface PersonaSeed {
  id: string;
  talents: TalentId[];
  interests: Partial<Record<LegacyInterestDimension, number>>;
  workStyle?: Partial<Record<WorkStyleDimension, number>>;
  environment?: Partial<Record<EnvironmentDimension, number>>;
  values?: Partial<Record<LegacyValueDimension, number>>;
  consideredFamilies: CareerFamily[];
  expectedTopCareers: string[];
}

type LegacyInterestDimension =
  | 'data' | 'systems' | 'people' | 'ideas' | 'making' | 'service' | 'persuasion' | 'creative_expression';
type LegacyValueDimension = 'mastery' | 'impact' | 'stability' | 'autonomy' | 'creativity' | 'service';

const riasec = (values: Partial<Record<LegacyInterestDimension, number>>) => {
  const get = (id: LegacyInterestDimension) => values[id] ?? 0.28;
  return vector(INTEREST_DIMENSIONS, {
    realistic: Math.max(get('making'), get('systems') * 0.55),
    investigative: Math.max(get('data'), get('systems'), get('ideas') * 0.7),
    artistic: Math.max(get('creative_expression'), get('ideas') * 0.7),
    social: Math.max(get('people'), get('service')),
    enterprising: Math.max(get('persuasion'), get('people') * 0.55),
    conventional: Math.max(get('data') * 0.65, get('systems') * 0.72),
  }, 0.28);
};

const valuesVector = (values: Partial<Record<LegacyValueDimension, number>>) => {
  const get = (id: LegacyValueDimension) => values[id] ?? 0.45;
  return vector(VALUE_DIMENSIONS, {
    stability: get('stability'), impact: get('impact'), autonomy: get('autonomy'),
    learning: get('mastery'), creativity: get('creativity'), helpingOthers: get('service'),
  }, 0.45);
};

export interface GoldenPersona {
  id: string;
  input: CareerMatchInput;
  expectedTopCareers: string[];
  responses: QuestionResponse[];
}

const seeds: PersonaSeed[] = [
  { id:'empathy_communicator', talents:['emotional_perception','communication','conflict_navigation','coordination'], interests:{ people:.98, service:.9 }, workStyle:{ facilitative:.9, collaborative:.85 }, environment:{ socialDensity:.82, emotionalLabor:.85 }, values:{ service:.95, impact:.85 }, consideredFamilies:['customer_success'], expectedTopCareers:['customer_success_manager','guest_experience_manager','ux_researcher','talent_acquisition_specialist'] },
  { id:'analytical_precision', talents:['analytical_reasoning','precision','pattern_recognition','persistence'], interests:{ data:.95, systems:.9 }, workStyle:{ detail_focused:.95, independent:.78 }, environment:{ socialDensity:.25, structure:.85, repetition:.7, risk:.8 }, values:{ mastery:.9, stability:.8 }, consideredFamilies:['technology'], expectedTopCareers:['cybersecurity_analyst','risk_compliance_analyst','management_accountant','clinical_research_coordinator'] },
  { id:'creative_spatial', talents:['creative_ideation','spatial_mechanical','precision','pattern_recognition'], interests:{ creative_expression:1, making:.95, ideas:.8 }, workStyle:{ hands_on:.9, independent:.7 }, environment:{ socialDensity:.35, ambiguity:.72 }, values:{ creativity:1, mastery:.78 }, consideredFamilies:['design'], expectedTopCareers:['exhibition_designer','video_editor','ux_designer','game_narrative_designer'] },
  { id:'teacher', talents:['teaching_coaching','communication','emotional_perception','structuring_ambiguity'], interests:{ people:.95, service:.95, ideas:.7 }, workStyle:{ facilitative:.98, collaborative:.72 }, environment:{ socialDensity:.72, emotionalLabor:.72 }, values:{ service:1, impact:.9 }, consideredFamilies:['education'], expectedTopCareers:['instructional_designer','career_coach','learning_development_specialist','customer_education_specialist'] },
  { id:'leadership', talents:['initiative','influence','coordination','prioritization','communication'], interests:{ people:.8, persuasion:.8, systems:.72 }, workStyle:{ strategic:.9, collaborative:.85, facilitative:.72 }, environment:{ socialDensity:.82, pace:.8, ambiguity:.75, risk:.65 }, values:{ impact:.95, autonomy:.78 }, consideredFamilies:['product'], expectedTopCareers:['product_manager','project_manager','management_consultant','account_executive'] },
  { id:'mechanical', talents:['spatial_mechanical','precision','analytical_reasoning','persistence'], interests:{ making:1, systems:.98 }, workStyle:{ hands_on:1, detail_focused:.95, independent:.72 }, environment:{ socialDensity:.18, mobility:.75, risk:.9, repetition:.72, structure:.9 }, values:{ mastery:.95, stability:.82 }, consideredFamilies:['engineering'], expectedTopCareers:['mechanical_engineer','electrician','cnc_technician','aviation_maintenance_technician'] },
  { id:'planner', talents:['planning','coordination','prioritization','precision','persistence'], interests:{ systems:.92, data:.65, service:.55 }, workStyle:{ detail_focused:.9, collaborative:.72, strategic:.7 }, environment:{ pace:.72, structure:.82, repetition:.58 }, values:{ stability:.78, impact:.72 }, consideredFamilies:['operations'], expectedTopCareers:['project_manager','supply_chain_planner','product_operations','event_operations_coordinator','research_operations_specialist','clinical_research_coordinator','tour_operations_specialist','people_operations_specialist'] },
  { id:'persuader', talents:['influence','communication','initiative','verbal_reasoning','adaptability'], interests:{ persuasion:1, people:.9, creative_expression:.62 }, workStyle:{ collaborative:.75, strategic:.72, independent:.65 }, environment:{ socialDensity:.95, pace:.85, ambiguity:.68, risk:.72 }, values:{ impact:.82, autonomy:.75 }, consideredFamilies:['sales'], expectedTopCareers:['account_executive','solutions_consultant','growth_marketer','brand_strategist'] },
  { id:'quantitative', talents:['quantitative_reasoning','analytical_reasoning','pattern_recognition','precision'], interests:{ data:1, systems:.88 }, workStyle:{ detail_focused:.95, independent:.75, strategic:.7 }, environment:{ socialDensity:.25, structure:.78, repetition:.62 }, values:{ mastery:.9, stability:.78 }, consideredFamilies:['finance'], expectedTopCareers:['financial_analyst','data_analyst','product_analyst','sales_operations_analyst'] },
  { id:'ambiguity_structurer', talents:['structuring_ambiguity','analytical_reasoning','learning_agility','prioritization','creative_ideation'], interests:{ systems:.9, ideas:.9, data:.62 }, workStyle:{ strategic:.95, collaborative:.62 }, environment:{ ambiguity:.92, pace:.72, structure:.35, repetition:.18 }, values:{ impact:.9, mastery:.82, autonomy:.65 }, consideredFamilies:['consulting'], expectedTopCareers:['management_consultant','product_manager','business_operations_analyst','service_designer'] },
  { id:'verbal', talents:['verbal_reasoning','communication','creative_ideation','pattern_recognition'], interests:{ creative_expression:1, ideas:.92, people:.62 }, workStyle:{ independent:.78, strategic:.65 }, environment:{ socialDensity:.42, ambiguity:.75, repetition:.3 }, values:{ creativity:.95, impact:.78, autonomy:.68 }, consideredFamilies:['media'], expectedTopCareers:['journalist','copywriter','content_strategist','brand_strategist'] },
  { id:'adaptable', talents:['adaptability','initiative','learning_agility','prioritization','coordination'], interests:{ people:.72, service:.78, systems:.62 }, workStyle:{ hands_on:.88, collaborative:.8 }, environment:{ pace:.95, ambiguity:.88, mobility:.78, risk:.7, structure:.45 }, values:{ impact:.82, service:.78, autonomy:.62 }, consideredFamilies:['hospitality'], expectedTopCareers:['emergency_management_specialist','event_operations_coordinator','hotel_operations_manager','growth_marketer'] },
];

export const GOLDEN_PERSONAS: GoldenPersona[] = seeds.map((seed, index) => ({
  id: seed.id,
  expectedTopCareers: seed.expectedTopCareers,
  responses: makeResponses(seed.talents, index + 100),
  input: {
    talentScores: talentScores(seed.talents),
    interestProfile: riasec(seed.interests),
    workStyle: vector(WORK_STYLE_DIMENSIONS, seed.workStyle ?? {}, 0.45),
    environmentTolerance: vector(ENVIRONMENT_DIMENSIONS, seed.environment ?? {}, 0.65),
    valuesProfile: valuesVector(seed.values ?? {}),
    transferableSkills: {},
    education: 'bachelor',
    yearsExperience: 1,
    certifications: [],
    hasPortfolio: true,
    languages: ['English'],
    professionalLicenses: [],
    consideredCareerIds: [],
    consideredFamilies: seed.consideredFamilies,
  },
}));
