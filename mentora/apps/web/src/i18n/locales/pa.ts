/**
 * Punjabi (ਪੰਜਾਬੀ) locale — implements the same keys as en.ts.
 * All values use natural Gurmukhi script (not transliteration).
 */

import type { Dict } from './en';

const pa: Dict = {
  nav: {
    findTeacher: 'ਅਧਿਆਪਕ ਲੱਭੋ',
    courses: 'ਕੋਰਸ',
    pricing: 'ਕੀਮਤਾਂ',
    aiTutor: 'AI ਟਿਊਟਰ',
    dashboard: 'ਡੈਸ਼ਬੋਰਡ',
    teach: 'ਪੜ੍ਹਾਓ',
    research: 'ਖੋਜ',
    researchATopic: 'ਵਿਸ਼ੇ ਦੀ ਖੋਜ ਕਰੋ',
    signIn: 'ਸਾਈਨ ਇਨ ਕਰੋ',
    signOut: 'ਸਾਈਨ ਆਊਟ ਕਰੋ',
    getStartedFree: 'ਮੁਫ਼ਤ ਸ਼ੁਰੂ ਕਰੋ',
    myAccount: 'ਮੇਰਾ ਖਾਤਾ',
    openMenu: 'ਮੀਨੂ ਖੋਲ੍ਹੋ',
    closeMenu: 'ਮੀਨੂ ਬੰਦ ਕਰੋ',
    normalTextSize: 'ਸਧਾਰਨ ਟੈਕਸਟ ਆਕਾਰ',
    largerTextSize: 'ਵੱਡਾ ਟੈਕਸਟ ਆਕਾਰ',
    switchToNormal: 'ਸਧਾਰਨ ਟੈਕਸਟ ਆਕਾਰ ਤੇ ਜਾਓ',
    switchToLarger: 'ਵੱਡੇ ਟੈਕਸਟ ਆਕਾਰ ਤੇ ਜਾਓ',
    normalText: 'ਸਧਾਰਨ ਟੈਕਸਟ',
    largerText: 'ਵੱਡਾ ਟੈਕਸਟ',
    chooseLanguage: 'ਭਾਸ਼ਾ ਚੁਣੋ',
  },

  landing: {
    trustBadge: '18,000+ ਪਰਿਵਾਰਾਂ ਦਾ ਭਰੋਸਾ',
    heroHeading: 'ਜ਼ਿੰਦਗੀ ਭਰ ਦੀ ਮੁਹਾਰਤ ਬਣ ਜਾਂਦੀ ਹੈ\nਅਗਲੀ ਪੀੜ੍ਹੀ ਦੀ ਸ਼ੁਰੂਆਤ।',
    heroSubheading:
      'ਆਪਣੇ ਬੱਚੇ ਨੂੰ ਸੇਵਾਮੁਕਤ ਡਾਕਟਰਾਂ, ਇੰਜੀਨੀਅਰਾਂ, ਲੇਖਕਾਂ ਅਤੇ ਪ੍ਰੋਫੈਸਰਾਂ ਨਾਲ ਜੋੜੋ ਜੋ ਹਰ ਪਾਠ ਵਿੱਚ ਅਸਲ ਜ਼ਿੰਦਗੀ ਦੀ ਡੂੰਘਾਈ ਲਿਆਉਂਦੇ ਹਨ।',
    heroCta: 'ਅਧਿਆਪਕ ਲੱਭੋ',
    heroCtaTeacher: 'ਮੈਂਟਰ ਬਣੋ',
    trustSignals: 'ਬ੍ਰਾਊਜ਼ ਕਰਨਾ ਮੁਫ਼ਤ · ਕ੍ਰੈਡਿਟ ਕਾਰਡ ਦੀ ਲੋੜ ਨਹੀਂ · ਕਦੇ ਵੀ ਰੱਦ ਕਰੋ',

    statMentors: 'ਮਾਹਿਰ ਮੈਂਟਰ',
    statStudents: 'ਵਿਦਿਆਰਥੀ ਸਿੱਖ ਰਹੇ ਹਨ',
    statRating: 'ਔਸਤ ਅਧਿਆਪਕ ਰੇਟਿੰਗ',
    statSubjects: 'ਵਿਸ਼ੇ ਉਪਲਬਧ',

    forFamilies: 'ਪਰਿਵਾਰਾਂ ਲਈ',
    learnerSectionHeading: 'ਸਿੱਖਣਾ ਜੋ ਸੱਚਮੁੱਚ ਸਮਝ ਆਵੇ',
    learnerSectionSub: 'ਉਤਸੁਕ ਬੱਚੇ ਤੋਂ ਭਰੋਸੇਮੰਦ ਸਿੱਖਣ ਵਾਲੇ ਤੱਕ — ਸਿਰਫ਼ ਤਿੰਨ ਆਸਾਨ ਕਦਮ।',
    step: 'ਕਦਮ',
    browseRealExpertsTitle: 'ਅਸਲੀ ਮਾਹਿਰ ਲੱਭੋ',
    browseRealExpertsDesc:
      'ਸੇਵਾਮੁਕਤ ਡਾਕਟਰ, ਇੰਜੀਨੀਅਰ, ਲੇਖਕ ਅਤੇ ਪ੍ਰੋਫੈਸਰ ਲੱਭੋ ਜੋ ਬੱਚਿਆਂ ਨੂੰ ਪੜ੍ਹਾਉਣਾ ਪਸੰਦ ਕਰਦੇ ਹਨ।',
    joinClassTitle: 'ਕਲਾਸ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ ਜਾਂ 1:1 ਬੁੱਕ ਕਰੋ',
    joinClassDesc:
      'ਲਾਈਵ ਗਰੁੱਪ ਕਲਾਸਰੂਮ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ ਜਾਂ ਨਿੱਜੀ ਕੋਚਿੰਗ ਸੈਸ਼ਨ ਬੁੱਕ ਕਰੋ — ਤੁਹਾਡਾ ਸਮਾਂ-ਸਾਰਣੀ, ਤੁਹਾਡੀ ਰਫ਼ਤਾਰ।',
    learnGrowTitle: 'ਸਿੱਖੋ ਅਤੇ ਅੱਗੇ ਵਧੋ',
    learnGrowDesc:
      'AI ਟਿਊਟਰ ਨਾਲ ਅਭਿਆਸ ਕਰੋ, ਸਮੱਗਰੀ ਡਾਊਨਲੋਡ ਕਰੋ ਅਤੇ ਤਰੱਕੀ ਟਰੈਕ ਕਰੋ — ਸਭ ਇੱਕ ਥਾਂ।',
    browseTeachers: 'ਅਧਿਆਪਕ ਦੇਖੋ',

    featuredMentors: 'ਖਾਸ ਮੈਂਟਰ',
    meetExperts: 'ਸਾਡੇ ਕੁਝ ਮਾਹਿਰਾਂ ਨੂੰ ਮਿਲੋ',
    seeAllTeachers: 'ਸਾਰੇ ਅਧਿਆਪਕ ਦੇਖੋ',

    everySubjectHeading: 'ਹਰ ਉਹ ਵਿਸ਼ਾ ਜੋ ਤੁਹਾਡੇ ਬੱਚੇ ਨੂੰ ਚਾਹੀਦਾ ਹੈ',
    everySubjectSub: 'ਗਣਿਤ ਤੋਂ ਜੀਵਨ ਕੌਸ਼ਲ ਤੱਕ — ਉਨ੍ਹਾਂ ਲੋਕਾਂ ਦੁਆਰਾ ਪੜ੍ਹਾਇਆ ਜੋ ਇਸ ਵਿੱਚ ਜੀਏ ਹਨ।',

    forRetiredPros: 'ਸੇਵਾਮੁਕਤ ਪੇਸ਼ੇਵਰਾਂ ਲਈ',
    teacherSectionHeading: 'ਆਪਣੇ ਕੈਰੀਅਰ ਨੂੰ ਆਮਦਨ ਵਿੱਚ ਬਦਲੋ',
    teacherSectionSub:
      'ਤੁਹਾਡੇ ਦਹਾਕਿਆਂ ਦਾ ਤਜ਼ਰਬਾ ਬਿਲਕੁਲ ਉਹੀ ਹੈ ਜੋ ਵਿਦਿਆਰਥੀ ਲੱਭ ਰਹੇ ਹਨ।\n      ਸ਼ੁਰੂ ਤੋਂ ਪਾਠ ਯੋਜਨਾਵਾਂ ਨਹੀਂ — ਤਕਨੀਕ ਅਸੀਂ ਸੰਭਾਲਾਂਗੇ, ਤੁਸੀਂ ਪੜ੍ਹਾਓ।',
    createProfileTitle: 'ਆਪਣੀ ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ',
    createProfileDesc:
      'ਆਪਣੀ ਕੈਰੀਅਰ ਕਹਾਣੀ, ਵਿਸ਼ੇ ਅਤੇ ਪੜ੍ਹਾਉਣ ਦੀ ਸ਼ੈਲੀ ਸਾਂਝੀ ਕਰੋ। ਇਸ ਵਿੱਚ 10 ਮਿੰਟ ਤੋਂ ਘੱਟ ਲੱਗਦਾ ਹੈ।',
    uploadMaterialsTitle: 'ਆਪਣੀ ਸਮੱਗਰੀ ਅਪਲੋਡ ਕਰੋ',
    uploadMaterialsDesc:
      'ਆਪਣੇ PDF ਅਤੇ ਨੋਟਸ ਪਾਓ। ਸਾਡਾ AI ਉਨ੍ਹਾਂ ਨੂੰ ਸਕੈਨ ਕਰਕੇ ਵਰਤੋਂ ਲਈ ਤਿਆਰ ਕੋਰਸ ਬਣਾਉਂਦਾ ਹੈ।',
    earnWhileInspireTitle: 'ਪ੍ਰੇਰਿਤ ਕਰਦੇ ਹੋਏ ਕਮਾਓ',
    earnWhileInspireDesc:
      'ਸੈਸ਼ਨ ਸ਼ੈਡਿਊਲ ਕਰੋ, ਆਪਣੀ ਕੀਮਤ ਤੈਅ ਕਰੋ, ਅਤੇ ਜੋ ਕਮਾਓ ਉਸ ਦਾ 90% ਤੱਕ ਰੱਖੋ। ਤਕਨੀਕੀ ਕੌਸ਼ਲ ਦੀ ਲੋੜ ਨਹੀਂ।',
    startTeachingToday: 'ਅੱਜ ਪੜ੍ਹਾਉਣਾ ਸ਼ੁਰੂ ਕਰੋ',

    testimonialQuote:
      '"ਮੇਰੀ ਧੀ ਗਣਿਤ ਤੋਂ ਡਰਦੀ ਸੀ, ਹੁਣ ਉਹ ਵਾਧੂ ਸੈਸ਼ਨਾਂ ਲਈ ਕਹਿੰਦੀ ਹੈ। ਉਸਦੇ ਮੈਂਟਰ ਇੱਕ ਸੇਵਾਮੁਕਤ ਇੰਜੀਨੀਅਰ ਹਨ ਜਿਨ੍ਹਾਂ ਕੋਲ 40 ਸਾਲਾਂ ਦਾ ਧੀਰਜ ਹੈ।"',
    testimonialAuthor: '— ਸਾਰਾ ਐਮ., ਕਲਾਸ 5 ਦੀ ਵਿਦਿਆਰਥਣ ਦੀ ਮਾਂ',
    getStartedFree: 'ਮੁਫ਼ਤ ਸ਼ੁਰੂ ਕਰੋ',
    viewPlans: 'ਯੋਜਨਾਵਾਂ ਦੇਖੋ',
  },

  auth: {
    welcomeBack: 'ਵਾਪਸ ਸੁਆਗਤ ਹੈ',
    signInSubtitle: 'ਸਿੱਖਣਾ ਜਾਰੀ ਰੱਖਣ ਲਈ ਆਪਣੇ ਖਾਤੇ ਵਿੱਚ ਸਾਈਨ ਇਨ ਕਰੋ।',
    emailAddress: 'ਈਮੇਲ ਪਤਾ',
    password: 'ਪਾਸਵਰਡ',
    forgotPassword: 'ਪਾਸਵਰਡ ਭੁੱਲ ਗਏ?',
    signIn: 'ਸਾਈਨ ਇਨ ਕਰੋ',
    noAccount: 'ਖਾਤਾ ਨਹੀਂ ਹੈ?',
    createOneFree: 'ਮੁਫ਼ਤ ਵਿੱਚ ਬਣਾਓ',

    createFreeAccount: 'ਆਪਣਾ ਮੁਫ਼ਤ ਖਾਤਾ ਬਣਾਓ',
    signupSubtitle: 'ਕ੍ਰੈਡਿਟ ਕਾਰਡ ਦੀ ਲੋੜ ਨਹੀਂ। ਕੁਝ ਸਕਿੰਟਾਂ ਵਿੱਚ ਸ਼ੁਰੂ ਕਰੋ।',
    iAmHereTo: 'ਮੈਂ ਇੱਥੇ ਹਾਂ…',
    iWantToLearn: 'ਮੈਂ ਸਿੱਖਣਾ ਚਾਹੁੰਦਾ/ਚਾਹੁੰਦੀ ਹਾਂ',
    iWantToLearnDesc: 'ਮੈਂ ਇੱਕ ਵਿਦਿਆਰਥੀ ਜਾਂ ਮਾਂ-ਬਾਪ ਹਾਂ ਜੋ ਮਾਹਿਰ ਅਧਿਆਪਕ ਲੱਭ ਰਹੇ ਹਨ।',
    iWantToTeach: 'ਮੈਂ ਪੜ੍ਹਾਉਣਾ ਚਾਹੁੰਦਾ/ਚਾਹੁੰਦੀ ਹਾਂ',
    iWantToTeachDesc: 'ਮੈਂ ਇੱਕ ਸੇਵਾਮੁਕਤ ਪੇਸ਼ੇਵਰ ਹਾਂ ਜੋ ਆਪਣੀ ਮੁਹਾਰਤ ਸਾਂਝੀ ਕਰਨਾ ਚਾਹੁੰਦਾ/ਚਾਹੁੰਦੀ ਹੈ।',
    fullName: 'ਪੂਰਾ ਨਾਮ',
    createAccount: 'ਖਾਤਾ ਬਣਾਓ',
    termsNote: 'ਖਾਤਾ ਬਣਾ ਕੇ ਤੁਸੀਂ ਸਾਡੇ ਨਾਲ ਸਹਿਮਤ ਹੋ',
    terms: 'ਨਿਯਮ',
    and: 'ਅਤੇ',
    privacyPolicy: 'ਗੋਪਨੀਯਤਾ ਨੀਤੀ',
    alreadyHaveAccount: 'ਪਹਿਲਾਂ ਤੋਂ ਖਾਤਾ ਹੈ?',

    welcomeToMentora: 'Mentora ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ!',
  },

  tutor: {
    title: 'AI ਟਿਊਟਰ',
    subtitle: 'ਕੁਝ ਵੀ ਪੁੱਛੋ — ਮੈਂ ਤੁਹਾਡੀ ਮਦਦ ਲਈ ਇੱਥੇ ਹਾਂ।',
    signInForUnlimited: 'ਅਸੀਮਤ ਸਵਾਲਾਂ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ',
    makeAQuiz: 'ਕੁਇਜ਼ ਬਣਾਓ',
    explainSimply: 'ਸਰਲ ਭਾਸ਼ਾ ਵਿੱਚ ਸਮਝਾਓ',
    summariseForMe: 'ਸੰਖੇਪ ਦਿਓ',
    newChat: 'ਨਵੀਂ ਗੱਲਬਾਤ',
    startNewConversation: 'ਨਵੀਂ ਗੱਲਬਾਤ ਸ਼ੁਰੂ ਕਰੋ',
    typeYourQuestion: 'ਆਪਣਾ ਸਵਾਲ ਟਾਈਪ ਕਰੋ',
    sendMessage: 'ਸੁਨੇਹਾ ਭੇਜੋ',
    send: 'ਭੇਜੋ',
    inputPlaceholder: 'ਕੁਝ ਵੀ ਪੁੱਛੋ… (ਭੇਜਣ ਲਈ Enter, ਨਵੀਂ ਲਾਈਨ ਲਈ Shift+Enter)',
    explanation: 'ਵਿਆਖਿਆ',
    tip1: 'ਕਦੇ ਵੀ ਅਗਲੇ ਸਵਾਲ ਪੁੱਛੋ — ਮੈਨੂੰ ਸਾਡੀ ਗੱਲਬਾਤ ਯਾਦ ਰਹਿੰਦੀ ਹੈ।',
    tip2: '"ਭਿੰਨਾਂ ਤੇ ਕੁਇਜ਼ ਬਣਾਓ" ਕਹੋ ਅਤੇ ਮੈਂ ਇੱਕ ਇੰਟਰੈਕਟਿਵ ਅਭਿਆਸ ਪ੍ਰੀਖਿਆ ਬਣਾਵਾਂਗਾ।',
    tip3: 'ਬਹੁਤ ਸਰਲ ਸਮਝਾਉਣ ਲਈ "8 ਸਾਲ ਦੇ ਬੱਚੇ ਨੂੰ ਸਮਝਾਓ" ਕਹੋ।',
  },

  research: {
    title: 'ਵਿਸ਼ੇ ਦੀ ਖੋਜ ਕਰੋ',
    subtitle: 'ਕੋਈ ਵੀ ਵਿਸ਼ਾ ਟਾਈਪ ਕਰੋ — Mentora ਲਾਈਵ ਵੈੱਬ ਤੇ ਖੋਜ ਕਰਕੇ ਤੁਹਾਡੇ ਲਈ ਪਾਠ ਤਿਆਰ ਕਰਦਾ ਹੈ।',
    whatTopicLabel: 'ਤੁਸੀਂ ਕਿਸ ਵਿਸ਼ੇ ਦੀ ਖੋਜ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?',
    topicPlaceholder: 'ਜਿਵੇਂ: ਪਾਣੀ ਦਾ ਚੱਕਰ, ਪਹਿਲਾ ਵਿਸ਼ਵ ਯੁੱਧ, ਭਿੰਨਾਂ, ਪ੍ਰਕਾਸ਼ ਸੰਸ਼ਲੇਸ਼ਣ…',
    topicHint: 'ਜਿੰਨਾ ਵਿਸਤਾਰਿਤ ਲਿਖੋ — ਜਿੰਨਾ ਵੇਰਵਾ, ਓਨਾ ਬਿਹਤਰ ਸੰਖੇਪ ਵੇਰਵਾ।',
    subjectLabel: 'ਵਿਸ਼ਾ (ਵਿਕਲਪਿਕ)',
    gradeLabel: 'ਜਮਾਤ ਪੱਧਰ (ਵਿਕਲਪਿਕ)',
    anySubject: 'ਕੋਈ ਵੀ ਵਿਸ਼ਾ (ਵਿਕਲਪਿਕ)',
    anyGrade: 'ਕੋਈ ਵੀ ਜਮਾਤ (ਵਿਕਲਪਿਕ)',
    researchThisTopic: 'ਇਸ ਵਿਸ਼ੇ ਦੀ ਖੋਜ ਕਰੋ',
    searchingWeb: 'ਵੈੱਬ ਤੇ ਖੋਜ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ ਅਤੇ ਤੁਹਾਡਾ ਸੰਖੇਪ ਵੇਰਵਾ ਲਿਖਿਆ ਜਾ ਰਿਹਾ ਹੈ…',
    researchingTopic: 'ਵਿਸ਼ੇ ਦੀ ਖੋਜ ਹੋ ਰਹੀ ਹੈ…',
    usuallyTakes: 'ਇਸ ਵਿੱਚ ਆਮ ਤੌਰ ਤੇ 10–20 ਸਕਿੰਟ ਲੱਗਦੇ ਹਨ।',
    tip1: 'Mentora ਲਾਈਵ ਵੈੱਬ ਤੇ ਖੋਜਦਾ ਹੈ ਅਤੇ ਹਰ ਸਰੋਤ ਦਾ ਹਵਾਲਾ ਦਿੰਦਾ ਹੈ ਤਾਂ ਜੋ ਤੁਸੀਂ ਤੱਥ ਜਾਂਚ ਸਕੋ।',
    tip2: 'ਤੁਹਾਨੂੰ ਵਰਤੋਂ ਲਈ ਤਿਆਰ ਪਾਠ ਯੋਜਨਾ ਮਿਲਦੀ ਹੈ ਜਿਸਨੂੰ ਤੁਸੀਂ ਇੱਕ ਕਲਿੱਕ ਵਿੱਚ ਪੂਰੇ ਕੋਰਸ ਵਿੱਚ ਬਦਲ ਸਕਦੇ ਹੋ।',
    tip3: 'ਉਮਰ-ਉਚਿਤ ਭਾਸ਼ਾ ਅਤੇ ਉਦਾਹਰਣਾਂ ਲਈ ਕੋਈ ਖਾਸ ਜਮਾਤ ਪੱਧਰ ਅਜ਼ਮਾਓ।',
    overview: 'ਸੰਖੇਪ ਜਾਣਕਾਰੀ',
    keyPoints: 'ਮੁੱਖ ਬਿੰਦੂ',
    suggestedLessonPlan: 'ਸੁਝਾਵੀ ਪਾਠ ਯੋਜਨਾ',
    sources: 'ਸਰੋਤ',
    liveWebBadge: 'ਲਾਈਵ ਵੈੱਬ',
    exampleSourcesBadge: 'ਉਦਾਹਰਨ ਸਰੋਤ — ਲਾਈਵ ਵੈੱਬ ਨਤੀਜਿਆਂ ਲਈ ਖੋਜ API ਕੁੰਜੀ ਜੋੜੋ',
    noSourcesAvailable: 'ਇਸ ਸੰਖੇਪ ਵੇਰਵੇ ਲਈ ਕੋਈ ਸਰੋਤ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।',
    teacherReadyBriefing: 'ਇੱਥੇ ਤੁਹਾਡਾ ਅਧਿਆਪਕ ਲਈ ਤਿਆਰ ਸੰਖੇਪ ਵੇਰਵਾ ਹੈ।',
    researchAnotherTopic: 'ਹੋਰ ਵਿਸ਼ੇ ਦੀ ਖੋਜ ਕਰੋ',
    turnIntoCourse: 'ਇਸਨੂੰ ਕੋਰਸ ਵਿੱਚ ਬਦਲੋ',
    copyBriefing: 'ਸੰਖੇਪ ਵੇਰਵਾ ਕਾਪੀ ਕਰੋ',
    copied: 'ਕਾਪੀ ਹੋ ਗਿਆ!',
  },

  footer: {
    learnCol: 'ਸਿੱਖੋ',
    teachCol: 'ਪੜ੍ਹਾਓ',
    companyCol: 'ਕੰਪਨੀ',
    findTeacher: 'ਅਧਿਆਪਕ ਲੱਭੋ',
    browseCourses: 'ਕੋਰਸ ਦੇਖੋ',
    plansAndPricing: 'ਯੋਜਨਾਵਾਂ ਅਤੇ ਕੀਮਤਾਂ',
    aiTutor: 'AI ਟਿਊਟਰ',
    becomeAMentor: 'ਮੈਂਟਰ ਬਣੋ',
    uploadMaterials: 'ਸਮੱਗਰੀ ਅਪਲੋਡ ਕਰੋ',
    createACourse: 'ਕੋਰਸ ਬਣਾਓ',
    teacherPlans: 'ਅਧਿਆਪਕ ਯੋਜਨਾਵਾਂ',
    pricing: 'ਕੀਮਤਾਂ',
    support: 'ਸਹਾਇਤਾ',
    allRightsReserved: 'ਸਾਰੇ ਅਧਿਕਾਰ ਸੁਰੱਖਿਅਤ ਹਨ।',
  },

  common: {
    signIn: 'ਸਾਈਨ ਇਨ ਕਰੋ',
    getStartedFree: 'ਮੁਫ਼ਤ ਸ਼ੁਰੂ ਕਰੋ',
    loading: 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ…',
  },
};

export default pa;
