/**
 * English locale — source of truth for all translation keys.
 * All values MUST equal the original hardcoded strings exactly.
 * Other locale files must implement the same shape (Dict type).
 */

const en = {
  // ── Navigation ──────────────────────────────────────────────────────
  nav: {
    findTeacher: 'Find a Teacher',
    courses: 'Courses',
    pricing: 'Pricing',
    aiTutor: 'AI Tutor',
    dashboard: 'Dashboard',
    teach: 'Teach',
    research: 'Research',
    researchATopic: 'Research a topic',
    signIn: 'Sign in',
    signOut: 'Sign out',
    getStartedFree: 'Get started free',
    myAccount: 'My Account',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    normalTextSize: 'Normal text size',
    largerTextSize: 'Larger text size',
    switchToNormal: 'Switch to normal text size',
    switchToLarger: 'Switch to larger text size',
    normalText: 'Normal text',
    largerText: 'Larger text',
    chooseLanguage: 'Choose language',
  },

  // ── Landing page ─────────────────────────────────────────────────────
  landing: {
    trustBadge: 'Trusted by 18,000+ families',
    heroHeading: "A lifetime of expertise becomes\nthe next generation's head start.",
    heroSubheading:
      'connect your child with retired doctors, engineers, authors and professors who bring real-world depth to every lesson.',
    heroCta: 'Find a Teacher',
    heroCtaTeacher: 'Become a Mentor',
    trustSignals: 'Free to browse · No credit card needed · Cancel any time',

    // Stats
    statMentors: 'Expert mentors',
    statStudents: 'Students learning',
    statRating: 'Average teacher rating',
    statSubjects: 'Subjects covered',

    // How it works — Learners
    forFamilies: 'For Families',
    learnerSectionHeading: 'Learning that actually makes sense',
    learnerSectionSub: 'Three simple steps from curious child to confident learner.',
    step: 'Step',
    browseRealExpertsTitle: 'Browse real experts',
    browseRealExpertsDesc:
      'Find retired doctors, engineers, authors and professors who love teaching children.',
    joinClassTitle: 'Join a class or book 1:1',
    joinClassDesc:
      'Hop into a live group classroom or book a personal coaching session — your schedule, your pace.',
    learnGrowTitle: 'Learn & grow',
    learnGrowDesc:
      'Practice with the AI tutor, download materials and track progress — all in one place.',
    browseTeachers: 'Browse Teachers',

    // Featured mentors
    featuredMentors: 'Featured Mentors',
    meetExperts: 'Meet some of our experts',
    seeAllTeachers: 'See all teachers',

    // Subjects
    everySubjectHeading: 'Every subject your child needs',
    everySubjectSub: "From Maths to Life Skills — taught by people who've lived it.",

    // How it works — Teachers
    forRetiredPros: 'For Retired Professionals',
    teacherSectionHeading: 'Turn your career into income',
    teacherSectionSub:
      'Your decades of experience are exactly what students are looking for.\n      No lesson plans from scratch — we handle the tech, you do the teaching.',
    createProfileTitle: 'Create your profile',
    createProfileDesc:
      'Share your career story, subjects and teaching style. It takes less than 10 minutes.',
    uploadMaterialsTitle: 'Upload your materials',
    uploadMaterialsDesc:
      'Drop in your PDFs and notes. Our AI scans them and creates a ready-to-use course.',
    earnWhileInspireTitle: 'Earn while you inspire',
    earnWhileInspireDesc:
      'Schedule sessions, set your price, and keep up to 90% of what you earn. No tech skills needed.',
    startTeachingToday: 'Start teaching today',

    // CTA section
    testimonialQuote:
      '“My daughter went from dreading maths to asking for extra sessions. Her mentor is a retired engineer with 40 years of patience.”',
    testimonialAuthor: '— Sarah M., parent of a Grade 5 student',
    getStartedFree: 'Get started free',
    viewPlans: 'View plans',
  },

  // ── Auth ─────────────────────────────────────────────────────────────
  auth: {
    welcomeBack: 'Welcome back',
    signInSubtitle: 'Sign in to your account to continue learning.',
    emailAddress: 'Email address',
    password: 'Password',
    forgotPassword: 'Forgot password?',
    signIn: 'Sign in',
    noAccount: "Don't have an account?",
    createOneFree: 'Create one free',

    createFreeAccount: 'Create your free account',
    signupSubtitle: 'No credit card needed. Start in seconds.',
    iAmHereTo: 'I am here to…',
    iWantToLearn: 'I want to learn',
    iWantToLearnDesc: "I'm a student or parent looking for expert tutors.",
    iWantToTeach: 'I want to teach',
    iWantToTeachDesc: "I'm a retired professional who wants to share my expertise.",
    fullName: 'Full name',
    createAccount: 'Create account',
    termsNote: 'By creating an account you agree to our',
    terms: 'Terms',
    and: 'and',
    privacyPolicy: 'Privacy Policy',
    alreadyHaveAccount: 'Already have an account?',

    welcomeToMentora: 'Welcome to Mentora!',
  },

  // ── AI Tutor page ─────────────────────────────────────────────────────
  tutor: {
    title: 'AI Tutor',
    subtitle: "Ask anything — I'm here to help you learn.",
    signInForUnlimited: 'Sign in for unlimited questions',
    makeAQuiz: 'Make a quiz',
    explainSimply: 'Explain simply',
    summariseForMe: 'Summarise for me',
    newChat: 'New chat',
    startNewConversation: 'Start a new conversation',
    typeYourQuestion: 'Type your question',
    sendMessage: 'Send message',
    send: 'Send',
    inputPlaceholder: 'Ask anything… (Enter to send, Shift+Enter for new line)',
    explanation: 'Explanation',
    tip1: "Ask follow-up questions anytime — I remember our conversation.",
    tip2: "Say \"make a quiz on fractions\" and I'll create an interactive practice test.",
    tip3: "Ask me to \"explain like I'm 8\" for super-simple explanations.",
  },

  // ── Research page ──────────────────────────────────────────────────────
  research: {
    title: 'Research a topic',
    subtitle: 'Type any topic — Mentora researches the live web and drafts a lesson for you.',
    whatTopicLabel: 'What topic would you like to research?',
    topicPlaceholder: 'e.g. The Water Cycle, World War I, Fractions, Photosynthesis…',
    topicHint: 'Be as specific as you like — the more detail, the better the briefing.',
    subjectLabel: 'Subject (optional)',
    gradeLabel: 'Grade level (optional)',
    anySubject: 'Any subject (optional)',
    anyGrade: 'Any grade (optional)',
    researchThisTopic: 'Research this topic',
    searchingWeb: 'Searching the web and writing your briefing…',
    researchingTopic: 'Researching topic…',
    usuallyTakes: 'This usually takes 10–20 seconds.',
    tip1: 'Mentora searches the live web and cites every source so you can verify facts.',
    tip2: 'You get a ready-to-use lesson plan you can turn into a full course in one click.',
    tip3: 'Try a specific grade level for age-appropriate language and examples.',
    overview: 'Overview',
    keyPoints: 'Key points',
    suggestedLessonPlan: 'Suggested lesson plan',
    sources: 'Sources',
    liveWebBadge: 'Live web',
    exampleSourcesBadge: 'Example sources — add a search API key for live web results',
    noSourcesAvailable: 'No sources available for this briefing.',
    teacherReadyBriefing: 'Here is your teacher-ready briefing.',
    researchAnotherTopic: 'Research another topic',
    turnIntoCourse: 'Turn this into a course',
    copyBriefing: 'Copy briefing',
    copied: 'Copied!',
  },

  // ── Footer ─────────────────────────────────────────────────────────────
  footer: {
    learnCol: 'Learn',
    teachCol: 'Teach',
    companyCol: 'Company',
    findTeacher: 'Find a Teacher',
    browseCourses: 'Browse Courses',
    plansAndPricing: 'Plans & Pricing',
    aiTutor: 'AI Tutor',
    becomeAMentor: 'Become a Mentor',
    uploadMaterials: 'Upload Materials',
    createACourse: 'Create a Course',
    teacherPlans: 'Teacher Plans',
    pricing: 'Pricing',
    support: 'Support',
    allRightsReserved: 'All rights reserved.',
  },

  // ── Common ────────────────────────────────────────────────────────────
  common: {
    signIn: 'Sign in',
    getStartedFree: 'Get started free',
    loading: 'Loading…',
  },
} as const;

export default en;

/**
 * EnDict is the literal type of the English dictionary (for internal use).
 * Dict is the widened structural type that all locale files must implement.
 * Using Record<string, string> for leaf values so non-English locales compile.
 */
type Widen<T> = {
  [K in keyof T]: T[K] extends string ? string : Widen<T[K]>;
};
export type Dict = Widen<typeof en>;
