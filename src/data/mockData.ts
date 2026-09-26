// GigEasy Mock Data Layer — SIH 26089 Cooperative Gig Services Platform
// Realistic NCR-based data for all cooperative, welfare, demand forecasting, and household service features

import {
  WorkerProfile,
  EmployerProfile,
  Job,
  JobApplication,
  Skill,
  CooperativeSociety,
  Federation,
  WorkerWelfare,
  WorkerCertification,
  DemandForecast,
  SkillGapAlert,
  TrainingRecommendation,
  ServiceRequest,
  Dispute,
} from '../types';
import { getLocalizedStatus, LanguageCode } from '../i18n/translations';

function getActiveLanguage(): LanguageCode {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem('gigeasy_language');
      if (stored) return JSON.parse(stored);
    }
  } catch {}
  return 'en';
}

// ─── Work Groups & Skills ──────────────────────────────────────────────────

export interface WorkGroup {
  id: string;
  name: string;
  nameHi: string;
  icon: string;
  color: string;
  skills: Skill[];
}

export const MOCK_SKILLS: Skill[] = [
  // Group 1: Construction & Infrastructure
  { id: 's_mason', name: 'Mason', category: 'Construction', icon: 'grid' },
  { id: 's_carpenter', name: 'Carpenter', category: 'Carpentry', icon: 'scissors' },
  { id: 's_painter', name: 'Painter', category: 'Painting', icon: 'edit-3' },
  { id: 's_electrician', name: 'Electrician', category: 'Electrical', icon: 'zap' },
  { id: 's_plumber', name: 'Plumber', category: 'Plumbing', icon: 'tool' },
  { id: 's_welder', name: 'Welder', category: 'Construction', icon: 'zap' },
  { id: 's_tile_fitter', name: 'Tile Fitter', category: 'Construction', icon: 'layers' },
  { id: 's_pop_worker', name: 'POP Worker', category: 'Construction', icon: 'home' },
  { id: 's_steel_fixer', name: 'Steel Fixer', category: 'Construction', icon: 'shield' },
  { id: 's_scaffolding', name: 'Scaffolding Worker', category: 'Construction', icon: 'server' },

  // Group 2: Factory & Industrial Workers
  { id: 's_packing', name: 'Packing Worker', category: 'Factory', icon: 'box' },
  { id: 's_assembly', name: 'Assembly Worker', category: 'Factory', icon: 'cpu' },
  { id: 's_warehouse_loader', name: 'Warehouse Loader', category: 'Warehouse', icon: 'package' },
  { id: 's_forklift', name: 'Forklift Operator', category: 'Factory', icon: 'truck' },
  { id: 's_material_handler', name: 'Material Handler', category: 'Factory', icon: 'archive' },

  // Group 3: Transportation & Delivery
  { id: 's_auto_driver', name: 'Auto Driver', category: 'Driving', icon: 'navigation' },
  { id: 's_erickshaw', name: 'E-Rickshaw Driver', category: 'Driving', icon: 'zap' },
  { id: 's_tempo_driver', name: 'Tempo Driver', category: 'Driving', icon: 'truck' },
  { id: 's_truck_driver', name: 'Truck Driver', category: 'Driving', icon: 'truck' },
  { id: 's_loader_unloader', name: 'Loader / Unloader', category: 'Delivery', icon: 'download' },

  // Group 4: Retail & Logistics
  { id: 's_warehouse_assoc', name: 'Warehouse Associate', category: 'Logistics', icon: 'package' },
  { id: 's_inventory_asst', name: 'Inventory Assistant', category: 'Logistics', icon: 'clipboard' },
  { id: 's_billing_asst', name: 'Billing Assistant', category: 'Retail', icon: 'file-text' },
  { id: 's_sales_promoter', name: 'Sales Promoter', category: 'Retail', icon: 'user-check' },

  // Group 5: Event & Hospitality
  { id: 's_decorator', name: 'Decorator', category: 'Events', icon: 'feather' },
  { id: 's_catering_staff', name: 'Catering Staff', category: 'Hospitality', icon: 'coffee' },
  { id: 's_waiter', name: 'Waiter', category: 'Hospitality', icon: 'user' },
  { id: 's_kitchen_helper', name: 'Kitchen Helper', category: 'Hospitality', icon: 'heart' },
  { id: 's_security_guard', name: 'Security Guard', category: 'Security', icon: 'shield' },
  { id: 's_housekeeping', name: 'Housekeeping Staff', category: 'Cleaning', icon: 'check-circle' },

  // Group 6: Household & Community Services (NEW for SIH 26089)
  { id: 's_home_plumber', name: 'Home Plumber', category: 'Plumbing', icon: 'droplet' },
  { id: 's_home_electrician', name: 'Home Electrician', category: 'Electrical', icon: 'zap' },
  { id: 's_home_carpenter', name: 'Home Carpenter', category: 'Carpentry', icon: 'tool' },
  { id: 's_home_painter', name: 'Home Painter', category: 'Painting', icon: 'edit-2' },
  { id: 's_deep_cleaner', name: 'Deep Cleaning Expert', category: 'Cleaning', icon: 'wind' },
  { id: 's_domestic_help', name: 'Domestic Help', category: 'Domestic Help', icon: 'home' },
  { id: 's_caregiver', name: 'Caregiver / Elder Care', category: 'Caregiving', icon: 'heart' },
  { id: 's_baby_care', name: 'Baby Care / Nanny', category: 'Caregiving', icon: 'star' },
  { id: 's_driver_personal', name: 'Personal Driver', category: 'Driving', icon: 'navigation' },
  { id: 's_gardener', name: 'Gardener / Landscaper', category: 'Gardening', icon: 'feather' },
  { id: 's_ac_tech', name: 'AC Technician', category: 'Appliance Repair', icon: 'wind' },
  { id: 's_appliance_tech', name: 'Appliance Technician', category: 'Appliance Repair', icon: 'settings' },
  { id: 's_pest_control', name: 'Pest Control', category: 'Pest Control', icon: 'alert-triangle' },
  { id: 's_cook', name: 'Cook / Chef', category: 'Domestic Help', icon: 'coffee' },
];

