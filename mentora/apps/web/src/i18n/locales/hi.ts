/**
 * Hindi (हिन्दी) locale — implements the same keys as en.ts.
 * All values use natural Devanagari script (not transliteration).
 */

import type { Dict } from './en';

const hi: Dict = {
  nav: {
    findTeacher: 'शिक्षक खोजें',
    courses: 'पाठ्यक्रम',
    pricing: 'मूल्य निर्धारण',
    aiTutor: 'AI शिक्षक',
    dashboard: 'डैशबोर्ड',
    teach: 'पढ़ाएँ',
    research: 'शोध',
    researchATopic: 'विषय पर शोध करें',
    signIn: 'साइन इन करें',
    signOut: 'साइन आउट करें',
    getStartedFree: 'निःशुल्क शुरू करें',
    myAccount: 'मेरा खाता',
    openMenu: 'मेनू खोलें',
    closeMenu: 'मेनू बंद करें',
    normalTextSize: 'सामान्य टेक्स्ट आकार',
    largerTextSize: 'बड़ा टेक्स्ट आकार',
    switchToNormal: 'सामान्य टेक्स्ट आकार पर जाएँ',
    switchToLarger: 'बड़े टेक्स्ट आकार पर जाएँ',
    normalText: 'सामान्य टेक्स्ट',
    largerText: 'बड़ा टेक्स्ट',
    chooseLanguage: 'भाषा चुनें',
  },

  landing: {
    trustBadge: '18,000+ परिवारों का भरोसा',
    heroHeading: 'एक जीवन की विशेषज्ञता बन जाती है\nअगली पीढ़ी की शुरुआत।',
    heroSubheading:
      'अपने बच्चे को सेवानिवृत्त डॉक्टरों, इंजीनियरों, लेखकों और प्रोफेसरों से जोड़ें जो हर पाठ में वास्तविक जीवन की गहराई लाते हैं।',
    heroCta: 'शिक्षक खोजें',
    heroCtaTeacher: 'मेंटर बनें',
    trustSignals: 'ब्राउज़ करना निःशुल्क · क्रेडिट कार्ड की जरूरत नहीं · कभी भी रद्द करें',

    statMentors: 'विशेषज्ञ मेंटर',
    statStudents: 'छात्र सीख रहे हैं',
    statRating: 'औसत शिक्षक रेटिंग',
    statSubjects: 'विषय उपलब्ध',

    forFamilies: 'परिवारों के लिए',
    learnerSectionHeading: 'सीखना जो वास्तव में समझ आए',
    learnerSectionSub: 'जिज्ञासु बच्चे से आत्मविश्वासी सीखने वाले तक — बस तीन आसान कदम।',
    step: 'चरण',
    browseRealExpertsTitle: 'असली विशेषज्ञ खोजें',
    browseRealExpertsDesc:
      'सेवानिवृत्त डॉक्टर, इंजीनियर, लेखक और प्रोफेसर खोजें जो बच्चों को पढ़ाना पसंद करते हैं।',
    joinClassTitle: 'कक्षा में शामिल हों या 1:1 बुक करें',
    joinClassDesc:
      'लाइव ग्रुप कक्षा में शामिल हों या व्यक्तिगत कोचिंग सत्र बुक करें — आपका शेड्यूल, आपकी गति।',
    learnGrowTitle: 'सीखें और आगे बढ़ें',
    learnGrowDesc:
      'AI शिक्षक के साथ अभ्यास करें, सामग्री डाउनलोड करें और प्रगति ट्रैक करें — सब एक जगह।',
    browseTeachers: 'शिक्षकों को देखें',

    featuredMentors: 'विशेष मेंटर',
    meetExperts: 'हमारे कुछ विशेषज्ञों से मिलें',
    seeAllTeachers: 'सभी शिक्षक देखें',

    everySubjectHeading: 'हर वो विषय जो आपके बच्चे को चाहिए',
    everySubjectSub: 'गणित से लेकर जीवन कौशल तक — उन लोगों द्वारा पढ़ाया जाता है जिन्होंने इसे जिया है।',

    forRetiredPros: 'सेवानिवृत्त पेशेवरों के लिए',
    teacherSectionHeading: 'अपने करियर को आय में बदलें',
    teacherSectionSub:
      'आपका दशकों का अनुभव ठीक वही है जो छात्र खोज रहे हैं।\n      शुरू से पाठ योजनाएँ नहीं — तकनीक हम संभालेंगे, आप पढ़ाएँ।',
    createProfileTitle: 'अपनी प्रोफ़ाइल बनाएँ',
    createProfileDesc:
      'अपनी करियर कहानी, विषय और पढ़ाने की शैली साझा करें। इसमें 10 मिनट से कम लगता है।',
    uploadMaterialsTitle: 'अपनी सामग्री अपलोड करें',
    uploadMaterialsDesc:
      'अपने PDF और नोट्स डालें। हमारा AI उन्हें स्कैन करके उपयोग के लिए तैयार पाठ्यक्रम बनाता है।',
    earnWhileInspireTitle: 'प्रेरित करते हुए कमाएँ',
    earnWhileInspireDesc:
      'सत्र शेड्यूल करें, अपनी कीमत तय करें, और जो आप कमाते हैं उसका 90% तक रखें। तकनीकी कौशल की जरूरत नहीं।',
    startTeachingToday: 'आज पढ़ाना शुरू करें',

    testimonialQuote:
      '"मेरी बेटी गणित से डरती थी, अब वो अतिरिक्त सत्रों के लिए कहती है। उसके मेंटर एक सेवानिवृत्त इंजीनियर हैं जिनके पास 40 साल का धैर्य है।"',
    testimonialAuthor: '— सारा एम., कक्षा 5 की छात्र की माँ',
    getStartedFree: 'निःशुल्क शुरू करें',
    viewPlans: 'प्लान देखें',
  },

  auth: {
    welcomeBack: 'वापसी पर स्वागत है',
    signInSubtitle: 'सीखना जारी रखने के लिए अपने खाते में साइन इन करें।',
    emailAddress: 'ईमेल पता',
    password: 'पासवर्ड',
    forgotPassword: 'पासवर्ड भूल गए?',
    signIn: 'साइन इन करें',
    noAccount: 'खाता नहीं है?',
    createOneFree: 'मुफ्त में बनाएँ',

    createFreeAccount: 'अपना निःशुल्क खाता बनाएँ',
    signupSubtitle: 'क्रेडिट कार्ड की जरूरत नहीं। कुछ सेकंड में शुरू करें।',
    iAmHereTo: 'मैं यहाँ हूँ…',
    iWantToLearn: 'मैं सीखना चाहता/चाहती हूँ',
    iWantToLearnDesc: 'मैं एक छात्र या अभिभावक हूँ जो विशेषज्ञ शिक्षक खोज रहा/रही है।',
    iWantToTeach: 'मैं पढ़ाना चाहता/चाहती हूँ',
    iWantToTeachDesc: 'मैं एक सेवानिवृत्त पेशेवर हूँ जो अपनी विशेषज्ञता साझा करना चाहता/चाहती है।',
    fullName: 'पूरा नाम',
    createAccount: 'खाता बनाएँ',
    termsNote: 'खाता बनाने पर आप हमारी सहमति देते हैं',
    terms: 'नियम',
    and: 'और',
    privacyPolicy: 'गोपनीयता नीति',
    alreadyHaveAccount: 'पहले से खाता है?',

    welcomeToMentora: 'Mentora में आपका स्वागत है!',
  },

  tutor: {
    title: 'AI शिक्षक',
    subtitle: 'कुछ भी पूछें — मैं आपकी मदद के लिए यहाँ हूँ।',
    signInForUnlimited: 'असीमित प्रश्नों के लिए साइन इन करें',
    makeAQuiz: 'क्विज़ बनाएँ',
    explainSimply: 'सरल भाषा में समझाएँ',
    summariseForMe: 'सारांश दें',
    newChat: 'नई बातचीत',
    startNewConversation: 'नई बातचीत शुरू करें',
    typeYourQuestion: 'अपना प्रश्न टाइप करें',
    sendMessage: 'संदेश भेजें',
    send: 'भेजें',
    inputPlaceholder: 'कुछ भी पूछें… (भेजने के लिए Enter, नई लाइन के लिए Shift+Enter)',
    explanation: 'व्याख्या',
    tip1: 'कभी भी आगे के प्रश्न पूछें — मुझे हमारी बातचीत याद रहती है।',
    tip2: '"भिन्नों पर क्विज़ बनाओ" कहें और मैं एक इंटरैक्टिव अभ्यास परीक्षण बनाऊँगा।',
    tip3: 'बहुत सरल समझाने के लिए "8 साल के बच्चे को समझाओ" कहें।',
  },

  research: {
    title: 'विषय पर शोध करें',
    subtitle: 'कोई भी विषय टाइप करें — Mentora लाइव वेब पर शोध करके आपके लिए पाठ तैयार करता है।',
    whatTopicLabel: 'आप किस विषय पर शोध करना चाहेंगे?',
    topicPlaceholder: 'जैसे: जल चक्र, प्रथम विश्व युद्ध, भिन्न, प्रकाश संश्लेषण…',
    topicHint: 'जितना विस्तृत हो उतना लिखें — जितना विवरण, उतना बेहतर संक्षिप्त विवरण।',
    subjectLabel: 'विषय (वैकल्पिक)',
    gradeLabel: 'कक्षा स्तर (वैकल्पिक)',
    anySubject: 'कोई भी विषय (वैकल्पिक)',
    anyGrade: 'कोई भी कक्षा (वैकल्पिक)',
    researchThisTopic: 'इस विषय पर शोध करें',
    searchingWeb: 'वेब पर खोज कर रहे हैं और आपका संक्षिप्त विवरण लिख रहे हैं…',
    researchingTopic: 'विषय पर शोध हो रहा है…',
    usuallyTakes: 'इसमें आमतौर पर 10–20 सेकंड लगते हैं।',
    tip1: 'Mentora लाइव वेब पर खोजता है और हर स्रोत का हवाला देता है ताकि आप तथ्य जाँच सकें।',
    tip2: 'आपको एक उपयोग के लिए तैयार पाठ योजना मिलती है जिसे आप एक क्लिक में पूरे पाठ्यक्रम में बदल सकते हैं।',
    tip3: 'उम्र-उपयुक्त भाषा और उदाहरणों के लिए एक विशेष कक्षा स्तर आज़माएँ।',
    overview: 'अवलोकन',
    keyPoints: 'मुख्य बिंदु',
    suggestedLessonPlan: 'सुझावित पाठ योजना',
    sources: 'स्रोत',
    liveWebBadge: 'लाइव वेब',
    exampleSourcesBadge: 'उदाहरण स्रोत — लाइव वेब परिणामों के लिए सर्च API कुंजी जोड़ें',
    noSourcesAvailable: 'इस संक्षिप्त विवरण के लिए कोई स्रोत उपलब्ध नहीं है।',
    teacherReadyBriefing: 'यहाँ आपका शिक्षक के लिए तैयार संक्षिप्त विवरण है।',
    researchAnotherTopic: 'दूसरे विषय पर शोध करें',
    turnIntoCourse: 'इसे पाठ्यक्रम में बदलें',
    copyBriefing: 'संक्षिप्त विवरण कॉपी करें',
    copied: 'कॉपी हो गया!',
  },

  footer: {
    learnCol: 'सीखें',
    teachCol: 'पढ़ाएँ',
    companyCol: 'कंपनी',
    findTeacher: 'शिक्षक खोजें',
    browseCourses: 'पाठ्यक्रम देखें',
    plansAndPricing: 'योजनाएँ और मूल्य निर्धारण',
    aiTutor: 'AI शिक्षक',
    becomeAMentor: 'मेंटर बनें',
    uploadMaterials: 'सामग्री अपलोड करें',
    createACourse: 'पाठ्यक्रम बनाएँ',
    teacherPlans: 'शिक्षक योजनाएँ',
    pricing: 'मूल्य निर्धारण',
    support: 'सहायता',
    allRightsReserved: 'सर्वाधिकार सुरक्षित।',
  },

  common: {
    signIn: 'साइन इन करें',
    getStartedFree: 'निःशुल्क शुरू करें',
    loading: 'लोड हो रहा है…',
  },
};

export default hi;
