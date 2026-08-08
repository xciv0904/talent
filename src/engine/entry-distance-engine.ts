import type { CareerMatchInput, CareerProfile, EducationLevel, EntryDistance } from '../types';
import { clamp } from './talent-engine';

const EDUCATION_RANK: Record<EducationLevel, number> = {
  none: 0,
  secondary: 1,
  certificate: 2,
  associate: 3,
  bachelor: 4,
  master: 5,
  doctorate: 6,
};

const missingRatio = (required: readonly string[], available: readonly string[]) => {
  if (required.length === 0) return 0;
  const normalized = new Set(available.map((item) => item.toLowerCase()));
  return required.filter((item) => !normalized.has(item.toLowerCase())).length / required.length;
};

export function calculateEntryDistance(career: CareerProfile, user: CareerMatchInput): EntryDistance {
  const requirements = career.entryRequirements;
  const educationGap = clamp(
    (EDUCATION_RANK[requirements.education] - EDUCATION_RANK[user.education]) / 6,
  );
  const experienceGap =
    requirements.yearsExperience === 0
      ? 0
      : clamp((requirements.yearsExperience - user.yearsExperience) / requirements.yearsExperience);
  const skillWeight = career.skills.reduce((sum, skill) => sum + skill.importance, 0);
  const skillGap =
    skillWeight === 0
      ? 0
      : career.skills.reduce(
          (sum, skill) => sum + (1 - clamp(user.transferableSkills[skill.id] ?? 0)) * skill.importance,
          0,
        ) / skillWeight;
  const certificationGap = missingRatio(requirements.certifications, user.certifications);
  const portfolioGap = requirements.portfolio && !user.hasPortfolio ? 1 : 0;
  const languageGap = missingRatio(requirements.languages, user.languages);
  const professionalLicenseGap = missingRatio(
    requirements.professionalLicenses,
    user.professionalLicenses,
  );

  const distance =
    educationGap * 0.18 +
    skillGap * 0.22 +
    experienceGap * 0.15 +
    certificationGap * 0.08 +
    portfolioGap * 0.06 +
    languageGap * 0.06 +
    professionalLicenseGap * 0.25;
  const level: EntryDistance['level'] =
    distance <= 0.18 ? 'low' : distance <= 0.38 ? 'medium' : distance <= 0.55 ? 'high' : 'very_high';
  const reasons: string[] = [];
  if (educationGap > 0) reasons.push('需要補足教育程度或等效訓練。');
  if (skillGap > 0.35) reasons.push('尚有數項核心技能需要建立。');
  if (experienceGap > 0) reasons.push('需要累積相關實務經驗。');
  if (certificationGap > 0) reasons.push('需要指定認證。');
  if (portfolioGap > 0) reasons.push('需要建立可檢視的作品集。');
  if (languageGap > 0) reasons.push('需要補足工作語言能力。');
  if (professionalLicenseGap > 0) reasons.push('需要取得專業執照。');

  return {
    level,
    educationGap,
    skillGap,
    experienceGap,
    certificationGap,
    portfolioGap,
    languageGap,
    professionalLicenseGap,
    reasons,
  };
}