export const WORK_GROUPS: WorkGroup[] = [
  {
    id: 'grp_construction',
    name: 'Construction & Infrastructure',
    nameHi: 'निर्माण और बुनियादी ढांचा',
    icon: 'tool',
    color: '#EA580C',
    skills: MOCK_SKILLS.slice(0, 10),
  },
  {
    id: 'grp_factory',
    name: 'Factory & Industrial',
    nameHi: 'फैक्ट्री और औद्योगिक',
    icon: 'cpu',
    color: '#525942',
    skills: MOCK_SKILLS.slice(10, 15),
  },
  {
    id: 'grp_transport',
    name: 'Transport & Delivery',
    nameHi: 'परिवहन और डिलीवरी',
    icon: 'truck',
    color: '#C96F4A',
    skills: MOCK_SKILLS.slice(15, 20),
  },
  {
    id: 'grp_retail',
    name: 'Retail & Logistics',
    nameHi: 'रिटेल और लॉजिस्टिक्स',
    icon: 'package',
    color: '#3D7A5B',
    skills: MOCK_SKILLS.slice(20, 24),
  },
  {
    id: 'grp_hospitality',
    name: 'Event & Hospitality',
    nameHi: 'इवेंट और हॉस्पिटैलिटी',
    icon: 'coffee',
    color: '#A94F32',
    skills: MOCK_SKILLS.slice(24, 30),
  },
  {
    id: 'grp_household',
    name: 'Household Services',
    nameHi: 'घरेलू सेवाएं',
    icon: 'home',
    color: '#6F7358',
    skills: MOCK_SKILLS.slice(30, 44),
  },
];

// ─── Household Service Categories (for customer UI) ──────────────────────────

export interface HouseholdServiceCategory {
  id: string;
  name: string;
  nameHi: string;
  icon: string;
  color: string;
  bg: string;
  description: string;
  basePrice: number;       // Starting price INR
  avgDuration: string;     // e.g. "1-2 hours"
  skills: Skill[];
  isEmergency?: boolean;
}

export const HOUSEHOLD_SERVICE_CATEGORIES: HouseholdServiceCategory[] = [
  {
    id: 'plumbing',
    name: 'Plumbing',
    nameHi: 'प्लंबिंग',
    icon: 'droplet',
    color: '#2A2724',
    bg: '#EDE8DF',
    description: 'Leaks, pipe repairs, tap fitting, drain cleaning',
    basePrice: 350,
    avgDuration: '1-3 hours',
    skills: [MOCK_SKILLS[4], MOCK_SKILLS[30]],
    isEmergency: true,
  },
  {
    id: 'electrical',
    name: 'Electrical',
    nameHi: 'इलेक्ट्रिकल',
    icon: 'zap',
    color: '#B8860B',
    bg: '#FBF3DC',
    description: 'Wiring, switchboard, fan fitting, short circuit',
    basePrice: 400,
    avgDuration: '1-4 hours',
    skills: [MOCK_SKILLS[3], MOCK_SKILLS[31]],
    isEmergency: true,
  },
  {
    id: 'carpentry',
    name: 'Carpentry',
    nameHi: 'बढ़ईगीरी',
    icon: 'tool',
    color: '#A94F32',
    bg: '#F5E8DF',
    description: 'Furniture repair, door/window fixing, modular installation',
    basePrice: 500,
    avgDuration: '2-5 hours',
    skills: [MOCK_SKILLS[1], MOCK_SKILLS[32]],
  },
  {
    id: 'painting',
    name: 'Painting',
    nameHi: 'पेंटिंग',
    icon: 'edit-2',
    color: '#3D7A5B',
    bg: '#EDF0E6',
    description: 'Interior/exterior walls, wood polish, waterproofing',
    basePrice: 600,
    avgDuration: '4-8 hours',
    skills: [MOCK_SKILLS[2], MOCK_SKILLS[33]],
  },
  {
    id: 'cleaning',
    name: 'Cleaning',
    nameHi: 'सफ़ाई',
    icon: 'wind',
    color: '#6F7358',
    bg: '#EDF0E6',
    description: 'Deep cleaning, bathroom, kitchen, full home',
    basePrice: 800,
    avgDuration: '3-6 hours',
    skills: [MOCK_SKILLS[29], MOCK_SKILLS[34]],
  },
  {
    id: 'domestic_help',
    name: 'Domestic Help',
    nameHi: 'घरेलू सहायता',
    icon: 'home',
    color: '#C96F4A',
    bg: '#F5E8DF',
    description: 'Cooking, washing, sweeping, daily household tasks',
    basePrice: 400,
    avgDuration: '4-8 hours',
    skills: [MOCK_SKILLS[35], MOCK_SKILLS[43]],
  },
  {
    id: 'caregiving',
    name: 'Caregiving',
    nameHi: 'देखभाल सेवा',
    icon: 'heart',
    color: '#A94F32',
    bg: '#F5E8DF',
    description: 'Elder care, patient assistance, post-surgery care, baby care',
    basePrice: 700,
    avgDuration: '4-12 hours',
    skills: [MOCK_SKILLS[36], MOCK_SKILLS[37]],
  },
  {
    id: 'drivers',
    name: 'Driver',
    nameHi: 'ड्राइवर',
    icon: 'navigation',
    color: '#1E1C1A',
    bg: '#EDE8DF',
    description: 'Personal driver, outstation trips, airport pickup',
    basePrice: 600,
    avgDuration: '4-12 hours',
    skills: [MOCK_SKILLS[38]],
  },
  {
    id: 'gardening',
    name: 'Gardening',
    nameHi: 'बागवानी',
    icon: 'feather',
    color: '#3D7A5B',
    bg: '#EDF0E6',
    description: 'Garden maintenance, lawn mowing, plant care',
    basePrice: 500,
    avgDuration: '2-4 hours',
    skills: [MOCK_SKILLS[39]],
  },
  {
    id: 'appliance_repair',
    name: 'Appliance Repair',
    nameHi: 'उपकरण मरम्मत',
    icon: 'settings',
    color: '#B8860B',
    bg: '#FBF3DC',
    description: 'AC, washing machine, refrigerator, TV repair',
    basePrice: 500,
    avgDuration: '1-3 hours',
    skills: [MOCK_SKILLS[40], MOCK_SKILLS[41]],
    isEmergency: true,
  },
];

// ─── Cooperative Societies ────────────────────────────────────────────────────

