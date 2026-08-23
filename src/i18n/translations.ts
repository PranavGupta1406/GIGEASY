// GigEasy Multilingual Dictionary (English & Hindi)
// Simple, authentic everyday Hindi for Indian daily wage workers & local employers

export type LanguageCode = 'en' | 'hi';

export const TRANSLATIONS = {
  en: {
    // Brand & Header
    brandTagline: 'Work is around you.',
    trustedTagline: 'Connecting workers and employers across India',
    languageToggle: 'हिंदी',

    // Role Actions
    findWork: 'Find Work Near Me',
    hireWorkers: 'Hire Workers Near Me',
    findWorkSub: 'Jobs & daily wages near you',
    hireWorkersSub: 'Post jobs & hire verified workers',
    needWorkQuestion: 'Looking for work or hiring workers?',

    // Navigation Tabs
    tabHome: 'Home',
    tabDiscover: 'Discover',
    tabActivity: 'Activity',
    tabProfile: 'Profile',
    tabJobs: 'Jobs',
    tabWorkers: 'Workers',
    tabEarnings: 'Earnings',

    // Job Card & Details
    dailyWage: 'Daily Wage',
    perDay: '/ day',
    applyNow: 'Apply Now',
    applied: 'Applied',
    viewJob: 'View Job',
    availableToday: 'available today',
    gigsNearYou: 'Gigs Near You',
    allCategories: 'All',
    today: 'Today',
    distance: 'km away',

    // Auth
    enterMobile: "What's your mobile number?",
    otpSubtitle: "We'll send a 4-digit verification code.",
    getCode: 'Get Verification Code',
    verifyOtp: 'Enter 4-digit code',
    verifyAndContinue: 'Verify & Continue',
    autoFillDemo: 'Auto-fill test code (1234)',
    resendIn: 'Resend code in',
    resend: 'Resend code',

    // Onboarding
    workerNameTitle: 'What is your full name?',
    workerNameSub: 'Employers will see this name when you apply.',
    workerSkillsTitle: 'What work do you do?',
    workerSkillsSub: 'Select all skills that match your experience.',
    workerWageTitle: 'Expected daily wage?',
    workerWageSub: 'This helps us show relevant jobs in your area.',
    employerNameTitle: 'Tell us about your business',
    employerNameSub: 'Set up your profile to post jobs and hire workers.',
    continueBtn: 'Continue',
    completeOnboarding: 'Complete & Get Started',

    // Employer Specific
    postJobTitle: 'Post a New Job',
    postJobCTA: 'Post a Job',
    postJobSub: 'Connect with workers in your area',
    activeJobs: 'Active Jobs',
    recentApplicants: 'Recent Applicants',
    hired: 'Hired',
    workersNeeded: 'Needed',
    hireWorker: 'Hire Worker',
    counterOffer: 'Counter Offer',
    sendOffer: 'Send Direct Offer',

    // Payments & Earnings
    payWorker: 'Pay Worker',
    paymentSuccess: 'Payment Successful',
    amountToPay: 'Amount to Pay',
    totalEarned: 'Total Earned',
    payoutHistory: 'Payout History',
    paymentPending: 'Payment Pending',
    paymentPaid: 'Paid',
    paymentInEscrow: 'In Escrow',
    escrowProtected: 'Protected by GigEasy Escrow',
    upiPayment: 'UPI / QR Payment',
    payNow: 'Pay Now',
    withdrawEarnings: 'Instant Payout to UPI',

    // Status
    statusActive: 'Active',
    statusCompleted: 'Completed',
    statusCheckedIn: 'Checked In',
    checkInGps: 'GPS Check In',
    verifiedBadge: 'Verified',
  },
  hi: {
    // Brand & Header
    brandTagline: 'काम आपके आस-पास है।',
    trustedTagline: 'भारत भर के कामगारों और मालिकों को जोड़ने वाला मंच',
    languageToggle: 'English',

    // Role Actions
    findWork: 'आस-पास काम खोजें',
    hireWorkers: 'कर्मचारी / कामगार खोजें',
    findWorkSub: 'अपने नज़दीक दिहाड़ी और काम देखें',
    hireWorkersSub: 'काम पोस्ट करें और वर्कर रखें',
    needWorkQuestion: 'काम चाहिए या काम के लिए लोग चाहिए?',

    // Navigation Tabs
    tabHome: 'होम',
    tabDiscover: 'काम खोजें',
    tabActivity: 'गतिविधि',
    tabProfile: 'प्रोफ़ाइल',
    tabJobs: 'नौकरियां',
    tabWorkers: 'कामगार',
    tabEarnings: 'कमाई',

    // Job Card & Details
    dailyWage: 'दैनिक दिहाड़ी',
    perDay: '/ दिन',
    applyNow: 'आवेदन करें',
    applied: 'आवेदन किया गया',
    viewJob: 'काम देखें',
    availableToday: 'आज उपलब्ध काम',
    gigsNearYou: 'आपके नज़दीक काम',
    allCategories: 'सभी',
    today: 'आज',
    distance: 'किमी दूर',

    // Auth
    enterMobile: 'अपना मोबाइल नंबर दर्ज करें',
    otpSubtitle: 'हम 4-अंकों का वेरिफिकेशन कोड भेजेंगे।',
    getCode: 'ओटीपी प्राप्त करें',
    verifyOtp: '4-अंकों का कोड दर्ज करें',
    verifyAndContinue: 'सत्यापित करें और आगे बढ़ें',
    autoFillDemo: 'टेस्ट कोड भरें (1234)',
    resendIn: 'ओटीपी पुनः भेजें',
    resend: 'पुनः कोड भेजें',

    // Onboarding
    workerNameTitle: 'आपका पूरा नाम क्या है?',
    workerNameSub: 'आवेदन करते समय मालिक आपका यही नाम देखेंगे।',
    workerSkillsTitle: 'आप क्या काम करते हैं?',
    workerSkillsSub: 'अपने अनुभव के अनुसार काम चुनें।',
    workerWageTitle: 'आपकी रोज़ की दिहाड़ी कितनी है?',
    workerWageSub: 'इससे हम आपको सही काम दिखा सकेंगे।',
    employerNameTitle: 'अपने व्यवसाय की जानकारी दें',
    employerNameSub: 'काम पोस्ट करने और वर्कर रखने के लिए सेटअप करें।',
    continueBtn: 'आगे बढ़ें',
    completeOnboarding: 'पूरा करें और शुरू करें',

    // Employer Specific
    postJobTitle: 'नया काम पोस्ट करें',
    postJobCTA: 'काम पोस्ट करें',
    postJobSub: 'अपने क्षेत्र के कामगारों से तुरंत जुड़ें',
    activeJobs: 'सक्रिय काम',
    recentApplicants: 'हाल के आवेदन',
    hired: 'रखे गए',
    workersNeeded: 'आवश्यकता',
    hireWorker: 'वर्कर रखें',
    counterOffer: 'दाम तय करें',
    sendOffer: 'सीधा ऑफर भेजें',

    // Payments & Earnings
    payWorker: 'मजदूरी भुगतान करें',
    paymentSuccess: 'भुगतान सफल रहा',
    amountToPay: 'भुगतान राशि',
    totalEarned: 'कुल कमाई',
    payoutHistory: 'कमाई का इतिहास',
    paymentPending: 'भुगतान बाकी',
    paymentPaid: 'भुगतान हो गया',
    paymentInEscrow: 'एस्क्रो में सुरक्षित',
    escrowProtected: 'गिगईज़ी एस्क्रो द्वारा सुरक्षित',
    upiPayment: 'यूपीआई / क्यूआर भुगतान',
    payNow: 'अभी भुगतान करें',
    withdrawEarnings: 'तुरंत बैंक / UPI में ट्रांसफर',

    // Status
    statusActive: 'सक्रिय',
    statusCompleted: 'पूरा हुआ',
    statusCheckedIn: 'हाजिरी लग गई',
    checkInGps: 'जीपीएस हाजिरी लगाएं',
    verifiedBadge: 'सत्यापित',
  },
};

export type TranslationKey = keyof typeof TRANSLATIONS.en;
