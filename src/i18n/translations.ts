// GigEasy Multilingual Dictionary (English & Simple Everyday Hindi)
// Tailored specifically for daily-wage workers & local employers
// Clear, human, non-bureaucratic terms

export type LanguageCode = 'en' | 'hi';

export const TRANSLATIONS = {
  en: {
    // Brand & Header
    brandTagline: 'Work is around you.',
    trustedTagline: 'Connecting workers and employers across India',
    languageToggle: 'हिंदी',
    languageName: 'English',

    // Greetings
    goodMorning: 'Good morning',
    goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
    hello: 'Hello',

    // Role Actions
    findWork: 'Find Work',
    hireWorkers: 'Hire Workers',
    findWorkSub: 'Jobs & daily wages near you',
    hireWorkersSub: 'Post jobs & hire verified workers',
    needWorkQuestion: 'Looking for work or hiring workers?',

    // Navigation Tabs & Headers
    tabHome: 'Home',
    tabDiscover: 'Find Work',
    tabPassport: 'Worker ID',
    tabCooperative: 'Cooperative',
    tabActivity: 'Work History',
    tabProfile: 'My Profile',
    tabJobs: 'Jobs',
    tabWorkers: 'Workers',
    tabEarnings: 'Earnings',
    tabMore: 'Settings',
    myWorkerId: 'My Worker ID',

    // Job Card & Search
    dailyWage: 'Daily Wage',
    perDay: '/ day',
    applyNow: 'Apply for Gig',
    applied: 'Applied',
    viewJob: 'View Gig',
    availableToday: 'available today',
    gigsNearYou: 'Gigs Near You',
    allCategories: 'All',
    today: 'Today',
    distance: 'km away',
    distanceLabel: 'Distance',
    location: 'Location',
    searchPlaceholder: 'Search jobs, trade, location...',
    filterGigs: 'Filter Gigs',
    clearFilters: 'Clear filters',
    resetAll: 'Reset All',
    noGigsFound: 'No gigs found',
    adjustSearchTerms: 'Try adjusting your search or filters',
    loadingGigs: 'Finding gigs near you...',
    gigNearYouCount: 'gig near you',
    gigsNearYouCount: 'gigs near you',
    anyWage: 'Any Wage',

    // Categories
    catConstruction: 'Construction',
    catWarehouse: 'Warehouse',
    catElectrical: 'Electrical',
    catPlumbing: 'Plumbing',
    catDelivery: 'Delivery',
    catHousehold: 'Household',
    catFactory: 'Factory',
    catEvents: 'Events',
    catSecurity: 'Security',
    catGeneral: 'General Gig',

    // Best Opportunity & Gig Radar
    bestOpportunity: 'Best Opportunity',
    matchForYou: 'Match for you',
    matchScoreReason: 'Why this job matches you:',
    radarTitle: 'Gig Radar',
    newGigForYou: 'New gig for you',
    fillingFast: 'Filling fast',
    spotLeft1: '1 spot left',
    spotsLeft: 'spots left',
    reasonSkillMatch: 'Matches your verified skill',
    reasonDistance: 'Within your preferred travel distance',
    reasonAvailability: 'Matches your available working hours',
    reasonWage: 'Matches your expected daily wage',
    reasonTrust: 'High priority match for your profile',

    // Direct Job Offers & Counter Offers
    directOfferTitle: 'You have received a job offer',
    employerSentOffer: 'Employer sent you a job offer',
    employerProposedNewWage: 'Employer proposed a new wage',
    acceptOffer: 'Accept Offer',
    negotiateWage: 'Negotiate Wage',
    declineOffer: 'Decline Offer',
    sendCounterOffer: 'Send Job Offer',
    enterYourWage: 'Enter your proposed daily wage',
    counterOfferSent: 'Counter offer sent · Waiting for employer response',
    employerOffered: 'Employer offered',

    // Clear Action Verbs for Buttons (Both Languages)
    btnApply: 'Apply for Gig',
    btnAccept: 'Accept Job',
    btnReject: 'Decline Job',
    btnViewDetails: 'View Gig Details',
    btnStartWork: 'Start Work',
    btnCompleteWork: 'Complete Work',
    btnCheckInGps: 'GPS Check In',
    btnCancelJob: 'Cancel Gig',
    btnReportProblem: 'Report Problem',
    btnContactEmployer: 'Contact Employer',
    btnPayWorker: 'Pay Worker',
    btnViewPayment: 'View Payment',
    btnViewLocation: 'View Location',
    btnViewRoute: 'View Route',
    btnOpenInMaps: 'Open in Google Maps',
    btnSignOut: 'Sign Out',
    btnHelpDesk: 'Worker Helpline',
    btnConfirm: 'Confirm',
    btnCancel: 'Cancel',
    btnSave: 'Save',
    btnBack: 'Back',

    // Availability
    availabilityTitle: 'When can you work?',
    availableForWork: 'Available for work',
    unavailable: 'Currently unavailable',
    availableNow: 'Available Now',
    scheduledMode: 'Scheduled',
    offDuty: 'Off Duty',

    // Worker ID & Profile
    workerIdTitle: 'My Worker ID',
    workerName: 'Name',
    workerSkill: 'Skills',
    workExperience: 'Experience',
    completedGigs: 'Jobs Completed',
    rating: 'Rating',
    trustScore: 'Trust Score',
    verificationCompleted: 'Verification Completed',
    identityVerified: 'Identity Verified',
    cooperativeMember: 'Cooperative Verified',
    skillVerified: 'Skill Verified',
    insuranceActive: 'Insurance Active',
    editProfile: 'Edit Profile',
    yearsExperience: 'years exp',
    memberSince: 'Member since',

    // Dynamic Backend Statuses
    status_APPLIED: 'Applied',
    status_UNDER_REVIEW: 'Under review',
    status_ACCEPTED: 'Application accepted',
    status_CONFIRMED: 'Confirmed',
    status_CHECKED_IN: 'Checked in',
    status_IN_PROGRESS: 'Work in progress',
    status_COMPLETED: 'Completed',
    status_PAYMENT_PENDING: 'Payment pending',
    status_PAID: 'Payment received',
    status_REJECTED: 'Application not accepted',
    status_WITHDRAWN: 'Withdrawn',
    status_EXPIRED: 'Expired',
    status_NEGOTIATING: 'Negotiating wage',
    status_CANCELLED: 'Cancelled',
    status_ACTIVE: 'Active Shift',
    status_PUBLISHED: 'Open',

    // Notifications
    notif_gig_alert_title: 'New gig for you',
    notif_direct_offer_title: 'Employer sent you a job offer',
    notif_app_accepted_title: 'Your application is accepted',
    notif_payment_title: 'Payment received',
    notif_app_rejected_title: 'Application not accepted',
    notif_check_in_title: 'Checked in for shift',
    notif_completed_title: 'Work completed',
    notif_counter_title: 'New wage offer from employer',
    notifView: 'View',
    notifDismiss: 'Dismiss',
    notifEmpty: 'No notifications right now',
    notificationsTitle: 'Notifications',

    // Payments & Money
    paymentTitle: 'Payment',
    paymentPending: 'Payment pending',
    paymentReceived: 'Payment received',
    paymentSuccess: 'Payment Successful',
    amountToPay: 'Amount to Pay',
    totalEarned: 'Total Earned',
    payoutHistory: 'Payout History',
    escrowProtected: 'Protected by GigEasy Escrow',
    upiPayment: 'UPI / QR Payment',
    payNow: 'Pay Now',
    withdrawEarnings: 'Instant Payout to UPI',
    creditedToAccount: 'credited to your account',

    // Two-Sided Rating & Disputes
    rateExperience: 'Rate Experience',
    punctuality: 'Punctuality',
    workQuality: 'Work Quality',
    behavior: 'Behavior',
    paymentPromptness: 'Payment Promptness',
    submitRating: 'Submit Rating',
    reportIssueTitle: 'Report Problem',
    issueType: 'Select Problem Type',
    issueDescription: 'Describe the issue clearly',
    submitGrievance: 'Report Problem',

    // Auth & Onboarding
    enterMobile: "What's your mobile number?",
    otpSubtitle: "We'll send a 4-digit verification code.",
    getCode: 'Get Verification Code',
    verifyOtp: 'Enter 4-digit code',
    verifyAndContinue: 'Verify & Continue',
    autoFillDemo: 'Auto-fill test code (1234)',
    resendIn: 'Resend code in',
    resend: 'Resend code',
    workerNameTitle: 'What is your full name?',
    workerNameSub: 'Employers will see this name when you apply.',
    workerSkillsTitle: 'What work do you do?',
    workerSkillsSub: 'Select all skills that match your experience.',
    workerWageTitle: 'Expected daily wage?',
    workerWageSub: 'This helps us show relevant jobs in your area.',
    employerNameTitle: 'Tell us about your business',
    employerNameSub: 'Set up your profile to post jobs and hire workers.',
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

    // Simple Errors & Validation
    errorNetwork: "We couldn't connect to the internet. Please try again.",
    errorPayment: "We couldn't complete the payment. Please try again.",
    errorGeneric: 'Something went wrong. Please try again.',
    errorInvalidPhone: 'Please enter a valid 10-digit mobile number.',
    errorInvalidAmount: 'Please enter a valid amount.',
    errorRequiredField: 'This field is required.',
    labelJobLocation: 'Job Location',
    placeholderJobLocation: 'Enter location',
    labelWorkersNeeded: 'Workers needed',
    placeholderWorkersNeeded: 'Enter number of workers',
    labelWage: 'Daily Wage',
    placeholderWage: 'Enter daily wage',
  },
  hi: {
    // Brand & Header
    brandTagline: 'काम आपके आस-पास है।',
    trustedTagline: 'भारत भर के कामगारों और मालिकों को जोड़ने वाला मंच',
    languageToggle: 'English',
    languageName: 'हिन्दी',

    // Greetings
    goodMorning: 'शुभ प्रभात',
    goodAfternoon: 'नमस्ते',
    goodEvening: 'शुभ संध्या',
    hello: 'नमस्ते',

    // Role Actions
    findWork: 'काम खोजें',
    hireWorkers: 'काम के लिए लोग चाहिए',
    findWorkSub: 'अपने नज़दीक दिहाड़ी और काम देखें',
    hireWorkersSub: 'काम पोस्ट करें और काम करने वाले लोग रखें',
    needWorkQuestion: 'काम चाहिए या काम के लिए लोग चाहिए?',

    // Navigation Tabs & Headers
    tabHome: 'होम',
    tabDiscover: 'काम खोजें',
    tabPassport: 'मेरा Worker ID',
    tabCooperative: 'सहकारी',
    tabActivity: 'किए गए काम',
    tabProfile: 'मेरी प्रोफ़ाइल',
    tabJobs: 'नौकरियां',
    tabWorkers: 'काम करने वाले',
    tabEarnings: 'कमाई',
    tabMore: 'सेटिंग',
    myWorkerId: 'मेरा Worker ID',

    // Job Card & Search
    dailyWage: 'दिहाड़ी',
    perDay: '/ दिन',
    applyNow: 'काम के लिए आवेदन करें',
    applied: 'आवेदन किया गया',
    viewJob: 'काम देखें',
    availableToday: 'आज उपलब्ध काम',
    gigsNearYou: 'मेरे पास के काम',
    allCategories: 'सभी',
    today: 'आज',
    distance: 'किमी दूर',
    distanceLabel: 'दूरी',
    location: 'जगह',
    searchPlaceholder: 'काम, हुनर या जगह खोजें...',
    filterGigs: 'काम छांटें',
    clearFilters: 'फ़िल्टर हटाएं',
    resetAll: 'सब हटाएं',
    noGigsFound: 'कोई काम नहीं मिला',
    adjustSearchTerms: 'फ़िल्टर या खोज बदलकर दोबारा देखें',
    loadingGigs: 'आपके पास काम ढूंढा जा रहा है...',
    gigNearYouCount: 'काम आपके पास है',
    gigsNearYouCount: 'काम आपके पास हैं',
    anyWage: 'कोई भी दिहाड़ी',

    // Categories (Simple Everyday Words)
    catConstruction: 'कंस्ट्रक्शन / मजदूरी',
    catWarehouse: 'गोदाम / लोडिंग',
    catElectrical: 'बिजली का काम',
    catPlumbing: 'प्लंबर / नल का काम',
    catDelivery: 'डिलीवरी / गाड़ी',
    catHousehold: 'घर का काम',
    catFactory: 'फैक्ट्री का काम',
    catEvents: 'इवेंट / खान-पान',
    catSecurity: 'सुरक्षा गार्ड',
    catGeneral: 'सामान्य काम',

    // Best Opportunity & Gig Radar
    bestOpportunity: 'सबसे अच्छा काम',
    matchForYou: 'आपके लिए सही',
    matchScoreReason: 'यह काम आपके लिए सही है क्योंकि:',
    radarTitle: 'गिग रडार',
    newGigForYou: 'आपके पास नया काम है',
    fillingFast: 'तेज़ी से भर रहा है',
    spotLeft1: '1 जगह बाकी',
    spotsLeft: 'जगह बाकी',
    reasonSkillMatch: 'आपकी स्किल मिलती है',
    reasonDistance: 'जगह आपकी चुनी हुई दूरी के अंदर है',
    reasonAvailability: 'आप इस समय काम कर सकते हैं',
    reasonWage: 'आपकी रोज़ की दिहाड़ी से मेल खाता है',
    reasonTrust: 'आपके काम के अनुभव के अनुसार सही काम',

    // Direct Job Offers & Counter Offers
    directOfferTitle: 'आपको काम का ऑफर मिला है',
    employerSentOffer: 'मालिक ने आपको काम का ऑफर भेजा है',
    employerProposedNewWage: 'मालिक ने नया ऑफर भेजा है',
    acceptOffer: 'ऑफर स्वीकार करें',
    negotiateWage: 'पैसे पर बात करें',
    declineOffer: 'ऑफर मना करें',
    sendCounterOffer: 'काम का ऑफर भेजें',
    enterYourWage: 'अपनी दिहाड़ी लिखें',
    counterOfferSent: 'ऑफर भेज दिया · मालिक के जवाब का इंतज़ार है',
    employerOffered: 'मालिक का ऑफर',

    // Clear Action Verbs for Buttons (Both Languages)
    btnApply: 'काम के लिए आवेदन करें',
    btnAccept: 'काम स्वीकार करें',
    btnReject: 'मना करें',
    btnViewDetails: 'काम देखें',
    btnStartWork: 'काम शुरू करें',
    btnCompleteWork: 'काम पूरा करें',
    btnCheckInGps: 'हाजिरी लगाएं (GPS Check In)',
    btnCancelJob: 'काम रद्द करें',
    btnReportProblem: 'समस्या बताएं',
    btnContactEmployer: 'मालिक से बात करें',
    btnPayWorker: 'पैसे दें',
    btnViewPayment: 'पैसे देखें',
    btnViewLocation: 'काम की जगह देखें',
    btnViewRoute: 'रास्ता देखें',
    btnOpenInMaps: 'गूगल मैप में रास्ता देखें',
    btnSignOut: 'लॉगआउट करें',
    btnHelpDesk: 'हेल्पलाइन पर बात करें',
    btnConfirm: 'पुष्टि करें',
    btnCancel: 'रद्द करें',
    btnSave: 'सेव करें',
    btnBack: 'पीछे जाएं',

    // Availability
    availabilityTitle: 'आप कब काम कर सकते हैं?',
    availableForWork: 'काम के लिए उपलब्ध हैं',
    unavailable: 'अभी उपलब्ध नहीं हैं',
    availableNow: 'अभी तुरंत उपलब्ध',
    scheduledMode: 'तय समय पर',
    offDuty: 'छुट्टी पर',

    // Worker ID & Profile
    workerIdTitle: 'मेरा Worker ID',
    workerName: 'नाम',
    workerSkill: 'स्किल',
    workExperience: 'काम का अनुभव',
    completedGigs: 'किए गए काम',
    rating: 'रेटिंग',
    trustScore: 'समय पर काम पूरा करना',
    verificationCompleted: 'जांच पूरी है',
    identityVerified: 'पहचान जांच पूरी',
    cooperativeMember: 'कोऑपरेटिव सदस्य',
    skillVerified: 'स्किल प्रमाणित',
    insuranceActive: 'बीमा सक्रिय',
    editProfile: 'प्रोफ़ाइल बदलें',
    yearsExperience: 'साल का अनुभव',
    memberSince: 'सदस्यता',

    // Dynamic Backend Statuses
    status_APPLIED: 'आवेदन किया गया',
    status_UNDER_REVIEW: 'जांच चल रही है',
    status_ACCEPTED: 'काम स्वीकार हो गया',
    status_CONFIRMED: 'पक्का हो गया',
    status_CHECKED_IN: 'हाजिरी लग गई',
    status_IN_PROGRESS: 'काम चल रहा है',
    status_COMPLETED: 'काम पूरा हो गया',
    status_PAYMENT_PENDING: 'पैसे अभी नहीं मिले',
    status_PAID: 'पैसे मिल गए',
    status_REJECTED: 'आवेदन स्वीकार नहीं हुआ',
    status_WITHDRAWN: 'आवेदन वापस लिया',
    status_EXPIRED: 'समय समाप्त',
    status_NEGOTIATING: 'पैसे पर बात चल रही है',
    status_CANCELLED: 'काम रद्द हो गया',
    status_ACTIVE: 'काम चालू है',
    status_PUBLISHED: 'उपलब्ध काम',

    // Notifications
    notif_gig_alert_title: 'आपके पास नया काम है',
    notif_direct_offer_title: 'मालिक ने आपको काम का ऑफर भेजा है',
    notif_app_accepted_title: 'आपका आवेदन स्वीकार हो गया',
    notif_payment_title: 'आपका भुगतान हो गया',
    notif_app_rejected_title: 'आपका आवेदन स्वीकार नहीं हुआ',
    notif_check_in_title: 'काम पर हाजिरी लग गई',
    notif_completed_title: 'काम पूरा हो गया',
    notif_counter_title: 'मालिक ने नया ऑफर भेजा है',
    notifView: 'देखें',
    notifDismiss: 'हटाएं',
    notifEmpty: 'अभी कोई नई सूचना नहीं है',
    notificationsTitle: 'सूचनाएं',

    // Payments & Money
    paymentTitle: 'भुगतान',
    paymentPending: 'पैसे अभी नहीं मिले',
    paymentReceived: 'पैसे मिल गए',
    paymentSuccess: 'भुगतान सफल रहा',
    amountToPay: 'भुगतान की रकम',
    totalEarned: 'कुल कमाई',
    payoutHistory: 'कमाई का इतिहास',
    escrowProtected: 'गिगईज़ी सुरक्षा द्वारा सुरक्षित',
    upiPayment: 'UPI / क्यूआर भुगतान',
    payNow: 'अभी पैसे दें',
    withdrawEarnings: 'तुरंत बैंक / UPI में निकालें',
    creditedToAccount: 'आपके खाते में जमा हो गए',

    // Two-Sided Rating & Disputes
    rateExperience: 'काम का अनुभव बताएं',
    punctuality: 'समय की पाबंदी',
    workQuality: 'काम की गुणवत्ता',
    behavior: 'व्यवहार',
    paymentPromptness: 'समय पर भुगतान',
    submitRating: 'रेटिंग दें',
    reportIssueTitle: 'समस्या बताएं',
    issueType: 'समस्या किस बारे में है?',
    issueDescription: 'अपनी समस्या साफ शब्दों में बताएं',
    submitGrievance: 'समस्या दर्ज करें',

    // Auth & Onboarding
    enterMobile: 'अपना मोबाइल नंबर दर्ज करें',
    otpSubtitle: 'हम 4-अंकों का वेरिफिकेशन कोड भेजेंगे।',
    getCode: 'ओटीपी प्राप्त करें',
    verifyOtp: '4-अंकों का कोड दर्ज करें',
    verifyAndContinue: 'सत्यापित करें और आगे बढ़ें',
    autoFillDemo: 'टेस्ट कोड भरें (1234)',
    resendIn: 'ओटीपी पुनः भेजें',
    resend: 'पुनः कोड भेजें',
    workerNameTitle: 'आपका पूरा नाम क्या है?',
    workerNameSub: 'आवेदन करते समय मालिक आपका यही नाम देखेंगे।',
    workerSkillsTitle: 'आप क्या काम करते हैं?',
    workerSkillsSub: 'अपने अनुभव के अनुसार काम चुनें।',
    workerWageTitle: 'आपकी रोज़ की दिहाड़ी कितनी है?',
    workerWageSub: 'इससे हम आपको सही काम दिखा सकेंगे।',
    employerNameTitle: 'अपने व्यवसाय की जानकारी दें',
    employerNameSub: 'काम पोस्ट करने और वर्कर रखने के लिए सेटअप करें।',
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

    // Simple Errors & Validation
    errorNetwork: 'इंटरनेट की समस्या है। दोबारा कोशिश करें।',
    errorPayment: 'पैसे भेजने में दिक्कत हुई। कृपया दोबारा कोशिश करें।',
    errorGeneric: 'कुछ दिक्कत हुई। कृपया दोबारा कोशिश करें।',
    errorInvalidPhone: 'कृपया 10 अंकों का सही मोबाइल नंबर लिखें।',
    errorInvalidAmount: 'कृपया सही रकम लिखें।',
    errorRequiredField: 'कृपया यह जानकारी भरें।',
    labelJobLocation: 'काम की जगह',
    placeholderJobLocation: 'जगह लिखें',
    labelWorkersNeeded: 'कितने लोग चाहिए?',
    placeholderWorkersNeeded: 'संख्या लिखें',
    labelWage: 'दिहाड़ी',
    placeholderWage: 'रकम लिखें',
  },
};

