export type Language = 'ne' | 'en';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Translations {
  // Header
  appName: string;
  signIn: string;
  
  // Main page
  enhance: string;
  history: string;
  text: string;
  suggestions: string;
  newText: string;
  enhanceText: string;
  signInToEnhance: string;
  analyzing: string;
  noSuggestions: string;
  analysisFailed: string;
  keyboardShortcuts: string;
  navigate: string;
  accept: string;
  reject: string;
  
  // Feature showcase
  heroTitle: string;
  heroSubtitle: string;
  fixErrors: string;
  improveStyle: string;
  saveWork: string;
  typeFaster: string;
  
  // FAQ
  faqTitle: string;
  faqSubtitle: string;
  stillHaveQuestions: string;
  contactSupport: string;
  faqData: FAQItem[];
  
  // Auth
  login: string;
  signup: string;
  emailAddress: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  enterEmail: string;
  enterPassword: string;
  confirmPasswordPlaceholder: string;
  enterFullName: string;
  forgotPassword: string;
  createAccount: string;
  welcomeBack: string;
  joinThousands: string;
  
  // Dialog
  startNewText: string;
  startNewTextDescription: string;
  cancel: string;
  
  // Messages
  pleaseEnterText: string;
  pleaseSignIn: string;
  textAnalyzedSuccessfully: string;
  noSuggestionsFound: string;
  readyForNewText: string;
  welcome: string;
  
  // View modes
  listView: string;
  navigateView: string;
  listViewTooltip: string;
  navigateViewTooltip: string;
  
  // Language toggle
  language: string;
  nepali: string;
  english: string;
}

