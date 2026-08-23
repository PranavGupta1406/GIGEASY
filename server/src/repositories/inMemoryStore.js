// In-Memory Data Store for GigEasy Backend (Fallback & Standalone Mode)

const inMemoryStore = {
  service_categories: [
    { category_id: 1, name: 'Construction & Infrastructure', description: 'Masons, Carpenters, Painters, Electricians' },
    { category_id: 2, name: 'Factory & Industrial Workers', description: 'Assembly workers, Machine operators' },
    { category_id: 3, name: 'Transportation & Delivery', description: 'Drivers, Loaders, Delivery personnel' },
    { category_id: 4, name: 'Retail & Logistics', description: 'Warehouse staff, Store helpers' },
    { category_id: 5, name: 'Event & Hospitality', description: 'Waiters, Event setup, Cleaners' }
  ],

  services: [
    { service_id: 1, category_id: 1, name: 'Electrician', base_price: 700, category_name: 'Construction & Infrastructure' },
    { service_id: 2, category_id: 1, name: 'Plumber', base_price: 650, category_name: 'Construction & Infrastructure' },
    { service_id: 3, category_id: 1, name: 'Mason', base_price: 800, category_name: 'Construction & Infrastructure' },
    { service_id: 4, category_id: 2, name: 'Assembly Worker', base_price: 500, category_name: 'Factory & Industrial Workers' },
    { service_id: 5, category_id: 3, name: 'Delivery Driver', base_price: 900, category_name: 'Transportation & Delivery' },
    { service_id: 6, category_id: 5, name: 'Event Setup', base_price: 600, category_name: 'Event & Hospitality' },
    { service_id: 7, category_id: 4, name: 'Warehouse Helper', base_price: 550, category_name: 'Retail & Logistics' }
  ],

  carts: [
    { cart_id: 1, employer_id: 1, created_at: new Date() }
  ],

  cart_items: [],

  orders: [],

  order_items: [],

  skills: [
    { skill_id: 1, skill_name: 'Electrician' },
    { skill_id: 2, skill_name: 'Carpenter' },
    { skill_id: 3, skill_name: 'Plumber' },
    { skill_id: 4, skill_name: 'Painter' },
    { skill_id: 5, skill_name: 'Welder' },
    { skill_id: 6, skill_name: 'Mason' },
    { skill_id: 7, skill_name: 'Helper' },
    { skill_id: 8, skill_name: 'Driver' }
  ],

  users: [
    { user_id: 1, firebase_uid: 'uid_worker_1', role: 'worker', phone: '+919876543210', email: 'ramesh.kumar@example.com', created_at: new Date() },
    { user_id: 2, firebase_uid: 'uid_worker_2', role: 'worker', phone: '+919876543211', email: 'suresh.verma@example.com', created_at: new Date() },
    { user_id: 3, firebase_uid: 'uid_worker_3', role: 'worker', phone: '+919876543212', email: 'amit.sharma@example.com', created_at: new Date() },
    { user_id: 4, firebase_uid: 'uid_employer_1', role: 'employer', phone: '+919876543220', email: 'hire@apexbuilders.com', created_at: new Date() },
    { user_id: 5, firebase_uid: 'uid_employer_2', role: 'employer', phone: '+919876543221', email: 'contact@delhirenovations.com', created_at: new Date() }
  ],

  workers: [
    {
      worker_id: 1,
      user_id: 1,
      full_name: 'Ramesh Kumar',
      aadhaar_number: 'XXXXXXXX1234',
      location: 'Connaught Place, New Delhi',
      latitude: 28.6315,
      longitude: 77.2167,
      experience_years: 5.5,
      availability: 'AVAILABLE',
      profile_photo: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a',
      verified: true,
      skills: ['Electrician', 'Helper'],
      average_rating: 4.9,
      completed_jobs_count: 24,
      phone: '+919876543210',
      email: 'ramesh.kumar@example.com'
    },
    {
      worker_id: 2,
      user_id: 2,
      full_name: 'Suresh Verma',
      aadhaar_number: 'XXXXXXXX5678',
      location: 'Noida Sector 62, Uttar Pradesh',
      latitude: 28.6280,
      longitude: 77.3649,
      experience_years: 3.0,
      availability: 'AVAILABLE',
      profile_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
      verified: true,
      skills: ['Plumber', 'Painter'],
      average_rating: 4.8,
      completed_jobs_count: 18,
      phone: '+919876543211',
      email: 'suresh.verma@example.com'
    },
    {
      worker_id: 3,
      user_id: 3,
      full_name: 'Amit Sharma',
      aadhaar_number: 'XXXXXXXX9012',
      location: 'DLF CyberCity, Gurugram',
      latitude: 28.4950,
      longitude: 77.0895,
      experience_years: 7.0,
      availability: 'AVAILABLE',
      profile_photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      verified: false,
      skills: ['Carpenter', 'Mason'],
      average_rating: 4.7,
      completed_jobs_count: 31,
      phone: '+919876543212',
      email: 'amit.sharma@example.com'
    }
  ],

  employers: [
    {
      employer_id: 1,
      user_id: 4,
      company_name: 'Apex Builders Pvt Ltd',
      company_type: 'Construction',
      address: 'Plot 45, Okhla Phase 3, New Delhi',
      verified: true,
      total_jobs_posted: 12,
      total_completed_jobs: 9,
      total_spending: 45000,
      phone: '+919876543220',
      email: 'hire@apexbuilders.com'
    },
    {
      employer_id: 2,
      user_id: 5,
      company_name: 'Delhi Home Renovations',
      company_type: 'Services',
      address: 'Shop 12, South Extension, New Delhi',
      verified: true,
      total_jobs_posted: 8,
      total_completed_jobs: 6,
      total_spending: 22000,
      phone: '+919876543221',
      email: 'contact@delhirenovations.com'
    }
  ],

  worker_skills: [
    { worker_id: 1, skill_id: 1 },
    { worker_id: 1, skill_id: 7 },
    { worker_id: 2, skill_id: 3 },
    { worker_id: 2, skill_id: 4 },
    { worker_id: 3, skill_id: 2 },
    { worker_id: 3, skill_id: 6 }
  ],

  jobs: [
    {
      job_id: 1,
      employer_id: 1,
      title: 'Commercial Wiring & Setup',
      description: 'Urgent need for certified electrician for commercial building panel wiring.',
      skill_required: 'Electrician',
      wage: 1200.00,
      job_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      start_time: '09:00:00',
      end_time: '18:00:00',
      location: 'Okhla Phase 3, New Delhi',
      latitude: 28.5355,
      longitude: 77.2631,
      workers_required: 2,
      status: 'OPEN',
      company_name: 'Apex Builders Pvt Ltd',
      company_type: 'Construction',
      applications_count: 1,
      workers_hired: 1,
      created_at: new Date()
    },
    {
      job_id: 2,
      employer_id: 2,
      title: 'Bathroom Plumbing Repair',
      description: 'Fix leaky pipes and install new taps in residential flat.',
      skill_required: 'Plumber',
      wage: 900.00,
      job_date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
      start_time: '10:00:00',
      end_time: '16:00:00',
      location: 'South Extension, New Delhi',
      latitude: 28.5684,
      longitude: 77.2207,
      workers_required: 1,
      status: 'OPEN',
      company_name: 'Delhi Home Renovations',
      company_type: 'Services',
      applications_count: 1,
      workers_hired: 0,
      created_at: new Date()
    },
    {
      job_id: 3,
      employer_id: 1,
      title: 'Wall Painting & Touchup',
      description: 'Interior painting for 2 BHK apartment.',
      skill_required: 'Painter',
      wage: 1000.00,
      job_date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
      start_time: '09:00:00',
      end_time: '17:00:00',
      location: 'Noida Sector 18',
      latitude: 28.5708,
      longitude: 77.3261,
      workers_required: 3,
      status: 'OPEN',
      company_name: 'Apex Builders Pvt Ltd',
      company_type: 'Construction',
      applications_count: 0,
      workers_hired: 0,
      created_at: new Date()
    }
  ],

  job_applications: [
    {
      application_id: 1,
      job_id: 1,
      worker_id: 1,
      application_status: 'ACCEPTED',
      applied_at: new Date(),
      job_title: 'Commercial Wiring & Setup',
      wage: 1200.00,
      job_location: 'Okhla Phase 3, New Delhi',
      worker_name: 'Ramesh Kumar',
      worker_location: 'Connaught Place, New Delhi',
      worker_verified: true,
      worker_rating: 4.9
    },
    {
      application_id: 2,
      job_id: 2,
      worker_id: 2,
      application_status: 'PENDING',
      applied_at: new Date(),
      job_title: 'Bathroom Plumbing Repair',
      wage: 900.00,
      job_location: 'South Extension, New Delhi',
      worker_name: 'Suresh Verma',
      worker_location: 'Noida Sector 62, Uttar Pradesh',
      worker_verified: true,
      worker_rating: 4.8
    }
  ],

  bookings: [
    {
      booking_id: 1,
      job_id: 1,
      worker_id: 1,
      employer_id: 1,
      booking_status: 'CONFIRMED',
      created_at: new Date(),
      job_title: 'Commercial Wiring & Setup',
      job_description: 'Urgent need for certified electrician for commercial building panel wiring.',
      wage: 1200.00,
      job_location: 'Okhla Phase 3, New Delhi',
      job_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      start_time: '09:00:00',
      end_time: '18:00:00',
      worker_name: 'Ramesh Kumar',
      worker_photo: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a',
      worker_location: 'Connaught Place, New Delhi',
      company_name: 'Apex Builders Pvt Ltd',
      company_type: 'Construction',
      company_address: 'Plot 45, Okhla Phase 3, New Delhi'
    }
  ],

  earnings: [
    {
      earning_id: 1,
      worker_id: 1,
      job_id: 1,
      amount: 1200.00,
      payment_status: 'PAID',
      payment_date: new Date(),
      job_title: 'Commercial Wiring & Setup',
      job_location: 'Okhla Phase 3, New Delhi',
      company_name: 'Apex Builders Pvt Ltd'
    }
  ],

  ratings: [
    {
      rating_id: 1,
      job_id: 1,
      worker_id: 1,
      employer_id: 1,
      rating: 5,
      review: 'Excellent electrical work done on time!',
      created_at: new Date(),
      company_name: 'Apex Builders Pvt Ltd',
      job_title: 'Commercial Wiring & Setup'
    }
  ],

  kyc_verification: [
    { kyc_id: 1, user_id: 1, aadhaar_verified: true, face_verified: true, digilocker_verified: true, verified_at: new Date() },
    { kyc_id: 2, user_id: 2, aadhaar_verified: true, face_verified: true, digilocker_verified: false, verified_at: new Date() },
    { kyc_id: 3, user_id: 3, aadhaar_verified: false, face_verified: false, digilocker_verified: false, verified_at: null },
    { kyc_id: 4, user_id: 4, aadhaar_verified: true, face_verified: true, digilocker_verified: true, verified_at: new Date() },
    { kyc_id: 5, user_id: 5, aadhaar_verified: true, face_verified: true, digilocker_verified: true, verified_at: new Date() }
  ]
};

module.exports = inMemoryStore;