export const COOPERATIVE_SOCIETIES: CooperativeSociety[] = [
  {
    id: 'coop_1',
    name: 'Delhi Plumbing & Electrical Workers Cooperative',
    registrationNumber: 'DL-COOP-2019-0421',
    type: 'service_cooperative',
    federationId: 'fed_ncr_1',
    district: 'New Delhi',
    state: 'Delhi',
    address: 'Plot 14, Lajpat Nagar II, New Delhi - 110024',
    contactName: 'Rakesh Prasad',
    contactPhone: '+91 98100 11234',
    memberCount: 142,
    activeWorkers: 89,
    servicesOffered: ['Plumbing', 'Electrical', 'Appliance Repair'],
    verificationStatus: 'verified',
    rating: 4.7,
    totalJobsCompleted: 3841,
    establishedYear: 2019,
    description: 'A worker-owned cooperative of certified plumbers and electricians serving South Delhi households and institutions. All members are Aadhaar-verified and NSDC-certified.',
    zones: ['Zone 1 - Central Delhi', 'Zone 2 - South Delhi', 'Zone 5 - East Delhi'],
  },
  {
    id: 'coop_2',
    name: 'Noida Household Services Cooperative Society',
    registrationNumber: 'UP-COOP-2020-1187',
    type: 'multi_service',
    federationId: 'fed_ncr_1',
    district: 'Gautam Buddha Nagar',
    state: 'Uttar Pradesh',
    address: 'Sector 15A, Noida - 201301',
    contactName: 'Meena Devi',
    contactPhone: '+91 95410 22345',
    memberCount: 218,
    activeWorkers: 134,
    servicesOffered: ['Cleaning', 'Domestic Help', 'Caregiving', 'Gardening'],
    verificationStatus: 'verified',
    rating: 4.5,
    totalJobsCompleted: 5218,
    establishedYear: 2020,
    description: 'Female-majority cooperative providing domestic and caregiving services across Noida and Greater Noida. 80% women-owned, focus on safe and fair employment.',
    zones: ['Zone 6 - Noida', 'Zone 7 - Greater Noida', 'Zone 8 - Ghaziabad'],
  },
  {
    id: 'coop_3',
    name: 'Gurugram Multi-Trade Cooperative',
    registrationNumber: 'HR-COOP-2018-0892',
    type: 'labour_cooperative',
    federationId: 'fed_ncr_1',
    district: 'Gurugram',
    state: 'Haryana',
    address: 'DLF Phase 2, Sector 25, Gurugram - 122002',
    contactName: 'Suresh Kumar',
    contactPhone: '+91 90013 33456',
    memberCount: 187,
    activeWorkers: 112,
    servicesOffered: ['Carpentry', 'Painting', 'Construction', 'Appliance Repair', 'Driving'],
    verificationStatus: 'verified',
    rating: 4.6,
    totalJobsCompleted: 4102,
    establishedYear: 2018,
    description: 'Multi-trade cooperative providing skilled construction and household services to corporate campuses and gated communities in Gurugram.',
    zones: ['Zone 3 - Gurugram North', 'Zone 4 - Gurugram South', 'Zone 9 - Faridabad'],
  },
];

export const FEDERATION: Federation = {
  id: 'fed_ncr_1',
  name: 'NCR Labour Cooperative Federation',
  state: 'Multi-State (Delhi, UP, Haryana)',
  societies: ['coop_1', 'coop_2', 'coop_3'],
  contactName: 'Dr. Anjali Singh',
  contactPhone: '+91 91000 55678',
  totalWorkers: 547,
  totalSocieties: 3,
  servicesOffered: ['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning', 'Domestic Help', 'Caregiving', 'Gardening', 'Appliance Repair', 'Driving'],
  description: 'Federation of three registered labour cooperative societies providing coordinated household and community services across the NCR. Ensures fair wages, welfare benefits, and skill development for all member workers.',
};

// ─── Employers ───────────────────────────────────────────────────────────────

export const MOCK_EMPLOYERS: EmployerProfile[] = [
  {
    id: 'e1',
    userId: 'u_e1',
    businessName: 'Bharat Logistics Pvt Ltd',
    businessType: 'Logistics & Warehousing',
    location: {
      lat: 28.6139,
      lng: 77.209,
      address: 'Sector 62, NSEZ',
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: '201301',
    },
    contactName: 'Amit Sharma',
    description: 'Premier regional logistics company operating modern fulfilment warehouses across NCR.',
    verificationStatus: 'verified',
    rating: 4.8,
    totalJobsPosted: 48,
    hiringHistory: [],
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2026-08-13T00:00:00Z',
  },
  {
    id: 'e2',
    userId: 'u_e2',
    businessName: 'Shree Constructions',
    businessType: 'Construction & Contracting',
    location: {
      lat: 28.5355,
      lng: 77.391,
      address: 'Sector 18, Vasundhara',
      city: 'Ghaziabad',
      state: 'Uttar Pradesh',
    },
    contactName: 'Rajesh Verma',
    verificationStatus: 'verified',
    rating: 4.6,
    totalJobsPosted: 22,
    hiringHistory: [],
    createdAt: '2025-03-20T00:00:00Z',
    updatedAt: '2026-08-13T00:00:00Z',
  },
  {
    id: 'e3',
    userId: 'u_e3',
    businessName: 'Grand Palace Banquets',
    businessType: 'Events & Hospitality',
    location: {
      lat: 28.6304,
      lng: 77.2177,
      address: 'Connaught Place',
      city: 'New Delhi',
      state: 'Delhi',
    },
    contactName: 'Sunita Kapoor',
    verificationStatus: 'verified',
    rating: 4.9,
    totalJobsPosted: 35,
    hiringHistory: [],
    createdAt: '2025-02-10T00:00:00Z',
    updatedAt: '2026-08-13T00:00:00Z',
  },
  {
    id: 'e4',
    userId: 'u_e4',
    businessName: 'TechnoFab Industries',
    businessType: 'Manufacturing',
    location: {
      lat: 28.4089,
      lng: 77.3178,
      address: 'IMT Manesar',
      city: 'Gurugram',
      state: 'Haryana',
    },
    contactName: 'Vivek Malhotra',
    verificationStatus: 'verified',
    rating: 4.4,
    totalJobsPosted: 17,
    hiringHistory: [],
    createdAt: '2025-05-08T00:00:00Z',
    updatedAt: '2026-08-13T00:00:00Z',
  },
];

// ─── Certifications ───────────────────────────────────────────────────────────

const CERTIFICATION_PLUMBER: WorkerCertification = {
  id: 'cert_plumb_1',
  name: 'Plumbing & Pipe Fitting Certificate',
  issuedBy: 'ITI Delhi',
  issueDate: '2022-06-15',
  expiryDate: '2025-06-14',
  verified: true,
  skillCategory: 'Plumbing',
};

const CERTIFICATION_ELECTRICIAN: WorkerCertification = {
  id: 'cert_elec_1',
  name: 'Electrician (Wireman License)',
  issuedBy: 'Delhi Electricity Board',
  issueDate: '2021-09-01',
  expiryDate: '2026-08-31',
  verified: true,
  skillCategory: 'Electrical',
};

