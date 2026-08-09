import type { CareerProfile } from '../../types';
import { ANALYTICAL_SYSTEMS_CAREERS } from './analytical-systems';
import { DIGITAL_COMMERCIAL_CAREERS } from './digital-commercial';
import { PEOPLE_SERVICE_CAREERS } from './people-service';
import { PUBLIC_CREATIVE_TECHNICAL_CAREERS } from './public-creative-technical';

export const CAREER_PROFILES = [
  ...DIGITAL_COMMERCIAL_CAREERS,
  ...PEOPLE_SERVICE_CAREERS,
  ...ANALYTICAL_SYSTEMS_CAREERS,
  ...PUBLIC_CREATIVE_TECHNICAL_CAREERS,
] as const satisfies readonly CareerProfile[];

export { ANALYTICAL_SYSTEMS_CAREERS } from './analytical-systems';
export { DIGITAL_COMMERCIAL_CAREERS } from './digital-commercial';
export { PEOPLE_SERVICE_CAREERS } from './people-service';
export { PUBLIC_CREATIVE_TECHNICAL_CAREERS } from './public-creative-technical';
export { PUBLIC_CAREER_GROUPS } from './public-career-groups';
