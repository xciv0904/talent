import {
  ENVIRONMENT_DIMENSIONS,
  INTEREST_DIMENSIONS,
  CAREER_MATCH_VALUE_DIMENSIONS,
  WORK_STYLE_DIMENSIONS,
  type CareerEntryRequirements,
  type CareerFamily,
  type CareerProfile,
  type DimensionVector,
  type EntryDistanceLevel,
  type EnvironmentDimension,
  type TalentId,
  type WorkStyleDimension,
} from '../../types';

interface CareerSeed {
  id: string;
  zh: string;
  en: string;
  aliases: string[];
  family: CareerFamily;
  description: string;
  tasks: string[];
  talents: Partial<Record<TalentId, number>>;
  themes: Partial<Record<CareerThemeId, number>>;
  workStyle: Partial<Record<WorkStyleDimension, number>>;
  environment: Partial<Record<EnvironmentDimension, number>>;
  values: Partial<Record<LegacyValueDimension, number>>;
  skills: string[];
  entry: Partial<CareerEntryRequirements> & Pick<CareerEntryRequirements, 'education'>;
  barrier: EntryDistanceLevel;
  related: string[];
  experiment: string;
}

type CareerThemeId =
  | 'data' | 'systems' | 'people' | 'ideas' | 'making' | 'service' | 'persuasion' | 'creative_expression';
type LegacyValueDimension = 'mastery' | 'impact' | 'stability' | 'autonomy' | 'creativity' | 'service';

const vector = <TDimension extends string>(
  dimensions: readonly TDimension[],
  values: Partial<Record<TDimension, number>>,
  baseline: number,
): DimensionVector<TDimension> =>
  Object.fromEntries(dimensions.map((dimension) => [dimension, values[dimension] ?? baseline])) as DimensionVector<TDimension>;

const skillId = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '_')
    .replace(/^_|_$/g, '');

export function createCareer(seed: CareerSeed): CareerProfile {
  const theme = (id: CareerThemeId) => seed.themes[id] ?? 0.15;
  const interestProfile = vector(INTEREST_DIMENSIONS, {
    realistic: Math.max(theme('making'), theme('systems') * 0.55),
    investigative: Math.max(theme('data'), theme('systems'), theme('ideas') * 0.7),
    artistic: Math.max(theme('creative_expression'), theme('ideas') * 0.7),
    social: Math.max(theme('people'), theme('service')),
    enterprising: Math.max(theme('persuasion'), theme('people') * 0.55),
    conventional: Math.max(theme('data') * 0.65, theme('systems') * 0.72),
  }, 0.15);
  const legacyValue = (id: LegacyValueDimension) => seed.values[id] ?? 0.25;
  return {
    id: seed.id,
    titleZh: seed.zh,
    titleEn: seed.en,
    aliases: seed.aliases,
    family: seed.family,
    description: seed.description,
    coreTasks: seed.tasks,
    talentRequirements: seed.talents,
    interestProfile,
    workStyle: vector(WORK_STYLE_DIMENSIONS, seed.workStyle, 0.2),
    environmentProfile: vector(ENVIRONMENT_DIMENSIONS, seed.environment, 0.2),
    valuesProfile: vector(CAREER_MATCH_VALUE_DIMENSIONS, {
      stability: legacyValue('stability'),
      impact: legacyValue('impact'),
      autonomy: legacyValue('autonomy'),
      learning: legacyValue('mastery'),
      creativity: legacyValue('creativity'),
      helpingOthers: legacyValue('service'),
    }, 0.25),
    skills: seed.skills.map((name, index) => ({
      id: skillId(name),
      name,
      importance: Math.max(0.65, 0.95 - index * 0.1),
    })),
    entryRequirements: {
      education: seed.entry.education,
      yearsExperience: seed.entry.yearsExperience ?? 0,
      certifications: seed.entry.certifications ?? [],
      portfolio: seed.entry.portfolio ?? false,
      languages: seed.entry.languages ?? [],
      professionalLicenses: seed.entry.professionalLicenses ?? [],
    },
    entryBarrier: seed.barrier,
    relatedCareers: seed.related,
    careerExperiment: {
      title: `${seed.zh}迷你實驗`,
      description: seed.experiment,
      estimatedHours: 4,
      evidenceToCollect: ['完成一份可檢視的輸出', '記錄投入前後的能量', '請一位相關人士提供回饋'],
    },
  };
}