const CERTIFICATION_NSDC: WorkerCertification = {
  id: 'cert_nsdc_1',
  name: 'NSDC Skill Certificate — Domestic Service',
  issuedBy: 'NSDC (National Skill Development Corporation)',
  issueDate: '2023-03-20',
  verified: true,
  skillCategory: 'Domestic Help',
};

const CERTIFICATION_CAREGIVER: WorkerCertification = {
  id: 'cert_care_1',
  name: 'Home Health Aide Certificate',
  issuedBy: 'Delhi Skill Authority',
  issueDate: '2023-11-10',
  verified: true,
  skillCategory: 'Caregiving',
};

const CERTIFICATION_AC_TECH: WorkerCertification = {
  id: 'cert_ac_1',
  name: 'HVAC & Air Conditioning Technician',
  issuedBy: 'ITI Noida',
  issueDate: '2022-04-01',
  expiryDate: '2025-03-31',
  verified: true,
  skillCategory: 'Appliance Repair',
};

// ─── Worker Welfare Data ──────────────────────────────────────────────────────

export const WELFARE_W1: WorkerWelfare = {
  workerId: 'w1',
  insurance: [
    {
      policyNumber: 'PMSBY-W1-2026',
      provider: 'Pradhan Mantri Suraksha Bima Yojana',
      type: 'accidental',
      coverageAmount: 200000,
      premiumPerMonth: 20,
      status: 'active',
      startDate: '2026-04-01',
      expiryDate: '2027-03-31',
      claimable: true,
    },
    {
      policyNumber: 'PMJJBY-W1-2026',
      provider: 'Pradhan Mantri Jeevan Jyoti Bima Yojana',
      type: 'life',
      coverageAmount: 200000,
      premiumPerMonth: 43,
      status: 'active',
      startDate: '2026-04-01',
      expiryDate: '2027-03-31',
      claimable: true,
    },
  ],
  welfareSchemes: [
    { id: 'ws1', name: 'Cooperative Health Fund', description: 'Monthly health support for cooperative members', monthlyBenefit: 500, status: 'active', enrolledDate: '2024-01-01' },
    { id: 'ws2', name: 'Skill Upgrade Grant', description: 'Up to ₹5,000 for certified skill training', status: 'active', enrolledDate: '2024-01-01' },
    { id: 'ws3', name: 'Festival Bonus Scheme', description: 'Diwali & Holi bonus from cooperative surplus', monthlyBenefit: 0, status: 'active', enrolledDate: '2024-01-01' },
  ],
  emergencyFundBalance: 8500,
  trainingCredits: 24,
  completedTrainings: ['Advanced Electrical Safety (NSDC)', 'Customer Service Excellence'],
  totalContributed: 14280,
  cooperativeContributed: 8500,
};

export const WELFARE_W2: WorkerWelfare = {
  workerId: 'w2',
  insurance: [
    {
      policyNumber: 'PMSBY-W2-2026',
      provider: 'Pradhan Mantri Suraksha Bima Yojana',
      type: 'accidental',
      coverageAmount: 200000,
      premiumPerMonth: 20,
      status: 'active',
      startDate: '2026-04-01',
      expiryDate: '2027-03-31',
      claimable: true,
    },
  ],
  welfareSchemes: [
    { id: 'ws1', name: 'Cooperative Health Fund', description: 'Monthly health support', monthlyBenefit: 500, status: 'active', enrolledDate: '2024-06-01' },
    { id: 'ws4', name: 'Women Entrepreneur Support', description: 'Special scheme for women cooperative members', monthlyBenefit: 1000, status: 'active', enrolledDate: '2024-06-01' },
  ],
  emergencyFundBalance: 5200,
  trainingCredits: 16,
  completedTrainings: ['Domestic Service Excellence', 'Safety & Hygiene Standards'],
  totalContributed: 9640,
  cooperativeContributed: 5200,
};

// ─── Workers ─────────────────────────────────────────────────────────────────

