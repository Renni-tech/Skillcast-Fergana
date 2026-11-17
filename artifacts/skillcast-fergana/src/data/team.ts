import type { DeptTemplate, TeamMemberDef } from '@/lib/types';

// ─── Synthetic employer workforce (DEMO DATA — no real persons) ────────────
// Used by the employer dashboard to render a team-level skills-gap heatmap.
// In production this would come from anonymised, consented workforce profiles
// with a minimum aggregation cell size (k-anonymity) before display.

export const TEAM: TeamMemberDef[] = [
  {
    id: 'tm-aina', name: 'Alisher (synthetic)', title: 'Operations Executive', dept: 'Banking Ops',
    persona: 'working-adult', years: 18, interests: ['business', 'technology'],
    skills: {
      'ai-augmented-ops': 2, 'data-analysis': 2, communication: 4,
      'project-management': 3, 'critical-thinking': 3, 'customer-experience': 3,
    },
  },
  {
    id: 'tm-raj', name: 'Jamshid (synthetic)', title: 'Marketing Executive', dept: 'Marketing',
    persona: 'working-adult', years: 4, interests: ['creative', 'technology'],
    skills: {
      'digital-marketing': 3, 'ai-content-ops': 2, communication: 3,
      'data-analysis': 1, 'creative-framing': 3, adaptability: 3,
    },
  },
  {
    id: 'tm-meiling', name: 'Jasur (synthetic)', title: 'HR Executive', dept: 'People',
    persona: 'working-adult', years: 9, interests: ['people', 'education'],
    skills: {
      communication: 4, 'project-management': 2, 'teaching-training': 2,
      'business-analysis': 2, adaptability: 3, leadership: 2,
    },
  },
  {
    id: 'tm-farah', name: 'Javohir (synthetic)', title: 'Customer Service Lead', dept: 'Service',
    persona: 'working-adult', years: 6, interests: ['service', 'health'],
    skills: {
      'customer-experience': 4, communication: 4, 'ai-augmented-ops': 1,
      adaptability: 3, 'mental-health': 2, telehealth: 1,
    },
  },
  {
    id: 'tm-hafiz', name: 'Sherzod (synthetic)', title: 'IT Support Officer', dept: 'Technology',
    persona: 'working-adult', years: 3, interests: ['technology'],
    skills: {
      'software-engineering': 2, cybersecurity: 2, cloud: 2,
      communication: 2, iot: 1, 'prompt-engineering': 2,
    },
  },
  {
    id: 'tm-devi', name: 'Durdona (synthetic)', title: 'Finance Analyst', dept: 'Finance',
    persona: 'working-adult', years: 12, interests: ['business', 'sustainability'],
    skills: {
      'data-analysis': 4, 'business-analysis': 3, 'critical-thinking': 4,
      python: 1, communication: 3, 'climate-data': 1,
    },
  },
  {
    id: 'tm-weiming', name: 'Madina (synthetic)', title: 'Electrical Trainee (TVET)', dept: 'Facilities',
    persona: 'tvet-student', years: 1, interests: ['green', 'technology'],
    skills: {
      iot: 1, 'software-engineering': 1, 'renewable-energy': 1,
      adaptability: 4, 'ev-mobility': 1, 'energy-efficiency': 1,
    },
  },
  {
    id: 'tm-sarah', name: 'Oydin (synthetic)', title: 'Administration Supervisor', dept: 'Corporate Services',
    persona: 'working-adult', years: 20, interests: ['business'],
    skills: {
      'ai-augmented-ops': 1, communication: 3, 'project-management': 2,
      'customer-experience': 2, 'data-analysis': 1, 'prompt-engineering': 1,
    },
  },
];

// ─── Industries (employer onboarding step 1) ───────────────────────────────

export const INDUSTRIES: Array<{ id: 'technology' | 'manufacturing' | 'banking' | 'logistics' | 'public' | 'retail' | 'healthcare' | 'education'; labelKey: string }> = [
  { id: 'technology', labelKey: 'industry.technology' },
  { id: 'manufacturing', labelKey: 'industry.manufacturing' },
  { id: 'banking', labelKey: 'industry.banking' },
  { id: 'logistics', labelKey: 'industry.logistics' },
  { id: 'public', labelKey: 'industry.public' },
  { id: 'retail', labelKey: 'industry.retail' },
  { id: 'healthcare', labelKey: 'industry.healthcare' },
  { id: 'education', labelKey: 'industry.education' },
];