export type TranslationKey = keyof typeof TRANSLATIONS.en;

/**
 * Universal Dynamic Status Localizer
 * Converts backend enums to localized strings without modifying database values
 */
export function getLocalizedStatus(status: string | undefined | null, lang: LanguageCode = 'en'): string {
  if (!status) return '';
  const key = `status_${status.toUpperCase()}` as TranslationKey;
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  if (key in dict) {
    return dict[key];
  }
  // Fallback mappings
  const normalized = status.toUpperCase().replace(/\s+/g, '_');
  const normKey = `status_${normalized}` as TranslationKey;
  if (normKey in dict) {
    return dict[normKey];
  }
  return status;
}

/**
 * Universal Category Localizer
 */
export function getLocalizedCategory(category: string | undefined | null, lang: LanguageCode = 'en'): string {
  if (!category) return '';
  const c = category.toLowerCase();
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;

  if (c === 'all') return dict.allCategories;
  if (c.includes('construct') || c.includes('mason') || c.includes('helper')) return dict.catConstruction;
  if (c.includes('ware') || c.includes('load') || c.includes('pack')) return dict.catWarehouse;
  if (c.includes('elect')) return dict.catElectrical;
  if (c.includes('plumb') || c.includes('pipe')) return dict.catPlumbing;
  if (c.includes('deliv') || c.includes('driv') || c.includes('transport')) return dict.catDelivery;
  if (c.includes('house') || c.includes('clean') || c.includes('maid')) return dict.catHousehold;
  if (c.includes('fact') || c.includes('industr')) return dict.catFactory;
  if (c.includes('event') || c.includes('hospit')) return dict.catEvents;
  if (c.includes('secur') || c.includes('guard')) return dict.catSecurity;

  return category;
}