export const MOCK_WORKERS: WorkerProfile[] = [
  {
    id: 'w1',
    userId: 'u_w1',
    name: 'Ravi Kumar',
    phoneNumber: '+91 98765 43210',
    location: {
      lat: 28.62,
      lng: 77.22,
      address: 'Sector 15',
      city: 'Noida',
      state: 'Uttar Pradesh',
      zone: 'Zone 6 - Noida',
    },
    skills: [MOCK_SKILLS[3], MOCK_SKILLS[12], MOCK_SKILLS[31], MOCK_SKILLS[40]],
    certifications: [CERTIFICATION_ELECTRICIAN, CERTIFICATION_AC_TECH],
    experienceYears: 6,
    availabilityStatus: 'available',
    preferredRadius: 15,
    languages: ['Hindi', 'English'],
    bio: 'Experienced industrial and home electrician. Safety certified with 47+ completed gigs. Cooperative member since 2024.',
    trustScore: 94,
    trustLabel: 'Excellent',
    verificationStatus: 'verified',
    aadhaarVerified: true,
    rating: 4.9,
    completedJobs: 47,
    activeJobsCount: 0,
    weeklyEarnings: 4200,
    monthlyEarnings: 16800,
    totalLifetimeEarnings: 248000,
    cooperativeId: 'coop_1',
    cooperativeName: 'Delhi Plumbing & Electrical Workers Cooperative',
    cooperativeMemberSince: '2024-01-15',
    welfare: WELFARE_W1,
    primaryTrade: 'Electrician',
    expectedDailyWage: 1200,
    preferredLocations: ['Noida Sector 15', 'Noida Sector 62', 'Indirapuram', 'Mayur Vihar'],
    preferredCategories: ['Electrical', 'Appliance Repair', 'Warehouse'],
    cooperativeVerified: true,
    skillVerified: true,
    insuranceActive: true,
    workHistory: [
      { id: 'wh0', jobTitle: 'Industrial Electrical Work', employerName: 'TechnoFab Industries', wage: 1500, date: '2026-09-04', rating: 5, status: 'completed', serviceCategory: 'Electrical' },
      { id: 'wh1', jobTitle: 'Home Electrical Repair', employerName: 'Mrs. Sharma, Lajpat Nagar', wage: 1200, date: '2026-09-03', rating: 5, status: 'completed', serviceCategory: 'Electrical' },
      { id: 'wh2', jobTitle: 'AC Installation & Service', employerName: 'Mr. Gupta, Noida', wage: 1500, date: '2026-09-01', rating: 5, status: 'completed', serviceCategory: 'Appliance Repair' },
      { id: 'wh3', jobTitle: 'Warehouse Electrician', employerName: 'Bharat Logistics', wage: 1200, date: '2026-08-28', rating: 4, status: 'completed', serviceCategory: 'Electrical' },
    ],
    distanceKm: 2.1,
    createdAt: '2025-02-10T00:00:00Z',
    updatedAt: '2026-09-05T00:00:00Z',
  },
  {
    id: 'w2',
    userId: 'u_w2',
    name: 'Sunita Devi',
    phoneNumber: '+91 87654 32109',
    location: {
      lat: 28.58,
      lng: 77.31,
      address: 'Vasundhara',
      city: 'Ghaziabad',
      state: 'Uttar Pradesh',
      zone: 'Zone 8 - Ghaziabad',
    },
    skills: [MOCK_SKILLS[29], MOCK_SKILLS[34], MOCK_SKILLS[35], MOCK_SKILLS[43]],
    certifications: [CERTIFICATION_NSDC],
    experienceYears: 4,
    availabilityStatus: 'available',
    preferredRadius: 10,
    languages: ['Hindi'],
    bio: 'Certified domestic service professional. Specialises in deep cleaning and household management.',
    trustScore: 88,
    trustLabel: 'Good',
    verificationStatus: 'verified',
    aadhaarVerified: true,
    rating: 4.7,
    completedJobs: 29,
    activeJobsCount: 1,
    weeklyEarnings: 2800,
    monthlyEarnings: 11200,
    totalLifetimeEarnings: 136000,
    cooperativeId: 'coop_2',
    cooperativeName: 'Noida Household Services Cooperative Society',
    cooperativeMemberSince: '2024-06-20',
    welfare: WELFARE_W2,
    workHistory: [
      { id: 'wh4', jobTitle: 'Deep Home Cleaning', employerName: 'Mrs. Kapoor, Vasundhara', wage: 900, date: '2026-09-04', rating: 5, status: 'completed', serviceCategory: 'Cleaning' },
      { id: 'wh5', jobTitle: 'Regular Maid Service', employerName: 'Mr. Singh, Noida Sec-50', wage: 700, date: '2026-09-03', rating: 4, status: 'completed', serviceCategory: 'Domestic Help' },
    ],
    createdAt: '2025-06-20T00:00:00Z',
    updatedAt: '2026-09-05T00:00:00Z',
  },
  {
    id: 'w3',
    userId: 'u_w3',
    name: 'Mohd. Salim',
    phoneNumber: '+91 76543 21098',
    location: {
      lat: 28.59,
      lng: 77.26,
      address: 'Jamia Nagar',
      city: 'New Delhi',
      state: 'Delhi',
      zone: 'Zone 2 - South Delhi',
    },
    skills: [MOCK_SKILLS[1], MOCK_SKILLS[2], MOCK_SKILLS[32], MOCK_SKILLS[33]],
    certifications: [],
    experienceYears: 8,
    availabilityStatus: 'available',
    preferredRadius: 20,
    languages: ['Hindi', 'English'],
    bio: 'Expert carpenter and painter with 8 years of experience. Furniture repair, modular kitchen, interior painting specialist.',
    trustScore: 82,
    trustLabel: 'Good',
    verificationStatus: 'verified',
    aadhaarVerified: true,
    rating: 4.5,
    completedJobs: 62,
    activeJobsCount: 0,
    weeklyEarnings: 3500,
    monthlyEarnings: 14000,
    totalLifetimeEarnings: 321000,
    cooperativeId: 'coop_3',
    cooperativeName: 'Gurugram Multi-Trade Cooperative',
    cooperativeMemberSince: '2023-11-01',
    workHistory: [
      { id: 'wh6', jobTitle: 'Home Painting (2BHK)', employerName: 'Mr. Mehta, Gurugram', wage: 2200, date: '2026-09-02', rating: 5, status: 'completed', serviceCategory: 'Painting' },
    ],
    createdAt: '2024-11-01T00:00:00Z',
    updatedAt: '2026-09-05T00:00:00Z',
  },
  {
    id: 'w4',
    userId: 'u_w4',
    name: 'Priya Sharma',
    phoneNumber: '+91 99001 44321',
    location: {
      lat: 28.64,
      lng: 77.19,
      address: 'Rohini',
      city: 'New Delhi',
      state: 'Delhi',
      zone: 'Zone 1 - Central Delhi',
    },
    skills: [MOCK_SKILLS[36], MOCK_SKILLS[37]],
    certifications: [CERTIFICATION_CAREGIVER],
    experienceYears: 5,
    availabilityStatus: 'available',
    preferredRadius: 12,
    languages: ['Hindi', 'English'],
    bio: 'Certified home health aide. Specialises in elder care and post-surgery patient assistance. Compassionate, trained in first aid.',
    trustScore: 91,
    trustLabel: 'Excellent',
    verificationStatus: 'verified',
    aadhaarVerified: true,
    rating: 4.8,
    completedJobs: 38,
    activeJobsCount: 0,
    weeklyEarnings: 3800,
    monthlyEarnings: 15200,
    totalLifetimeEarnings: 189000,
    cooperativeId: 'coop_2',
    cooperativeName: 'Noida Household Services Cooperative Society',
    cooperativeMemberSince: '2024-03-01',
    workHistory: [
      { id: 'wh7', jobTitle: 'Elder Care (24hr)', employerName: 'Verma Family, Rohini', wage: 2500, date: '2026-09-01', rating: 5, status: 'completed', serviceCategory: 'Caregiving' },
    ],
    createdAt: '2024-09-12T00:00:00Z',
    updatedAt: '2026-09-05T00:00:00Z',
  },
  {
    id: 'w5',
    userId: 'u_w5',
    name: 'Ajay Yadav',
    phoneNumber: '+91 95501 77890',
    location: {
      lat: 28.57,
      lng: 77.32,
      address: 'Faridabad',
      city: 'Faridabad',
      state: 'Haryana',
      zone: 'Zone 9 - Faridabad',
    },
    skills: [MOCK_SKILLS[4], MOCK_SKILLS[30]],
    certifications: [CERTIFICATION_PLUMBER],
    experienceYears: 9,
    availabilityStatus: 'busy',
    preferredRadius: 20,
    languages: ['Hindi'],
    bio: 'Senior plumber with 9 years of residential and commercial experience. ITI certified.',
    trustScore: 87,
    trustLabel: 'Good',
    verificationStatus: 'verified',
    aadhaarVerified: true,
    rating: 4.6,
    completedJobs: 84,
    activeJobsCount: 2, // Currently busy — FairWork will deprioritize
    weeklyEarnings: 6200,
    monthlyEarnings: 19000,
    totalLifetimeEarnings: 467000,
    cooperativeId: 'coop_1',
    cooperativeName: 'Delhi Plumbing & Electrical Workers Cooperative',
    cooperativeMemberSince: '2022-08-10',
    workHistory: [
      { id: 'wh8', jobTitle: 'Bathroom Plumbing Repair', employerName: 'Mr. Tiwari, Faridabad', wage: 1800, date: '2026-09-05', rating: 5, status: 'completed', serviceCategory: 'Plumbing' },
    ],
    createdAt: '2022-08-10T00:00:00Z',
    updatedAt: '2026-09-05T00:00:00Z',
  },
];