// ─── Pre-built department templates (employer onboarding step 2) ───────────
// All rosters are SYNTHETIC (competition rule: no real employee data).
// Large teams are truncated for display with an aggregation note (k≥5).

export const DEPT_TEMPLATES: DeptTemplate[] = [
  {
    id: 'marketing-10',
    labelKey: 'tpl.marketing',
    industry: undefined,
    totalStaff: 10,
    shownMembers: [
      { id: 'mk-raj', name: 'Jamshid (synthetic)', title: 'Marketing Executive', dept: 'Marketing', persona: 'working-adult', years: 4, interests: ['creative', 'technology'],
        skills: { 'digital-marketing': 3, 'ai-content-ops': 2, communication: 3, 'data-analysis': 1, 'creative-framing': 3, adaptability: 3 } },
      { id: 'mk-lina', name: 'Yulduz (synthetic)', title: 'Content Writer', dept: 'Marketing', persona: 'working-adult', years: 3, interests: ['creative'],
        skills: { 'ai-content-ops': 2, 'creative-framing': 3, communication: 3, 'digital-marketing': 2, adaptability: 2 } },
      { id: 'mk-ken', name: 'Diyora (synthetic)', title: 'SEO Specialist', dept: 'Marketing', persona: 'working-adult', years: 5, interests: ['technology'],
        skills: { 'digital-marketing': 3, 'data-analysis': 2, 'ai-content-ops': 1, 'critical-thinking': 2 } },
      { id: 'mk-iman', name: 'Zilola (synthetic)', title: 'Social Media Executive', dept: 'Marketing', persona: 'working-adult', years: 2, interests: ['creative', 'people'],
        skills: { 'digital-marketing': 3, 'creative-framing': 2, communication: 3, adaptability: 3 } },
      { id: 'mk-prem', name: 'Sabina (synthetic)', title: 'Marketing Analyst', dept: 'Marketing', persona: 'working-adult', years: 6, interests: ['business'],
        skills: { 'data-analysis': 3, python: 1, 'business-analysis': 2, 'digital-marketing': 2 } },
      { id: 'mk-yati', name: 'Iroda (synthetic)', title: 'Brand Manager', dept: 'Marketing', persona: 'working-adult', years: 9, interests: ['business'],
        skills: { leadership: 3, communication: 4, 'project-management': 3, 'creative-framing': 3 } },
      { id: 'mk-jonas', name: 'Murod (synthetic)', title: 'Video Producer', dept: 'Marketing', persona: 'working-adult', years: 4, interests: ['creative'],
        skills: { 'ai-content-ops': 2, 'creative-framing': 3, adaptability: 2 } },
      { id: 'mk-aina', name: 'Alisher (synthetic)', title: 'CRM Executive', dept: 'Marketing', persona: 'working-adult', years: 3, interests: ['people'],
        skills: { 'customer-experience': 3, 'data-analysis': 2, communication: 3, 'ai-augmented-ops': 1 } },
      { id: 'mk-farid', name: 'Asad (synthetic)', title: 'Performance Marketer', dept: 'Marketing', persona: 'working-adult', years: 5, interests: ['technology', 'business'],
        skills: { 'digital-marketing': 3, 'data-analysis': 2, 'prompt-engineering': 1, 'ai-content-ops': 2 } },
      { id: 'mk-michelle', name: 'Bekzod (synthetic)', title: 'Marketing Director', dept: 'Marketing', persona: 'working-adult', years: 15, interests: ['business', 'people'],
        skills: { leadership: 4, 'project-management': 3, 'business-analysis': 2, communication: 4 } },
    ],
  },
  {
    id: 'production-40',
    labelKey: 'tpl.production',
    industry: 'manufacturing',
    totalStaff: 40,
    shownMembers: [
      { id: 'pr-tan', name: 'Umid (synthetic)', title: 'Line Supervisor', dept: 'Production', persona: 'working-adult', years: 12, interests: ['technology'],
        skills: { iot: 1, robotics: 1, 'project-management': 2, leadership: 2, communication: 3 } },
      { id: 'pr-muthu', name: 'Nargiza (synthetic)', title: 'Machine Operator', dept: 'Production', persona: 'working-adult', years: 8, interests: [],
        skills: { adaptability: 3 } },
      { id: 'pr-siti', name: 'Nodir (synthetic)', title: 'QA Inspector', dept: 'Quality', persona: 'working-adult', years: 6, interests: ['technology'],
        skills: { 'critical-thinking': 2, 'data-analysis': 1, iot: 1 } },
      { id: 'pr-ali', name: 'Nasiba (synthetic)', title: 'Maintenance Technician', dept: 'Facilities', persona: 'tvet-student', years: 5, interests: ['green'],
        skills: { iot: 2, robotics: 1, adaptability: 3 } },
      { id: 'pr-chong', name: 'Abdulla (synthetic)', title: 'Process Engineer', dept: 'Engineering', persona: 'working-adult', years: 7, interests: ['technology'],
        skills: { 'data-analysis': 2, iot: 2, python: 1, 'business-analysis': 2 } },
      { id: 'pr-rani', name: 'Farhod (synthetic)', title: 'Production Planner', dept: 'Planning', persona: 'working-adult', years: 10, interests: ['business'],
        skills: { 'supply-chain': 2, 'data-analysis': 2, 'project-management': 2 } },
      { id: 'pr-hakim', name: 'Munisa (synthetic)', title: 'Forklift Operator', dept: 'Warehouse', persona: 'working-adult', years: 4, interests: [],
        skills: { adaptability: 3 } },
      { id: 'pr-lim', name: 'Fotima (synthetic)', title: 'CNC Operator', dept: 'Production', persona: 'tvet-student', years: 3, interests: ['technology'],
        skills: { robotics: 1, iot: 1 } },
      { id: 'pr-nurul', name: 'Robiya (synthetic)', title: 'Packaging Lead', dept: 'Warehouse', persona: 'working-adult', years: 7, interests: ['people'],
        skills: { leadership: 2, communication: 2, adaptability: 2 } },
      { id: 'pr-vinod', name: 'Laylo (synthetic)', title: 'Safety Officer', dept: 'HSE', persona: 'working-adult', years: 11, interests: ['education'],
        skills: { 'critical-thinking': 3, communication: 3, iot: 1 } },
      { id: 'pr-meifong', name: 'Nilufar (synthetic)', title: 'Inventory Clerk', dept: 'Warehouse', persona: 'working-adult', years: 5, interests: [],
        skills: { 'data-analysis': 1, adaptability: 2 } },
      { id: 'pr-rosli', name: 'Islom (synthetic)', title: 'Shift Leader', dept: 'Production', persona: 'working-adult', years: 14, interests: ['people'],
        skills: { leadership: 3, communication: 3, 'project-management': 2 } },
    ],
  },
  {
    id: 'bankops-12',
    labelKey: 'tpl.bankops',
    industry: 'banking',
    totalStaff: 12,
    shownMembers: [
      { id: 'bk-aina', name: 'Alisher (synthetic)', title: 'Operations Executive', dept: 'Banking Ops', persona: 'working-adult', years: 18, interests: ['business', 'technology'],
        skills: { 'ai-augmented-ops': 2, 'data-analysis': 2, communication: 4, 'project-management': 3, 'critical-thinking': 3, 'customer-experience': 3 } },
      { id: 'bk-devi', name: 'Durdona (synthetic)', title: 'Finance Analyst', dept: 'Finance', persona: 'working-adult', years: 12, interests: ['business', 'sustainability'],
        skills: { 'data-analysis': 4, 'business-analysis': 3, 'critical-thinking': 4, python: 1, communication: 3, 'climate-data': 1 } },
      { id: 'bk-kamal', name: 'Gulshan (synthetic)', title: 'Teller Supervisor', dept: 'Branch', persona: 'working-adult', years: 15, interests: ['service'],
        skills: { 'customer-experience': 3, communication: 3, 'ai-augmented-ops': 1 } },
      { id: 'bk-letchumi', name: 'Sardor (synthetic)', title: 'Reconciliation Clerk', dept: 'Banking Ops', persona: 'working-adult', years: 9, interests: [],
        skills: { 'data-analysis': 2, adaptability: 2 } },
      { id: 'bk-hafiz', name: 'Sherzod (synthetic)', title: 'Loan Ops Officer', dept: 'Credit Ops', persona: 'working-adult', years: 6, interests: ['business'],
        skills: { 'business-analysis': 2, 'data-analysis': 2, 'privacy-compliance': 1 } },
      { id: 'bk-sueann', name: 'Shohruh (synthetic)', title: 'Compliance Analyst', dept: 'Compliance', persona: 'working-adult', years: 8, interests: ['business'],
        skills: { 'privacy-compliance': 3, 'critical-thinking': 3, 'data-analysis': 2 } },
      { id: 'bk-firdaus', name: 'Jahongir (synthetic)', title: 'Branch Ops Lead', dept: 'Branch', persona: 'working-adult', years: 13, interests: ['people'],
        skills: { leadership: 3, 'project-management': 3, communication: 3 } },
      { id: 'bk-priya', name: 'Elyor (synthetic)', title: 'KYC Analyst', dept: 'Compliance', persona: 'working-adult', years: 4, interests: ['technology'],
        skills: { 'data-analysis': 2, 'critical-thinking': 3, 'ai-augmented-ops': 1 } },
      { id: 'bk-zul', name: 'Shavkat (synthetic)', title: 'Payment Ops Officer', dept: 'Payments', persona: 'working-adult', years: 5, interests: ['technology'],
        skills: { 'data-analysis': 2, adaptability: 3, 'prompt-engineering': 1 } },
      { id: 'bk-carmen', name: 'Shahnoza (synthetic)', title: 'Customer Care Officer', dept: 'Service', persona: 'working-adult', years: 3, interests: ['service', 'people'],
        skills: { 'customer-experience': 3, communication: 3 } },
      { id: 'bk-danial', name: 'Dildora (synthetic)', title: 'Junior Analyst', dept: 'Finance', persona: 'fresh-grad', years: 1, interests: ['technology', 'ai'],
        skills: { python: 1, 'data-analysis': 2, 'machine-learning': 1 } },
      { id: 'bk-alicia', name: 'Sanjar (synthetic)', title: 'Operations Manager', dept: 'Banking Ops', persona: 'working-adult', years: 20, interests: ['business', 'people'],
        skills: { leadership: 4, 'business-analysis': 3, 'project-management': 3, communication: 4 } },
    ],
  },
  {
    id: 'it-8',
    labelKey: 'tpl.it',
    industry: 'technology',
    totalStaff: 8,
    shownMembers: [
      { id: 'it-hafiz', name: 'Sherzod (synthetic)', title: 'IT Support Officer', dept: 'Technology', persona: 'working-adult', years: 3, interests: ['technology'],
        skills: { 'software-engineering': 2, cybersecurity: 2, cloud: 2, communication: 2, iot: 1, 'prompt-engineering': 2 } },
      { id: 'it-weijie', name: 'Nodira (synthetic)', title: 'Frontend Developer', dept: 'Technology', persona: 'working-adult', years: 4, interests: ['technology', 'creative'],
        skills: { 'software-engineering': 3, 'ai-content-ops': 1, cloud: 1 } },
      { id: 'it-sanjay', name: 'Timur (synthetic)', title: 'Backend Developer', dept: 'Technology', persona: 'working-adult', years: 7, interests: ['technology'],
        skills: { 'software-engineering': 4, python: 3, devops: 2, cloud: 2 } },
      { id: 'it-nadia', name: 'Saida (synthetic)', title: 'QA Engineer', dept: 'Technology', persona: 'working-adult', years: 5, interests: ['technology'],
        skills: { 'critical-thinking': 3, 'software-engineering': 2, 'ai-agents': 1 } },
      { id: 'it-kean', name: 'Anvar (synthetic)', title: 'Data Engineer', dept: 'Data', persona: 'working-adult', years: 6, interests: ['technology', 'ai'],
        skills: { 'data-engineering': 3, python: 3, cloud: 2 } },
      { id: 'it-lisa', name: 'Gavhar (synthetic)', title: 'Product Owner', dept: 'Product', persona: 'working-adult', years: 8, interests: ['business', 'technology'],
        skills: { 'product-management': 3, 'business-analysis': 3, communication: 3 } },
      { id: 'it-rahman', name: 'Farrukh (synthetic)', title: 'DevOps Engineer', dept: 'Technology', persona: 'working-adult', years: 9, interests: ['technology'],
        skills: { devops: 3, cloud: 3, cybersecurity: 2 } },
      { id: 'it-xinyi', name: 'Akmal (synthetic)', title: 'UX Designer', dept: 'Product', persona: 'working-adult', years: 4, interests: ['creative', 'people'],
        skills: { 'creative-framing': 3, communication: 2, 'customer-experience': 2 } },
    ],
  },
  {
    id: 'logistics-15',
    labelKey: 'tpl.logistics',
    industry: 'logistics',
    totalStaff: 15,
    shownMembers: [
      { id: 'lg-gopal', name: 'Davron (synthetic)', title: 'Dispatcher', dept: 'Control Tower', persona: 'working-adult', years: 9, interests: ['technology'],
        skills: { 'supply-chain': 3, 'data-analysis': 2, communication: 3 } },
      { id: 'lg-meilin', name: 'Kamola (synthetic)', title: 'Warehouse Lead', dept: 'Warehouse', persona: 'working-adult', years: 11, interests: ['people'],
        skills: { leadership: 3, 'supply-chain': 2, iot: 1 } },
      { id: 'lg-azman', name: 'Hulkar (synthetic)', title: 'Driver Coordinator', dept: 'Fleet', persona: 'working-adult', years: 7, interests: [],
        skills: { adaptability: 3, communication: 2 } },
      { id: 'lg-joshua', name: 'Lola (synthetic)', title: 'Route Planner', dept: 'Control Tower', persona: 'working-adult', years: 5, interests: ['technology'],
        skills: { 'data-analysis': 2, 'supply-chain': 2, python: 1 } },
      { id: 'lg-saras', name: 'Shirin (synthetic)', title: 'Inventory Officer', dept: 'Warehouse', persona: 'working-adult', years: 6, interests: [],
        skills: { 'data-analysis': 2, adaptability: 2 } },
      { id: 'lg-beng', name: 'Muqaddas (synthetic)', title: 'Maintenance Crew', dept: 'Fleet', persona: 'tvet-student', years: 4, interests: ['green'],
        skills: { iot: 1, 'ev-mobility': 1, adaptability: 3 } },
      { id: 'lg-ailing', name: 'Doniyor (synthetic)', title: 'Customer Service Officer', dept: 'Service', persona: 'working-adult', years: 3, interests: ['service'],
        skills: { 'customer-experience': 3, communication: 3 } },
      { id: 'lg-sam', name: 'Mansur (synthetic)', title: 'Loader', dept: 'Warehouse', persona: 'working-adult', years: 2, interests: [],
        skills: { adaptability: 3 } },
      { id: 'lg-nurul', name: 'Robiya (synthetic)', title: 'Ops Clerk', dept: 'Control Tower', persona: 'working-adult', years: 4, interests: ['business'],
        skills: { 'data-analysis': 1, 'ai-augmented-ops': 1 } },
      { id: 'lg-david', name: 'Barno (synthetic)', title: 'Fleet Analyst', dept: 'Fleet', persona: 'working-adult', years: 8, interests: ['technology'],
        skills: { 'data-analysis': 3, 'business-analysis': 2 } },
      { id: 'lg-farah', name: 'Javohir (synthetic)', title: 'Safety & Compliance Officer', dept: 'HSE', persona: 'working-adult', years: 10, interests: ['education'],
        skills: { 'privacy-compliance': 2, communication: 3, 'critical-thinking': 2 } },
      { id: 'lg-ilham', name: 'Ziyoda (synthetic)', title: 'Procurement Executive', dept: 'Procurement', persona: 'working-adult', years: 6, interests: ['business'],
        skills: { 'business-analysis': 2, 'supply-chain': 2 } },
    ],
  },
  {
    id: 'public-10',
    labelKey: 'tpl.public',
    industry: 'public',
    totalStaff: 10,
    shownMembers: [
      { id: 'ps-fatimah', name: 'Sevara (synthetic)', title: 'Front Counter Officer', dept: 'Frontline', persona: 'working-adult', years: 10, interests: ['service'],
        skills: { 'customer-experience': 3, communication: 4, 'ai-augmented-ops': 1 } },
      { id: 'ps-rahman', name: 'Farrukh (synthetic)', title: 'Administrative Assistant', dept: 'Admin', persona: 'working-adult', years: 8, interests: [],
        skills: { 'data-analysis': 1, adaptability: 3 } },
      { id: 'ps-geetha', name: 'Feruza (synthetic)', title: 'Licensing Officer', dept: 'Licensing', persona: 'working-adult', years: 12, interests: ['business'],
        skills: { 'privacy-compliance': 2, 'critical-thinking': 2, communication: 3 } },
      { id: 'ps-zamri', name: 'Komil (synthetic)', title: 'Records Clerk', dept: 'Records', persona: 'working-adult', years: 15, interests: [],
        skills: { 'data-analysis': 1, adaptability: 2 } },
      { id: 'ps-alice', name: 'Ilhom (synthetic)', title: 'Public Relations Officer', dept: 'Comms', persona: 'working-adult', years: 7, interests: ['creative', 'people'],
        skills: { communication: 4, 'creative-framing': 2 } },
      { id: 'ps-fuad', name: 'Kumush (synthetic)', title: 'Payment Officer', dept: 'Finance', persona: 'working-adult', years: 9, interests: ['service'],
        skills: { 'customer-experience': 2, 'data-analysis': 2 } },
      { id: 'ps-noraini', name: 'Ulugbek (synthetic)', title: 'Team Lead', dept: 'Frontline', persona: 'working-adult', years: 17, interests: ['people'],
        skills: { leadership: 3, 'project-management': 3, communication: 3 } },
      { id: 'ps-kavitha', name: 'Zarina (synthetic)', title: 'Welfare Officer', dept: 'Frontline', persona: 'working-adult', years: 6, interests: ['service', 'health'],
        skills: { 'customer-experience': 3, 'mental-health': 2, communication: 3 } },
      { id: 'ps-syafiq', name: 'Bobur (synthetic)', title: 'IT Liaison Officer', dept: 'IT', persona: 'working-adult', years: 4, interests: ['technology'],
        skills: { 'software-engineering': 1, iot: 1, communication: 2 } },
      { id: 'ps-maisarah', name: 'Dilnoza (synthetic)', title: 'Management Intern', dept: 'Admin', persona: 'fresh-grad', years: 1, interests: ['technology', 'business'],
        skills: { adaptability: 4, 'digital-marketing': 1 } },
    ],
  },
];