export const translations: Record<Language, Translations> = {
  ne: {
    // Header
    appName: 'व्याकरणली',
    signIn: 'साइन इन',
    
    // Main page
    enhance: 'सुधार',
    history: 'इतिहास',
    text: 'पाठ',
    suggestions: 'सुझावहरू',
    newText: 'नयाँ पाठ',
    enhanceText: 'पाठ सुधार्नुहोस्',
    signInToEnhance: 'सुधार गर्न साइन इन गर्नुहोस्',
    analyzing: 'विश्लेषण गर्दै...',
    noSuggestions: 'कुनै सुझाव छैन',
    analysisFailed: 'विश्लेषण असफल भयो। कृपया फेरि प्रयास गर्नुहोस्।',
    keyboardShortcuts: 'किबोर्ड सर्टकटहरू',
    navigate: 'नेभिगेट',
    accept: 'स्वीकार',
    reject: 'अस्वीकार',
    
    // Feature showcase
    heroTitle: 'सजिलै सुधार्नुहोस् नेपाली लेखाइ',
    heroSubtitle: 'तुरुन्तै राम्रो नेपाली लेख्नुहोस्। व्याकरणली प्रयोग गर्न सुरु गर्न निःशुल्क साइन अप गर्नुहोस्।',
    fixErrors: 'त्रुटि सुधार',
    improveStyle: 'शैली सुधार',
    saveWork: 'काम सेभ गर्नुहोस्',
    typeFaster: 'छिटो टाइप गर्नुहोस्',
    
    // FAQ
    faqTitle: 'बारम्बार सोधिने प्रश्नहरू',
    faqSubtitle: 'व्याकरणली र तपाईंको नेपाली लेखाइ सुधार गर्ने बारेमा जान्नुपर्ने सबै कुरा',
    stillHaveQuestions: 'अझै प्रश्नहरू छन्?',
    contactSupport: 'सहयोग सम्पर्क गर्नुहोस्',
    faqData: [
      {
        question: "व्याकरणलीले मेरो नेपाली लेखाइ कसरी सुधार गर्न मद्दत गर्छ?",
        answer: "व्याकरणलीले उन्नत AI प्रयोग गरेर तपाईंको नेपाली पाठको विश्लेषण गर्छ र व्याकरण सुधार, शैली सुधार, र राम्रो शब्द छनोटका लागि सुझावहरू प्रदान गर्छ। यसले तपाईंलाई देवनागरी लिपिमा अधिक आत्मविश्वासका साथ लेख्न मद्दत गर्छ र उचित नेपाली व्याकरण नियमहरू सिक्न सहायता गर्छ।"
      },
      {
        question: "के म अंग्रेजीमा टाइप गरेर नेपाली पाठ पाउन सक्छु?",
        answer: "हो! व्याकरणलीले रोमानाइज्ड इनपुटलाई समर्थन गर्छ, जसले तपाईंलाई अंग्रेजी अक्षरहरूमा टाइप गर्न अनुमति दिन्छ जुन स्वचालित रूपमा नेपाली देवनागरी लिपिमा रूपान्तरण हुन्छ। उदाहरणका लागि, 'namaste' टाइप गर्दा 'नमस्ते' मा रूपान्तरण हुनेछ। यसले जो कोहीलाई पनि नेपालीमा लेख्न सजिलो बनाउँछ।"
      },
      {
        question: "के मेरो पाठ डेटा सुरक्षित र निजी छ?",
        answer: "बिल्कुल। हामी तपाईंको गोपनीयतालाई गम्भीरताका साथ लिन्छौं। तपाईंको पाठ सुरक्षित रूपमा प्रशोधन गरिन्छ र हाम्रो सर्भरमा स्थायी रूपमा भण्डारण गरिँदैन। हामी एन्टरप्राइज-ग्रेड एन्क्रिप्शन प्रयोग गर्छौं र तपाईंको लेखाइ गोपनीय रहने सुनिश्चित गर्न कडा डेटा सुरक्षा प्रोटोकलहरू पालना गर्छौं।"
      },
      {
        question: "के मलाई व्याकरणली प्रयोग गर्न खाता सिर्जना गर्नुपर्छ?",
        answer: "हो, तपाईंलाई व्याकरणली प्रयोग गर्न निःशुल्क खाता सिर्जना गर्नुपर्छ। यसले हामीलाई तपाईंलाई व्यक्तिगत सुझावहरू प्रदान गर्न, तपाईंको लेखाइ इतिहास सुरक्षित गर्न, र उन्नत व्याकरण विश्लेषण र किबोर्ड सर्टकटहरू सहित सबै सुविधाहरूमा पहुँच दिन अनुमति दिन्छ।"
      },
      {
        question: "व्याकरण र शैली सुझावहरू कत्तिको सटीक छन्?",
        answer: "हाम्रो AI विशेष रूपमा नेपाली भाषाका ढाँचाहरू र व्याकरण नियमहरूमा प्रशिक्षित छ। हामी उच्च सटीकताका लागि प्रयास गर्छौं, तर भाषा सन्दर्भगत हुन सक्छ भनेर हामी सुझावहरूको समीक्षा गर्न सिफारिस गर्छौं। प्रणालीले निरन्तर सिक्छ र प्रयोग ढाँचाहरूबाट सुधार गर्छ।"
      },
      {
        question: "के म विभिन्न प्रकारका लेखाइका लागि व्याकरणली प्रयोग गर्न सक्छु?",
        answer: "हाल, व्याकरणलीले सामान्य नेपाली व्याकरण र शैली सुझावहरू प्रदान गर्छ। हामी औपचारिक कागजातहरू, रचनात्मक लेखन, र शैक्षणिक पत्रहरू जस्ता विभिन्न लेखन शैलीहरूका लागि समर्थन थप्ने काममा छौं। यी रोमाञ्चक सुविधाहरूका लागि प्रतीक्षा गर्नुहोस्!"
      },
      {
        question: "के मैले विश्लेषण गर्न सक्ने पाठको मात्रामा सीमा छ?",
        answer: "हाल, तपाईंले कति पाठ विश्लेषण गर्न सक्नुहुन्छ त्यसमा कुनै सीमा छैन - यो पूर्ण रूपमा असीमित छ! तथापि, हामी सबै प्रयोगकर्ताहरूका लागि दिगो सेवा सुनिश्चित गर्न भविष्यमा प्रयोग स्तरहरू परिचय गराउने योजना बनाइरहेका छौं।"
      },
      {
        question: "कुन ब्राउजरहरू र उपकरणहरू समर्थित छन्?",
        answer: "व्याकरणली Chrome, Firefox, Safari, र Edge सहित सबै आधुनिक वेब ब्राउजरहरूमा काम गर्छ। यो पूर्ण रूपमा उत्तरदायी छ र डेस्कटप कम्प्युटर, ट्याब्लेट, र मोबाइल फोनहरूमा यात्रामा लेख्नका लागि काम गर्छ।"
      },
      {
        question: "म रोमानाइज्ड किबोर्ड लेआउट कसरी सिक्छु?",
        answer: "हामी एक अन्तरक्रियात्मक किबोर्ड गाइड प्रदान गर्छौं जसले तपाईंलाई देखाउँछ कि अंग्रेजी अक्षरहरू नेपाली देवनागरी लिपिमा कसरी म्याप हुन्छन्। तपाईं लेख्दा जुनसुकै बेला यो गाइडमा पहुँच गर्न सक्नुहुन्छ, र अभ्यासको साथ, नेपालीमा टाइप गर्नु दोस्रो प्रकृति बन्छ।"
      },
      {
        question: "के म मेरो सुधारिएको पाठ निर्यात वा सुरक्षित गर्न सक्छु?",
        answer: "हो! तपाईं सजिलै आफ्नो सुधारिएको पाठ प्रतिलिपि गर्न र जहाँ चाहनुहुन्छ प्रयोग गर्न सक्नुहुन्छ। तपाईंको लेखाइ इतिहास स्वचालित रूपमा तपाईंको खातामा सुरक्षित गरिन्छ, त्यसैले तपाईं भविष्यको सन्दर्भका लागि सधैं आफ्ना अघिल्ला पाठहरू र सुधारहरूमा पहुँच गर्न सक्नुहुन्छ।"
      }
    ],
    
    // Auth
    login: 'लग इन',
    signup: 'साइन अप',
    emailAddress: 'इमेल ठेगाना',
    password: 'पासवर्ड',
    confirmPassword: 'पासवर्ड पुष्टि गर्नुहोस्',
    fullName: 'पूरा नाम',
    enterEmail: 'तपाईंको इमेल प्रविष्ट गर्नुहोस्',
    enterPassword: 'तपाईंको पासवर्ड प्रविष्ट गर्नुहोस्',
    confirmPasswordPlaceholder: 'पासवर्ड पुष्टि गर्नुहोस्',
    enterFullName: 'तपाईंको पूरा नाम प्रविष्ट गर्नुहोस्',
    forgotPassword: 'पासवर्ड बिर्सनुभयो?',
    createAccount: 'खाता सिर्जना गर्नुहोस्',
    welcomeBack: 'फिर्ता स्वागत छ!',
    joinThousands: 'AI सँग आफ्नो नेपाली लेखाइ सुधार गर्ने हजारौं प्रयोगकर्ताहरूमा सामेल हुनुहोस्',
    
    // Dialog
    startNewText: 'नयाँ पाठ सुरु गर्नुहोस्?',
    startNewTextDescription: 'यसले हालका सुझावहरू हटाउनेछ। तपाईंको काम इतिहासमा सुरक्षित छ।',
    cancel: 'रद्द गर्नुहोस्',
    
    // Messages
    pleaseEnterText: 'कृपया विश्लेषण गर्न केही पाठ प्रविष्ट गर्नुहोस्',
    pleaseSignIn: 'कृपया आफ्नो पाठ सुधार गर्न साइन इन गर्नुहोस्',
    textAnalyzedSuccessfully: 'पाठ सफलतापूर्वक विश्लेषण गरियो',
    noSuggestionsFound: 'दिइएको पाठको लागि कुनै सुझाव फेला परेन',
    readyForNewText: 'नयाँ पाठको लागि तयार! तपाईंको अघिल्लो काम इतिहासमा सुरक्षित छ।',
    welcome: 'स्वागत छ',
    
    // View modes
    listView: 'सूची दृश्य',
    navigateView: 'नेभिगेट दृश्य',
    listViewTooltip: 'सूची दृश्य - सबै सुझावहरू देखाउनुहोस्',
    navigateViewTooltip: 'नेभिगेट दृश्य - एक एक गरेर समीक्षा गर्नुहोस्',
    
    // Language toggle
    language: 'भाषा',
    nepali: 'नेपाली',
    english: 'अंग्रेजी',
  },
  en: {
    // Header
    appName: 'Vyakaranly',
    signIn: 'Sign In',
    
    // Main page
    enhance: 'Enhance',
    history: 'History',
    text: 'Text',
    suggestions: 'Suggestions',
    newText: 'New Text',
    enhanceText: 'Enhance Text',
    signInToEnhance: 'Sign In to Enhance',
    analyzing: 'Analyzing...',
    noSuggestions: 'No suggestions',
    analysisFailed: 'Analysis failed. Please try again.',
    keyboardShortcuts: 'Keyboard Shortcuts',
    navigate: 'Navigate',
    accept: 'Accept',
    reject: 'Reject',
    
    // Feature showcase
    heroTitle: 'Write Better Nepali Instantly',
    heroSubtitle: 'Write better Nepali instantly. Sign up free to start using Vyakaranly.',
    fixErrors: 'Fix Errors',
    improveStyle: 'Improve Style',
    saveWork: 'Save Work',
    typeFaster: 'Type Faster',
    
    // FAQ
    faqTitle: 'Frequently Asked Questions',
    faqSubtitle: 'Everything you need to know about Vyakaranly and improving your Nepali writing',
    stillHaveQuestions: 'Still have questions?',
    contactSupport: 'Contact Support',
    faqData: [
      {
        question: "How does Vyakaranly help improve my Nepali writing?",
        answer: "Vyakaranly uses advanced AI to analyze your Nepali text and provide suggestions for grammar corrections, style improvements, and better word choices. It helps you write more confidently in Devanagari script while learning proper Nepali grammar rules."
      },
      {
        question: "Can I type in English and get Nepali text?",
        answer: "Yes! Vyakaranly supports romanized input, allowing you to type in English characters that automatically convert to Nepali Devanagari script. For example, typing 'namaste' will convert to 'नमस्ते'. This makes it easy for anyone to write in Nepali."
      },
      {
        question: "Is my text data secure and private?",
        answer: "Absolutely. We take your privacy seriously. Your text is processed securely and is not stored permanently on our servers. We use enterprise-grade encryption and follow strict data protection protocols to ensure your writing remains confidential."
      },
      {
        question: "Do I need to create an account to use Vyakaranly?",
        answer: "Yes, you need to create a free account to use Vyakaranly. This allows us to provide you with personalized suggestions, save your writing history, and give you access to all features including advanced grammar analysis and keyboard shortcuts."
      },
      {
        question: "How accurate are the grammar and style suggestions?",
        answer: "Our AI is specifically trained on Nepali language patterns and grammar rules. While we strive for high accuracy, we recommend reviewing suggestions as language can be contextual. The system continuously learns and improves from usage patterns."
      },
      {
        question: "Can I use Vyakaranly for different types of writing?",
        answer: "Currently, Vyakaranly provides general Nepali grammar and style suggestions. We're working on adding support for different writing styles like formal documents, creative writing, and academic papers. Stay tuned for these exciting features!"
      },
      {
        question: "Is there a limit to how much text I can analyze?",
        answer: "Currently, there are no limits on how much text you can analyze - it's completely unlimited! However, we're planning to introduce usage tiers in the future to ensure sustainable service for all users."
      },
      {
        question: "What browsers and devices are supported?",
        answer: "Vyakaranly works on all modern web browsers including Chrome, Firefox, Safari, and Edge. It's fully responsive and works on desktop computers, tablets, and mobile phones for writing on the go."
      },
      {
        question: "How do I learn the romanized keyboard layout?",
        answer: "We provide an interactive keyboard guide that shows you how English characters map to Nepali Devanagari script. You can access this guide anytime while writing, and with practice, typing in Nepali becomes second nature."
      },
      {
        question: "Can I export or save my corrected text?",
        answer: "Yes! You can easily copy your improved text and use it anywhere. Your writing history is automatically saved in your account, so you can always access your previous texts and corrections for future reference."
      }
    ],
    
    // Auth
    login: 'Log in',
    signup: 'Sign up',
    emailAddress: 'Email address',
    password: 'Password',
    confirmPassword: 'Confirm password',
    fullName: 'Full name',
    enterEmail: 'Enter your email',
    enterPassword: 'Enter your password',
    confirmPasswordPlaceholder: 'Confirm your password',
    enterFullName: 'Enter your full name',
    forgotPassword: 'Forgot password?',
    createAccount: 'Create account',
    welcomeBack: 'Welcome back!',
    joinThousands: 'Join thousands of users enhancing their Nepali writing with AI',
    
    // Dialog
    startNewText: 'Start New Text?',
    startNewTextDescription: 'This will clear current suggestions. Your work is saved in history.',
    cancel: 'Cancel',
    
    // Messages
    pleaseEnterText: 'Please enter some text to analyze',
    pleaseSignIn: 'Please sign in to enhance your text',
    textAnalyzedSuccessfully: 'Text analyzed successfully',
    noSuggestionsFound: 'No suggestions found for the given text',
    readyForNewText: 'Ready for new text! Your previous work is saved in history.',
    welcome: 'Welcome',
    
    // View modes
    listView: 'List view',
    navigateView: 'Navigate view',
    listViewTooltip: 'List view - Show all suggestions',
    navigateViewTooltip: 'Navigate view - Review one by one',
    
    // Language toggle
    language: 'Language',
    nepali: 'Nepali',
    english: 'English',
  },
};

export function getTranslation(language: Language): Translations {
  return translations[language];
} 