export const CURRENT_WORKER: WorkerProfile = MOCK_WORKERS[0];
export const CURRENT_EMPLOYER: EmployerProfile = MOCK_EMPLOYERS[0];

// ─── Jobs (B2B, preserved) ────────────────────────────────────────────────────

export const MOCK_JOBS: Job[] = [
  {
    id: 'j1',
    employerId: 'e1',
    employer: MOCK_EMPLOYERS[0],
    title: 'Warehouse Loading Helper',
    description: 'Need experienced loading and package handlers for morning logistics shift.',
    skillRequired: MOCK_SKILLS[12],
    location: { lat: 28.6139, lng: 77.209, address: 'Sector 62, NSEZ', city: 'Noida', state: 'Uttar Pradesh' },
    startDate: '2026-09-07',
    startTime: '08:00 AM',
    endTime: '05:00 PM',
    workersRequired: 15,
    workersHired: 8,
    minWage: 850,
    maxWage: 1000,
    requirements: ['Physical stamina', 'Punctual arrival', 'Package handling experience'],
    status: 'HIRING',
    distanceKm: 2.4,
    createdAt: '2026-09-05T06:00:00Z',
    updatedAt: '2026-09-05T06:00:00Z',
  },
  {
    id: 'j2',
    employerId: 'e2',
    employer: MOCK_EMPLOYERS[1],
    title: 'Construction Site Helper',
    description: 'Site helpers required for residential framing project. Material movement and mason support.',
    skillRequired: MOCK_SKILLS[0],
    location: { lat: 28.5355, lng: 77.391, address: 'Sector 18, Vasundhara', city: 'Ghaziabad', state: 'Uttar Pradesh' },
    startDate: '2026-09-06',
    startTime: '07:30 AM',
    endTime: '04:30 PM',
    workersRequired: 5,
    workersHired: 4,
    minWage: 750,
    maxWage: 850,
    requirements: ['Hard hat compliance', 'Prior site work preferred'],
    status: 'HIRING',
    distanceKm: 1.8,
    createdAt: '2026-09-04T08:00:00Z',
    updatedAt: '2026-09-05T00:00:00Z',
  },
  {
    id: 'j3',
    employerId: 'e3',
    employer: MOCK_EMPLOYERS[2],
    title: 'Event Setup Crew',
    description: 'Corporate banquet setup crew needed for lighting, stage arrangement, and banquet service.',
    skillRequired: MOCK_SKILLS[24],
    location: { lat: 28.6304, lng: 77.2177, address: 'Connaught Place', city: 'New Delhi', state: 'Delhi' },
    startDate: '2026-09-08',
    startTime: '10:00 AM',
    endTime: '08:00 PM',
    workersRequired: 20,
    workersHired: 12,
    minWage: 1000,
    maxWage: 1200,
    requirements: ['Presentable attire', 'Team coordination', 'Hindi/English'],
    status: 'HIRING',
    distanceKm: 4.2,
    createdAt: '2026-09-03T10:00:00Z',
    updatedAt: '2026-09-05T00:00:00Z',
  },
  {
    id: 'j4',
    employerId: 'e4',
    employer: MOCK_EMPLOYERS[3],
    title: 'Industrial Electrician',
    description: 'Certified electrician needed for warehouse distribution board wiring and 3-phase connection testing.',
    skillRequired: MOCK_SKILLS[3],
    location: { lat: 28.6139, lng: 77.209, address: 'Sector 63, Noida', city: 'Noida', state: 'Uttar Pradesh' },
    startDate: '2026-09-07',
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    workersRequired: 3,
    workersHired: 1,
    minWage: 1300,
    maxWage: 1500,
    requirements: ['3+ years industrial wiring', 'Own multimeter & basic tools'],
    status: 'HIRING',
    distanceKm: 3.1,
    createdAt: '2026-09-05T07:00:00Z',
    updatedAt: '2026-09-05T07:00:00Z',
  },
  {
    id: 'j5',
    employerId: 'e1',
    employer: MOCK_EMPLOYERS[0],
    title: 'Packing & Assembly Worker',
    description: 'Packing line workers for daily consumer goods packaging. Training provided.',
    skillRequired: MOCK_SKILLS[10],
    location: { lat: 28.6039, lng: 77.199, address: 'Sector 58, Noida', city: 'Noida', state: 'Uttar Pradesh' },
    startDate: '2026-09-07',
    startTime: '07:00 AM',
    endTime: '04:00 PM',
    workersRequired: 25,
    workersHired: 10,
    minWage: 800,
    maxWage: 950,
    requirements: ['Good hand speed', 'No experience required'],
    status: 'HIRING',
    distanceKm: 5.0,
    createdAt: '2026-09-05T05:00:00Z',
    updatedAt: '2026-09-05T05:00:00Z',
  },
];

// ─── Service Requests (Customer-facing household bookings) ───────────────────