export const TEMPLATE_MAP: Record<string, DeptTemplate> = Object.fromEntries(
  DEPT_TEMPLATES.map((tpl) => [tpl.id, tpl]),
);

// ─── Batch intake (synthetic): short sample CV snippets ────────────────────
// Employer onboarding "Upload batch employee CVs/JDs" runs the same
// client-side scrubber over every file — nothing leaves the browser.

export const BATCH_CVS: string[] = [
  'Employee 01. Customer service officer, 4 years. Skills: CRM, customer support, complaint handling.',
  'Employee 02. Data entry clerk, 9 years. Skills: Excel, data entry, invoicing, filing.',
  'Employee 03. Accounts assistant, 6 years. Skills: bookkeeping, reconciliations, accounting, tax filing.',
  'Employee 04. Marketing executive, 5 years. Skills: social media, content writing, Canva, email marketing.',
  'Employee 05. Warehouse supervisor, 11 years. Skills: inventory, warehouse systems, team supervision, safety.',
  'Employee 06. HR executive, 3 years. Skills: payroll, recruitment, onboarding, employment compliance.',
  'Employee 07. IT support, 5 years. Skills: Windows administration, networking, helpdesk, hardware repair.',
  'Employee 08. Administration executive, 7 years. Skills: scheduling, procurement, vendor management, presentations.',
  'Employee 09. Quality inspector, 8 years. Skills: quality reports, ISO 9001, calibration, sampling.',
  'Employee 10. Junior accountant, 4 years. Skills: audit preparation, ledger software, tax forms, reconciliation.',
  'Employee 11. Content creator, 2 years. Skills: short-form video, copywriting, basic analytics.',
  'Employee 12. Facilities technician, 13 years. Skills: electrical wiring, building systems, preventive maintenance.',
];

