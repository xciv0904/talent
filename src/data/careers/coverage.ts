import { CAREER_PROFILES } from './index';

export const CAREER_REFERENCE_SOURCES = [
  { title: '104 職務與工作分類', url: 'https://guide.104.com.tw/salary/topic?cat=jobother&subject=jobsratio&type=worker' },
  { title: '1111 職務大辭典', url: 'https://careermaster.1111.com.tw/list/' },
  { title: '518 熊班職務分類', url: 'https://www.518.com.tw/job-category.html?cat=1' },
  { title: '台灣就業通 Jobooks 職業百科', url: 'https://jobooks.taiwanjobs.gov.tw/News5.aspx?n=199&sms=8450' },
] as const;

// Crosswalk to Jobooks' 22 broad categories. These are browsing groups, not scoring dimensions.
export const CAREER_SCOPES = [
  ['administration', '經營・行政・總務'], ['sales', '業務・貿易・銷售'],
  ['people_law', '人資・法律・諮詢'], ['finance', '財會・金融・保險'],
  ['design', '廣告・視覺・設計'], ['customer', '客服・門市'],
  ['engineering', '工程・研發・硬體'], ['technology', '資訊・軟體・系統'],
  ['production', '製造・品管・環境'], ['technical', '技術・維修・操作'],
  ['construction', '營建・空間・施工'], ['publishing', '新聞・出版・翻譯'],
  ['creative', '影像・娛樂・創作'], ['education', '教育・學術・研究'],
  ['transport', '物流・運輸・倉儲'], ['hospitality', '旅遊・餐飲・旅宿'],
  ['health', '醫療・健康・美容'], ['safety', '軍警消・保全'],
  ['care', '清潔・家事・托育'], ['agriculture', '農林漁牧'],
  ['planning', '行銷・企劃・專案'], ['other', '運動・社會支持與其他服務'],
] as const;
export type CareerScopeId = typeof CAREER_SCOPES[number][0];
const overrides: Record<string, CareerScopeId> = {
  school_teacher: 'education', preschool_teacher: 'education', military_service_member: 'safety', police_officer: 'safety', firefighter: 'safety', security_guard: 'safety',
  physician: 'health', registered_nurse: 'health', pharmacist: 'health', veterinarian: 'health', dentist: 'health', lawyer: 'people_law', social_worker: 'other',
  chef: 'hospitality', baker: 'hospitality', barista: 'hospitality', retail_associate: 'customer', warehouse_operator: 'transport', farmer: 'agriculture',
  auto_mechanic: 'technical', hair_stylist: 'health', fitness_coach: 'other', civil_engineer: 'construction', construction_worker: 'construction', interior_designer: 'construction',
  delivery_driver: 'transport', bus_driver: 'transport', flight_attendant: 'transport', caregiver: 'care', childcare_worker: 'care', cleaner: 'care',
  aquaculture_worker: 'agriculture', livestock_farmer: 'agriculture', forestry_worker: 'agriculture', laboratory_technician: 'engineering', electronics_engineer: 'engineering',
  translator: 'publishing', insurance_agent: 'finance', administrative_assistant: 'administration', graphic_designer: 'design',
  industrial_engineer: 'production', environmental_engineer: 'production', supply_chain_planner: 'transport', journalist: 'publishing',
  public_program_manager: 'administration', urban_planner: 'construction', emergency_management_specialist: 'safety',
};
const familyScope: Record<string, CareerScopeId> = {
  technology: 'technology', product: 'planning', design: 'design', marketing: 'planning', sales: 'sales', human_resources: 'people_law',
  customer_success: 'customer', hospitality: 'hospitality', travel: 'hospitality', education: 'education', research: 'education', healthcare: 'health',
  finance: 'finance', operations: 'administration', consulting: 'people_law', media: 'creative', public_service: 'administration', engineering: 'engineering', creative: 'creative', skilled_technical: 'technical',
};
export function careerScope(id: string): CareerScopeId {
  return overrides[id] ?? familyScope[CAREER_PROFILES.find((c) => c.id === id)?.family ?? ''] ?? 'other';
}
export function careerMatchesSearch(id: string, query: string): boolean {
  const career = CAREER_PROFILES.find((c) => c.id === id);
  if (!career) return false;
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const text = [career.titleZh, career.titleEn, ...career.aliases, career.description, ...career.coreTasks].join(' ').toLocaleLowerCase();
  return terms.every((term) => text.includes(term));
}