export const DEMO_SERVICE_REQUESTS: ServiceRequest[] = [
  {
    id: 'sr1',
    customerId: 'cust_1',
    customerName: 'Pradeep Nair',
    customerPhone: '+91 98110 44512',
    location: { lat: 28.625, lng: 77.215, address: '34 B, Sector 50', city: 'Noida', state: 'Uttar Pradesh', zone: 'Zone 6 - Noida' },
    serviceCategory: 'Plumbing',
    serviceTitle: 'Bathroom Tap Leakage',
    description: 'Kitchen tap is leaking heavily and water pressure is low.',
    urgency: 'high',
    aiClassification: {
      serviceType: 'Plumbing',
      suggestedSkills: ['Home Plumber', 'Plumber'],
      urgencyLevel: 'high',
      estimatedDurationHours: 1.5,
      requiredParts: ['Tap washer', 'PTFE tape'],
      confidence: 0.91,
      reasoning: 'Likely tap washer replacement or pressure regulator issue. Parts needed.',
    },
    status: 'WORKER_ASSIGNED',
    assignedWorkerId: 'w1',
    assignedWorker: MOCK_WORKERS[0],
    estimatedArrivalMins: 22,
    estimatedPrice: {
      basePrice: 350,
      complexityMultiplier: 1.2,
      durationEstimateHours: 1.5,
      materialsCost: 80,
      travelCost: 30,
      totalEstimate: 570,
      rangeMin: 450,
      rangeMax: 700,
      breakdown: {
        totalAmount: 570,
        workerEarning: 467,
        cooperativeContribution: 46,
        welfareContribution: 29,
        platformFee: 28,
        workerEarningPct: 82,
        cooperativePct: 8,
        welfarePct: 5,
        platformFeePct: 5,
      },
    },
    createdAt: '2026-09-05T20:00:00Z',
    updatedAt: '2026-09-05T20:12:00Z',
  },
  {
    id: 'sr2',
    customerId: 'cust_2',
    customerName: 'Anita Singh',
    customerPhone: '+91 99001 56789',
    location: { lat: 28.59, lng: 77.28, address: 'C-12 Vasant Kunj', city: 'New Delhi', state: 'Delhi', zone: 'Zone 2 - South Delhi' },
    serviceCategory: 'Cleaning',
    serviceTitle: 'Full Home Deep Cleaning',
    description: '3BHK apartment needs deep cleaning before Diwali. Kitchen, bathrooms, and all rooms.',
    urgency: 'medium',
    status: 'COMPLETED',
    assignedWorkerId: 'w2',
    assignedWorker: MOCK_WORKERS[1],
    finalAmount: 1800,
    createdAt: '2026-09-04T09:00:00Z',
    updatedAt: '2026-09-04T17:00:00Z',
  },
];

// ─── Demand Forecasting Data ──────────────────────────────────────────────────

export const DEMAND_FORECASTS: DemandForecast[] = [
  {
    id: 'df1',
    zone: 'Zone 6 - Noida',
    serviceCategory: 'Plumbing',
    forecastPeriod: 'tomorrow',
    predictedDemand: 28,
    currentWorkers: 12,
    historicalAverage: 21,
    changePercent: 31,
    trend: 'up',
    shortage: 6,
    recommendedAction: 'Deploy 6 additional plumbers. Request support from Gurugram cooperative (Zone 4 surplus of 8 plumbers).',
    confidence: 0.82,
    generatedAt: '2026-09-05T18:00:00Z',
  },
  {
    id: 'df2',
    zone: 'Zone 2 - South Delhi',
    serviceCategory: 'Electrical',
    forecastPeriod: 'tomorrow',
    predictedDemand: 19,
    currentWorkers: 14,
    historicalAverage: 16,
    changePercent: 19,
    trend: 'up',
    shortage: 3,
    recommendedAction: 'Deploy 3 additional home electricians from Zone 1 (2 available) and Zone 3 (1 available).',
    confidence: 0.75,
    generatedAt: '2026-09-05T18:00:00Z',
  },
  {
    id: 'df3',
    zone: 'Zone 8 - Ghaziabad',
    serviceCategory: 'Cleaning',
    forecastPeriod: 'this_week',
    predictedDemand: 94,
    currentWorkers: 38,
    historicalAverage: 68,
    changePercent: 38,
    trend: 'up',
    shortage: 14,
    recommendedAction: 'Pre-Diwali cleaning surge detected. Recruit 14 additional cleaning workers. Activate standby roster.',
    confidence: 0.89,
    generatedAt: '2026-09-05T18:00:00Z',
  },
  {
    id: 'df4',
    zone: 'Zone 3 - Gurugram North',
    serviceCategory: 'Appliance Repair',
    forecastPeriod: 'this_week',
    predictedDemand: 41,
    currentWorkers: 9,
    historicalAverage: 28,
    changePercent: 46,
    trend: 'up',
    shortage: 18,
    recommendedAction: 'Critical shortage: AC service season + monsoon appliance damage. Urgent: cross-cooperative deployment from Delhi coop. Skill training needed.',
    confidence: 0.71,
    generatedAt: '2026-09-05T18:00:00Z',
  },
  {
    id: 'df5',
    zone: 'Zone 4 - Gurugram South',
    serviceCategory: 'Caregiving',
    forecastPeriod: 'today',
    predictedDemand: 11,
    currentWorkers: 15,
    historicalAverage: 13,
    changePercent: -15,
    trend: 'down',
    shortage: -4,
    recommendedAction: 'Surplus of 4 caregivers. Consider temporary redeployment to Zone 2 (deficit of 3 caregivers).',
    confidence: 0.68,
    generatedAt: '2026-09-05T18:00:00Z',
  },
];

export const SKILL_GAP_ALERTS: SkillGapAlert[] = [
  {
    id: 'sga1',
    serviceCategory: 'Appliance Repair',
    zone: 'NCR-Wide',
    currentCertifiedWorkers: 9,
    requiredWorkers: 27,
    gap: 18,
    severity: 'critical',
    trainingRecommendation: 'Enroll 20 workers in HVAC & Appliance Repair course at ITI Noida (12 weeks). Priority: AC technician certification.',
    estimatedTrainingWeeks: 12,
  },
  {
    id: 'sga2',
    serviceCategory: 'Caregiving',
    zone: 'Zone 1 - Central Delhi',
    currentCertifiedWorkers: 4,
    requiredWorkers: 10,
    gap: 6,
    severity: 'high',
    trainingRecommendation: 'Enroll 8 workers in Home Health Aide Certificate (Delhi Skill Authority). Fast-track available (4 weeks).',
    estimatedTrainingWeeks: 4,
  },
  {
    id: 'sga3',
    serviceCategory: 'Electrical',
    zone: 'Zone 7 - Greater Noida',
    currentCertifiedWorkers: 3,
    requiredWorkers: 8,
    gap: 5,
    severity: 'medium',
    trainingRecommendation: 'Transfer 3 workers from Delhi cooperative + enroll 2 in Wireman License course.',
    estimatedTrainingWeeks: 8,
  },
];

export const TRAINING_RECOMMENDATIONS: TrainingRecommendation[] = [
  {
    id: 'tr1',
    skillCategory: 'Appliance Repair',
    courseName: 'HVAC & Air Conditioning Technician',
    provider: 'ITI Noida',
    durationWeeks: 12,
    targetWorkers: 20,
    urgency: 'high',
    reason: 'Critical shortage: 18 workers needed, only 9 certified. AC demand +46% this week.',
    estimatedCost: 3500,
  },
  {
    id: 'tr2',
    skillCategory: 'Caregiving',
    courseName: 'Home Health Aide Certificate',
    provider: 'Delhi Skill Authority',
    durationWeeks: 4,
    targetWorkers: 8,
    urgency: 'high',
    reason: 'Ageing population driving caregiving demand. 6-worker gap in Zone 1.',
    estimatedCost: 2000,
  },
  {
    id: 'tr3',
    skillCategory: 'Plumbing',
    courseName: 'Advanced Plumbing & Pipe Fitting',
    provider: 'NSDC Partner Center',
    durationWeeks: 6,
    targetWorkers: 10,
    urgency: 'medium',
    reason: 'Monsoon season plumbing surge expected. 6-worker shortage in Zone 6.',
    estimatedCost: 2500,
  },
];