// The batch pipeline extracts roles + skills from the (scrubbed) CV text.
// Demo mapping — the same deterministic extractor used for individual CVs.
export const BATCH_TEAM: TeamMemberDef[] = [
  { id: 'batch-0', name: 'Employee 01 (batch, synthetic)', title: 'Customer Service Officer', dept: 'Batch intake', persona: 'working-adult', years: 4, interests: ['service'],
    skills: { 'customer-experience': 3, communication: 3 } },
  { id: 'batch-1', name: 'Employee 02 (batch, synthetic)', title: 'Data Entry Clerk', dept: 'Batch intake', persona: 'working-adult', years: 9, interests: [],
    skills: { 'data-analysis': 1, adaptability: 2 } },
  { id: 'batch-2', name: 'Employee 03 (batch, synthetic)', title: 'Accounts Assistant', dept: 'Batch intake', persona: 'working-adult', years: 6, interests: ['business'],
    skills: { 'data-analysis': 2, 'business-analysis': 1 } },
  { id: 'batch-3', name: 'Employee 04 (batch, synthetic)', title: 'Marketing Executive', dept: 'Batch intake', persona: 'working-adult', years: 5, interests: ['creative'],
    skills: { 'digital-marketing': 3, 'ai-content-ops': 1, 'creative-framing': 2 } },
  { id: 'batch-4', name: 'Employee 05 (batch, synthetic)', title: 'Warehouse Supervisor', dept: 'Batch intake', persona: 'working-adult', years: 11, interests: [],
    skills: { 'supply-chain': 3, leadership: 2, 'project-management': 2 } },
  { id: 'batch-5', name: 'Employee 06 (batch, synthetic)', title: 'HR Executive', dept: 'Batch intake', persona: 'working-adult', years: 3, interests: ['people'],
    skills: { communication: 3, 'privacy-compliance': 1, 'teaching-training': 1 } },
  { id: 'batch-6', name: 'Employee 07 (batch, synthetic)', title: 'IT Support', dept: 'Batch intake', persona: 'working-adult', years: 5, interests: ['technology'],
    skills: { 'software-engineering': 2, cybersecurity: 1, 'prompt-engineering': 1 } },
  { id: 'batch-7', name: 'Employee 08 (batch, synthetic)', title: 'Admin Executive', dept: 'Batch intake', persona: 'working-adult', years: 7, interests: [],
    skills: { 'project-management': 2, adaptability: 3 } },
  { id: 'batch-8', name: 'Employee 09 (batch, synthetic)', title: 'Quality Inspector', dept: 'Batch intake', persona: 'working-adult', years: 8, interests: ['technology'],
    skills: { 'critical-thinking': 2, 'data-analysis': 1 } },
  { id: 'batch-9', name: 'Employee 10 (batch, synthetic)', title: 'Junior Accountant', dept: 'Batch intake', persona: 'working-adult', years: 4, interests: ['business'],
    skills: { 'data-analysis': 2, 'business-analysis': 2 } },
  { id: 'batch-10', name: 'Employee 11 (batch, synthetic)', title: 'Content Creator', dept: 'Batch intake', persona: 'fresh-grad', years: 2, interests: ['creative'],
    skills: { 'ai-content-ops': 2, 'digital-marketing': 2, 'creative-framing': 3 } },
  { id: 'batch-11', name: 'Employee 12 (batch, synthetic)', title: 'Facilities Technician', dept: 'Batch intake', persona: 'tvet-student', years: 13, interests: ['green'],
    skills: { iot: 1, adaptability: 3, 'energy-efficiency': 1 } },
];

// Resolve the roster an employer's intake choice produces.
export function resolveRoster(
  employer: { intake: string; template: string },
): { members: TeamMemberDef[]; totalStaff: number; templateLabelKey: string } {
  if (employer.intake === 'template' && TEMPLATE_MAP[employer.template]) {
    const tpl = TEMPLATE_MAP[employer.template];
    return { members: tpl.shownMembers, totalStaff: tpl.totalStaff, templateLabelKey: tpl.labelKey };
  }
  if (employer.intake === 'batch') {
    return { members: BATCH_TEAM, totalStaff: BATCH_TEAM.length, templateLabelKey: 'emp.intake.batch' };
  }
  // matrix link or default → cross-functional demo team
  return { members: TEAM, totalStaff: TEAM.length, templateLabelKey: 'emp.intake.matrix' };
}
