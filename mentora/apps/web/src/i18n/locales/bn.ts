/**
 * Bengali (বাংলা) locale — implements the same keys as en.ts.
 * All values use natural Bengali script (not transliteration).
 */

import type { Dict } from './en';

const bn: Dict = {
  nav: {
    findTeacher: 'শিক্ষক খুঁজুন',
    courses: 'কোর্স',
    pricing: 'মূল্য তালিকা',
    aiTutor: 'AI টিউটর',
    dashboard: 'ড্যাশবোর্ড',
    teach: 'পড়ান',
    research: 'গবেষণা',
    researchATopic: 'বিষয়ে গবেষণা করুন',
    signIn: 'সাইন ইন করুন',
    signOut: 'সাইন আউট করুন',
    getStartedFree: 'বিনামূল্যে শুরু করুন',
    myAccount: 'আমার অ্যাকাউন্ট',
    openMenu: 'মেনু খুলুন',
    closeMenu: 'মেনু বন্ধ করুন',
    normalTextSize: 'সাধারণ টেক্সট আকার',
    largerTextSize: 'বড় টেক্সট আকার',
    switchToNormal: 'সাধারণ টেক্সট আকারে যান',
    switchToLarger: 'বড় টেক্সট আকারে যান',
    normalText: 'সাধারণ টেক্সট',
    largerText: 'বড় টেক্সট',
    chooseLanguage: 'ভাষা বেছে নিন',
  },

  landing: {
    trustBadge: '১৮,০০০+ পরিবারের বিশ্বাস',
    heroHeading: 'একজীবনের দক্ষতা হয়ে ওঠে\nপরবর্তী প্রজন্মের এগিয়ে থাকার সুযোগ।',
    heroSubheading:
      'আপনার সন্তানকে অবসরপ্রাপ্ত ডাক্তার, প্রকৌশলী, লেখক এবং অধ্যাপকদের সাথে সংযুক্ত করুন যারা প্রতিটি পাঠে বাস্তব জীবনের গভীরতা নিয়ে আসেন।',
    heroCta: 'শিক্ষক খুঁজুন',
    heroCtaTeacher: 'মেন্টর হন',
    trustSignals: 'ব্রাউজ করা বিনামূল্যে · ক্রেডিট কার্ডের প্রয়োজন নেই · যেকোনো সময় বাতিল করুন',

    statMentors: 'বিশেষজ্ঞ মেন্টর',
    statStudents: 'শিক্ষার্থী শিখছে',
    statRating: 'গড় শিক্ষকের রেটিং',
    statSubjects: 'বিষয় পাওয়া যায়',

    forFamilies: 'পরিবারগুলোর জন্য',
    learnerSectionHeading: 'শেখা যা সত্যিই বোধগম্য হয়',
    learnerSectionSub: 'কৌতূহলী শিশু থেকে আত্মবিশ্বাসী শিক্ষার্থী পর্যন্ত — মাত্র তিনটি সহজ ধাপ।',
    step: 'ধাপ',
    browseRealExpertsTitle: 'আসল বিশেষজ্ঞ খুঁজুন',
    browseRealExpertsDesc:
      'অবসরপ্রাপ্ত ডাক্তার, প্রকৌশলী, লেখক এবং অধ্যাপক খুঁজুন যারা শিশুদের পড়াতে ভালোবাসেন।',
    joinClassTitle: 'ক্লাসে যোগ দিন বা ১:১ বুক করুন',
    joinClassDesc:
      'লাইভ গ্রুপ ক্লাসরুমে যোগ দিন বা ব্যক্তিগত কোচিং সেশন বুক করুন — আপনার সময়সূচি, আপনার গতিতে।',
    learnGrowTitle: 'শিখুন এবং এগিয়ে যান',
    learnGrowDesc:
      'AI টিউটরের সাথে অনুশীলন করুন, উপকরণ ডাউনলোড করুন এবং অগ্রগতি ট্র্যাক করুন — সব একটি জায়গায়।',
    browseTeachers: 'শিক্ষক দেখুন',

    featuredMentors: 'বিশেষ মেন্টর',
    meetExperts: 'আমাদের কিছু বিশেষজ্ঞের সাথে পরিচিত হন',
    seeAllTeachers: 'সব শিক্ষক দেখুন',

    everySubjectHeading: 'আপনার সন্তানের প্রয়োজনীয় প্রতিটি বিষয়',
    everySubjectSub: 'গণিত থেকে জীবন দক্ষতা পর্যন্ত — যারা এটি বেঁচেছেন তাদের দ্বারা শেখানো হয়।',

    forRetiredPros: 'অবসরপ্রাপ্ত পেশাদারদের জন্য',
    teacherSectionHeading: 'আপনার ক্যারিয়ারকে আয়ে পরিণত করুন',
    teacherSectionSub:
      'আপনার দশকের অভিজ্ঞতা ঠিক যা শিক্ষার্থীরা খুঁজছে।\n      শুরু থেকে পাঠ পরিকল্পনা নয় — প্রযুক্তি আমরা সামলাব, আপনি পড়ান।',
    createProfileTitle: 'আপনার প্রোফাইল তৈরি করুন',
    createProfileDesc:
      'আপনার ক্যারিয়ারের গল্প, বিষয় এবং পড়ানোর ধরন শেয়ার করুন। এটি ১০ মিনিটের কম সময় নেয়।',
    uploadMaterialsTitle: 'আপনার উপকরণ আপলোড করুন',
    uploadMaterialsDesc:
      'আপনার PDF এবং নোটগুলো দিন। আমাদের AI সেগুলো স্ক্যান করে ব্যবহারের জন্য প্রস্তুত কোর্স তৈরি করে।',
    earnWhileInspireTitle: 'অনুপ্রাণিত করার সাথে সাথে উপার্জন করুন',
    earnWhileInspireDesc:
      'সেশন নির্ধারণ করুন, আপনার মূল্য নির্ধারণ করুন এবং আপনার উপার্জনের ৯০% পর্যন্ত রাখুন। কোনো প্রযুক্তিগত দক্ষতার প্রয়োজন নেই।',
    startTeachingToday: 'আজই পড়ানো শুরু করুন',

    testimonialQuote:
      '"আমার মেয়ে গণিতকে ভয় পেত, এখন সে অতিরিক্ত সেশনের জন্য বলে। তার মেন্টর একজন অবসরপ্রাপ্ত প্রকৌশলী যার ৪০ বছরের ধৈর্য আছে।"',
    testimonialAuthor: '— সারা এম., ৫ম শ্রেণির শিক্ষার্থীর মা',
    getStartedFree: 'বিনামূল্যে শুরু করুন',
    viewPlans: 'পরিকল্পনা দেখুন',
  },

  auth: {
    welcomeBack: 'আবার স্বাগতম',
    signInSubtitle: 'শেখা চালিয়ে যেতে আপনার অ্যাকাউন্টে সাইন ইন করুন।',
    emailAddress: 'ইমেইল ঠিকানা',
    password: 'পাসওয়ার্ড',
    forgotPassword: 'পাসওয়ার্ড ভুলে গেছেন?',
    signIn: 'সাইন ইন করুন',
    noAccount: 'অ্যাকাউন্ট নেই?',
    createOneFree: 'বিনামূল্যে তৈরি করুন',

    createFreeAccount: 'আপনার বিনামূল্যে অ্যাকাউন্ট তৈরি করুন',
    signupSubtitle: 'ক্রেডিট কার্ডের প্রয়োজন নেই। কয়েক সেকেন্ডে শুরু করুন।',
    iAmHereTo: 'আমি এখানে এসেছি…',
    iWantToLearn: 'আমি শিখতে চাই',
    iWantToLearnDesc: 'আমি একজন শিক্ষার্থী বা অভিভাবক যিনি বিশেষজ্ঞ শিক্ষক খুঁজছেন।',
    iWantToTeach: 'আমি পড়াতে চাই',
    iWantToTeachDesc: 'আমি একজন অবসরপ্রাপ্ত পেশাদার যিনি তার দক্ষতা শেয়ার করতে চান।',
    fullName: 'পুরো নাম',
    createAccount: 'অ্যাকাউন্ট তৈরি করুন',
    termsNote: 'অ্যাকাউন্ট তৈরি করে আপনি আমাদের সাথে সম্মত হচ্ছেন',
    terms: 'শর্তাবলী',
    and: 'এবং',
    privacyPolicy: 'গোপনীয়তা নীতি',
    alreadyHaveAccount: 'ইতিমধ্যে অ্যাকাউন্ট আছে?',

    welcomeToMentora: 'Mentora-তে স্বাগতম!',
  },

  tutor: {
    title: 'AI টিউটর',
    subtitle: 'যেকোনো কিছু জিজ্ঞেস করুন — আমি আপনাকে শিখতে সাহায্য করতে এখানে আছি।',
    signInForUnlimited: 'সীমাহীন প্রশ্নের জন্য সাইন ইন করুন',
    makeAQuiz: 'কুইজ তৈরি করুন',
    explainSimply: 'সহজভাবে বোঝান',
    summariseForMe: 'সারসংক্ষেপ দিন',
    newChat: 'নতুন কথোপকথন',
    startNewConversation: 'নতুন কথোপকথন শুরু করুন',
    typeYourQuestion: 'আপনার প্রশ্ন টাইপ করুন',
    sendMessage: 'বার্তা পাঠান',
    send: 'পাঠান',
    inputPlaceholder: 'যেকোনো কিছু জিজ্ঞেস করুন… (পাঠাতে Enter, নতুন লাইনের জন্য Shift+Enter)',
    explanation: 'ব্যাখ্যা',
    tip1: 'যেকোনো সময় অনুসরণ করে প্রশ্ন করুন — আমি আমাদের কথোপকথন মনে রাখি।',
    tip2: '"ভগ্নাংশে কুইজ তৈরি করো" বলুন এবং আমি একটি ইন্টারেক্টিভ অনুশীলন পরীক্ষা তৈরি করব।',
    tip3: 'সহজ ব্যাখ্যার জন্য "৮ বছরের মতো বোঝাও" বলুন।',
  },

  research: {
    title: 'বিষয়ে গবেষণা করুন',
    subtitle: 'যেকোনো বিষয় টাইপ করুন — Mentora লাইভ ওয়েব গবেষণা করে আপনার জন্য একটি পাঠ তৈরি করে।',
    whatTopicLabel: 'আপনি কোন বিষয়ে গবেষণা করতে চান?',
    topicPlaceholder: 'যেমন: জলচক্র, প্রথম বিশ্বযুদ্ধ, ভগ্নাংশ, সালোকসংশ্লেষণ…',
    topicHint: 'যতটা নির্দিষ্ট হতে পারেন — যত বিস্তারিত, ততটা ভালো সংক্ষিপ্তসার।',
    subjectLabel: 'বিষয় (ঐচ্ছিক)',
    gradeLabel: 'শ্রেণি স্তর (ঐচ্ছিক)',
    anySubject: 'যেকোনো বিষয় (ঐচ্ছিক)',
    anyGrade: 'যেকোনো শ্রেণি (ঐচ্ছিক)',
    researchThisTopic: 'এই বিষয়ে গবেষণা করুন',
    searchingWeb: 'ওয়েব অনুসন্ধান করা হচ্ছে এবং আপনার সংক্ষিপ্তসার লেখা হচ্ছে…',
    researchingTopic: 'বিষয়ে গবেষণা করা হচ্ছে…',
    usuallyTakes: 'এটি সাধারণত ১০–২০ সেকেন্ড সময় নেয়।',
    tip1: 'Mentora লাইভ ওয়েব অনুসন্ধান করে এবং প্রতিটি উৎসের তথ্যসূত্র দেয় যাতে আপনি তথ্য যাচাই করতে পারেন।',
    tip2: 'আপনি একটি ব্যবহারের জন্য প্রস্তুত পাঠ পরিকল্পনা পান যা আপনি এক ক্লিকে পূর্ণ কোর্সে পরিণত করতে পারেন।',
    tip3: 'বয়স-উপযুক্ত ভাষা ও উদাহরণের জন্য একটি নির্দিষ্ট শ্রেণি স্তর চেষ্টা করুন।',
    overview: 'সংক্ষিপ্ত বিবরণ',
    keyPoints: 'মূল বিষয়গুলো',
    suggestedLessonPlan: 'প্রস্তাবিত পাঠ পরিকল্পনা',
    sources: 'উৎস',
    liveWebBadge: 'লাইভ ওয়েব',
    exampleSourcesBadge: 'উদাহরণ উৎস — লাইভ ওয়েব ফলাফলের জন্য সার্চ API কী যোগ করুন',
    noSourcesAvailable: 'এই সংক্ষিপ্তসারের জন্য কোনো উৎস পাওয়া যায়নি।',
    teacherReadyBriefing: 'এখানে আপনার শিক্ষক-প্রস্তুত সংক্ষিপ্তসার।',
    researchAnotherTopic: 'আরেকটি বিষয়ে গবেষণা করুন',
    turnIntoCourse: 'এটিকে কোর্সে পরিণত করুন',
    copyBriefing: 'সংক্ষিপ্তসার কপি করুন',
    copied: 'কপি হয়ে গেছে!',
  },

  footer: {
    learnCol: 'শিখুন',
    teachCol: 'পড়ান',
    companyCol: 'কোম্পানি',
    findTeacher: 'শিক্ষক খুঁজুন',
    browseCourses: 'কোর্স দেখুন',
    plansAndPricing: 'পরিকল্পনা ও মূল্য তালিকা',
    aiTutor: 'AI টিউটর',
    becomeAMentor: 'মেন্টর হন',
    uploadMaterials: 'উপকরণ আপলোড করুন',
    createACourse: 'কোর্স তৈরি করুন',
    teacherPlans: 'শিক্ষকের পরিকল্পনা',
    pricing: 'মূল্য তালিকা',
    support: 'সহায়তা',
    allRightsReserved: 'সর্বস্বত্ব সংরক্ষিত।',
  },

  common: {
    signIn: 'সাইন ইন করুন',
    getStartedFree: 'বিনামূল্যে শুরু করুন',
    loading: 'লোড হচ্ছে…',
  },
};

export default bn;