// ─── Applications (preserved) ─────────────────────────────────────────────────

export const SEED_EMPLOYER_APPLICATIONS: JobApplication[] = [
  {
    id: 'a1',
    jobId: 'j1',
    job: MOCK_JOBS[0],
    workerId: 'w2',
    worker: MOCK_WORKERS[1],
    proposedWage: 900,
    status: 'APPLIED',
    paymentStatus: 'PENDING',
    negotiations: [],
    appliedAt: '2026-09-05T10:00:00Z',
    updatedAt: '2026-09-05T10:00:00Z',
  },
  {
    id: 'a2',
    jobId: 'j1',
    job: MOCK_JOBS[0],
    workerId: 'w3',
    worker: MOCK_WORKERS[2],
    proposedWage: 1000,
    status: 'UNDER_REVIEW',
    paymentStatus: 'PENDING',
    negotiations: [],
    appliedAt: '2026-09-05T07:30:00Z',
    updatedAt: '2026-09-05T09:00:00Z',
  },
];

export const SEED_WORKER_APPLICATIONS: JobApplication[] = [
  {
    id: 'wa1',
    jobId: 'j3',
    job: MOCK_JOBS[2],
    workerId: 'w1',
    worker: MOCK_WORKERS[0],
    proposedWage: 1100,
    status: 'ACCEPTED',
    paymentStatus: 'PENDING',
    negotiations: [],
    appliedAt: '2026-09-04T10:30:00Z',
    updatedAt: '2026-09-05T08:00:00Z',
  },
];

// ─── Cooperative Dashboard Stats (computed from mock data) ────────────────────

export interface CooperativeDashboardStats {
  totalWorkers: number;
  verifiedWorkers: number;
  activeToday: number;
  jobsThisWeek: number;
  earningsThisWeek: number;
  avgRating: number;
  welfareEnrolled: number;
  insuredWorkers: number;
  openDisputes: number;
  emergencyJobsToday: number;
  utilizationRate: number; // percentage
  skillGapCount: number;
}

export const COOP_DASHBOARD_STATS: CooperativeDashboardStats = {
  totalWorkers: 142,
  verifiedWorkers: 131,
  activeToday: 89,
  jobsThisWeek: 247,
  earningsThisWeek: 412000,
  avgRating: 4.71,
  welfareEnrolled: 128,
  insuredWorkers: 119,
  openDisputes: 3,
  emergencyJobsToday: 7,
  utilizationRate: 63,
  skillGapCount: 3,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatWage(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m away`;
  return `${km.toFixed(1)} km away`;
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    APPLIED: '#C96F4A',
    UNDER_REVIEW: '#B8860B',
    NEGOTIATING: '#A94F32',
    ACCEPTED: '#3D7A5B',
    CONFIRMED: '#3D7A5B',
    CHECKED_IN: '#6F7358',
    IN_PROGRESS: '#C96F4A',
    COMPLETED: '#3D7A5B',
    PAID: '#3D7A5B',
    REJECTED: '#C0392B',
    WITHDRAWN: '#8C7D6E',
    EXPIRED: '#8C7D6E',
    HIRING: '#C96F4A',
    FULL: '#3D7A5B',
    ACTIVE: '#C96F4A',
    PUBLISHED: '#1E1C1A',
    CANCELLED: '#C0392B',
    REQUESTED: '#C96F4A',
    WORKER_ASSIGNED: '#3D7A5B',
    WORKER_EN_ROUTE: '#6F7358',
    PAYMENT_PENDING: '#B8860B',
  };
  return map[status] ?? '#8C7D6E';
}

export function getStatusLabel(status: string, lang?: LanguageCode): string {
  const activeLang = lang || getActiveLanguage();
  return getLocalizedStatus(status, activeLang);
}

export function getTrustColor(score: number): string {
  if (score >= 85) return '#3D7A5B';
  if (score >= 70) return '#6F7358';
  if (score >= 50) return '#B8860B';
  return '#C0392B';
}

export function getUrgencyColor(urgency: string): string {
  const map: Record<string, string> = {
    emergency: '#C0392B',
    high: '#C96F4A',
    medium: '#B8860B',
    low: '#3D7A5B',
  };
  return map[urgency] ?? '#8C7D6E';
}

export function formatPaymentBreakdown(totalAmount: number) {
  return {
    totalAmount,
    workerEarning: Math.round(totalAmount * 0.82),
    cooperativeContribution: Math.round(totalAmount * 0.08),
    welfareContribution: Math.round(totalAmount * 0.05),
    platformFee: Math.round(totalAmount * 0.05),
    workerEarningPct: 82,
    cooperativePct: 8,
    welfarePct: 5,
    platformFeePct: 5,
  };
}

export const MOCK_WORKER_WELFARES: Record<string, WorkerWelfare> = {
  w1: WELFARE_W1,
  w2: WELFARE_W2,
};

export const MOCK_DISPUTES: Dispute[] = [
  {
    id: 'disp_1',
    serviceRequestId: 'sr1',
    raisedBy: 'customer',
    raisedByUserId: 'cust_1',
    againstUserId: 'w1',
    type: 'work_quality',
    description: 'Minor tap drip persisted after repair. Requested technician to revisit and check washer seal.',
    status: 'under_review',
    cooperativeAdminNote: 'Contacted worker Ravi Kumar. Scheduled follow-up visit tomorrow at 11:00 AM free of charge.',
    createdAt: '2026-09-05T21:00:00Z',
    updatedAt: '2026-09-05T21:30:00Z',
  },
  {
    id: 'disp_2',
    jobApplicationId: 'a1',
    raisedBy: 'worker',
    raisedByUserId: 'w2',
    againstUserId: 'e1',
    type: 'payment_not_received',
    description: 'Overtime allowance for extra 2 hours loading shift not reflected in settlement statement.',
    status: 'resolution_proposed',
    resolution: 'Employer approved ₹350 overtime adjustment. Escrow release scheduled.',
    cooperativeAdminNote: 'Mediated by Delhi Cooperative Officer Rakesh Prasad. Wage sheet verified.',
    createdAt: '2026-09-04T18:00:00Z',
    updatedAt: '2026-09-05T14:00:00Z',
  },
];