/**
 * Universal Notification Localizer
 * Translates notification title, message, and action text based on active language
 */
export function getLocalizedNotification(
  notif: { type: string; title?: string; message?: string; data?: any },
  lang: LanguageCode = 'en'
): { title: string; message: string; actionText: string } {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;

  switch (notif.type) {
    case 'GIG_ALERT': {
      const title = dict.notif_gig_alert_title;
      const jobTitle = notif.title || notif.data?.category || '';
      const wage = notif.data?.wage ? `₹${notif.data.wage.toLocaleString('en-IN')}${dict.perDay}` : '';
      const distance = notif.data?.distanceKm ? `${notif.data.distanceKm.toFixed(1)} ${dict.distance}` : '';
      const message = [jobTitle, wage, distance].filter(Boolean).join(' · ');
      return {
        title,
        message: message || notif.message || '',
        actionText: dict.btnViewDetails,
      };
    }
    case 'COUNTER_OFFER': {
      const wage = notif.data?.wage ? `₹${notif.data.wage.toLocaleString('en-IN')}` : '';
      return {
        title: dict.notif_counter_title,
        message: wage ? `${dict.employerOffered} ${wage}${dict.perDay}` : (notif.message || ''),
        actionText: dict.acceptOffer,
      };
    }
    case 'HIRED': {
      return {
        title: dict.notif_app_accepted_title,
        message: notif.message || dict.status_ACCEPTED,
        actionText: dict.btnStartWork,
      };
    }
    case 'APPLICATION_RECEIVED': {
      return {
        title: dict.notif_app_accepted_title,
        message: notif.message || '',
        actionText: dict.btnViewDetails,
      };
    }
    case 'PAYMENT_RECEIVED': {
      const amount = notif.data?.amount ? `₹${notif.data.amount.toLocaleString('en-IN')}` : '';
      return {
        title: dict.notif_payment_title,
        message: amount ? `${amount} ${dict.creditedToAccount}` : (notif.message || ''),
        actionText: dict.btnViewPayment,
      };
    }
    case 'CHECK_IN': {
      return {
        title: dict.notif_check_in_title,
        message: notif.message || '',
        actionText: dict.btnViewDetails,
      };
    }
    case 'WORK_COMPLETED': {
      return {
        title: dict.notif_completed_title,
        message: notif.message || '',
        actionText: dict.btnViewDetails,
      };
    }
    default:
      return {
        title: notif.title || '',
        message: notif.message || '',
        actionText: dict.btnViewDetails,
      };
  }
}
