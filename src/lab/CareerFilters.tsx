import { LAB_CAREERS } from './content';
import { careerMatchesSearch } from '../data/careers/coverage';
const browseOrder = ['school_teacher', 'physician', 'electrician', 'chef', 'police_officer', 'lawyer', 'farmer', 'hair_stylist', 'warehouse_operator', 'data_analyst', 'hotel_operations_manager', 'military_service_member', 'preschool_teacher', 'registered_nurse', 'cnc_technician', 'barista', 'firefighter', 'social_worker', 'fitness_coach', 'retail_associate', 'brand_strategist', 'auto_mechanic', 'baker', 'pharmacist', 'veterinarian', 'tour_operations_specialist', 'industrial_engineer', 'event_operations_coordinator', 'ux_researcher', 'learning_development_specialist', 'product_manager', 'guest_experience_manager'];
// Stable, varied first rows; a long list should not begin with only office and management roles.
const orderRank = new Map(browseOrder.map((id, index) => [id, index]));
export const LAB_BROWSE_CAREERS = [...LAB_CAREERS].sort((a, b) => (orderRank.get(a.careerId) ?? browseOrder.length) - (orderRank.get(b.careerId) ?? browseOrder.length));
export const LAB_SECTORS = ['全部工作場域', ...new Set(LAB_CAREERS.map((c) => c.sector ?? '知識與商業服務'))];
export function matchesLabCareer(careerId: string, sector: string, query: string) {
  const c = LAB_CAREERS.find((c) => c.careerId === careerId);
  return Boolean(c && (sector === '全部工作場域' || (c.sector ?? '知識與商業服務') === sector) && careerMatchesSearch(careerId, query));
}
export function CareerFilters({ sector, query, onSector, onQuery, count }: { sector: string; query: string; onSector: (s: string) => void; onQuery: (s: string) => void; count: number }) {
  return <><div className="lab-grid two lab-career-filters"><label className="lab-sector-filter">搜尋職業<input type="search" value={query} onChange={(e) => onQuery(e.target.value)} placeholder="例如：老師、醫生、警察、廚師" /></label><label className="lab-sector-filter">工作場域<select value={sector} onChange={(e) => onSector(e.target.value)}>{LAB_SECTORS.map((s) => <option key={s}>{s}</option>)}</select></label></div><p role="status" className="lab-note">找到 {count} 種可體驗職業</p>{!count && <p>目前沒有符合的試做任務。<button type="button" className="lab-text-button" onClick={() => { onQuery(''); onSector('全部工作場域'); }}>清除條件</button></p>}</>;
}
