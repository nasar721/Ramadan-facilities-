
import React, { useState, useEffect } from 'react';
import { 
  Moon, 
  Sparkles, 
  MessageSquareHeart, 
  Utensils, 
  Home as HomeIcon, 
  Compass,
  Menu,
  X,
  ChevronRight,
  Quote,
  ArrowRight,
  Languages,
  BookOpen
} from 'lucide-react';
import { AppSection, VerseInspiration } from './types';
import { getDailyInspiration } from './services/geminiService';
import DailyInspirationView from './components/DailyInspirationView';
import GreetingsGeneratorView from './components/GreetingsGeneratorView';
import RecipePlannerView from './components/RecipePlannerView';
import QuranView from './components/QuranView';

const translations = {
  en: {
    appName: "Companion",
    home: "Home",
    inspiration: "Insights",
    quran: "Quran",
    greetings: "Cards",
    recipes: "Meals",
    welcome: "Welcome to your",
    companion: "Companion.",
    description: "Enhance your spiritual journey this holy month with AI-guided reflections, the Holy Quran, and wholesome nutrition.",
    todayReflection: "Today's Reflection",
    deepen: "Deepen your reflection",
    ramadan1446: "Ramadan 1446",
    peaceMsg: "May this month bring you peace.",
    spiritualNourishment: "Daily Spiritual Nourishment",
    spiritualDesc: "AI-curated Quranic verses and reflections.",
    heartfeltGreetings: "Personalized Cards",
    greetingsDesc: "Create greetings for your loved ones.",
    healthyMeals: "Wholesome Meals",
    mealsDesc: "Recipes designed for fasting.",
    guidedReflection: "The Holy Quran",
    reflectionDesc: "Read and understand the divine message.",
    ramadanKareem: "Ramadan Kareem",
    quranVerse: "The month of Ramadan is that in which was revealed the Quran. (2:185)",
    begin: "Begin Reading",
    langToggle: "العربية"
  },
  ar: {
    appName: "مرافق رمضان",
    home: "الرئيسية",
    inspiration: "تأملات",
    quran: "القرآن",
    greetings: "بطاقات",
    recipes: "وجبات",
    welcome: "مرحباً بك في",
    companion: "مرافقك الرمضاني.",
    description: "عزز رحلتك الروحانية في هذا الشهر الفضيل بالقرآن الكريم، وتأملات الذكاء الاصطناعي، ومعايدات من القلب.",
    todayReflection: "تأمل اليوم",
    deepen: "تعمق في التأمل",
    ramadan1446: "رمضان ١٤٤٦",
    peaceMsg: "شهر مبارك يحمل السلام لقلبك.",
    spiritualNourishment: "نورانيات يومية",
    spiritualDesc: "آيات قرآنية وتأملات تنير يومك.",
    heartfeltGreetings: "معايدات مخصصة",
    greetingsDesc: "صمم بطاقات رمضان لأحبائك.",
    healthyMeals: "وجبات صحية",
    mealsDesc: "وصفات مغذية للصائمين.",
    guidedReflection: "القرآن الكريم",
    reflectionDesc: "اقرأ وافهم الرسالة السماوية.",
    ramadanKareem: "رمضان كريم",
    quranVerse: "شَهْرُ رَمَضَانَ الَّذِي أُنْزِلَ فِيهِ الْقُرْآنُ هُدًى لِلنَّاسِ (البقرة: ١٨٥)",
    begin: "ابدأ القراءة",
    langToggle: "English"
  }
};

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.HOME);
  const [dailyVerse, setDailyVerse] = useState<VerseInspiration | null>(null);
  const [loadingVerse, setLoadingVerse] = useState(false);
  const [lang, setLang] = useState<'en' | 'ar'>('ar');

  const t = translations[lang];
  const isRtl = lang === 'ar';

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoadingVerse(true);
      try {
        const data = await getDailyInspiration();
        setDailyVerse(data);
      } catch (error) {
        console.error("Error fetching home inspiration:", error);
      } finally {
        setLoadingVerse(false);
      }
    };
    fetchHomeData();
  }, []);

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'ar' : 'en');
  };

  const MobileBottomNav: React.FC = () => (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-lg border-t border-slate-800 z-50 flex justify-around items-center px-2 pb-safe pt-2">
      <BottomNavItem 
        active={activeSection === AppSection.HOME} 
        icon={<HomeIcon size={18} />} 
        label={t.home} 
        onClick={() => setActiveSection(AppSection.HOME)} 
      />
      <BottomNavItem 
        active={activeSection === AppSection.QURAN} 
        icon={<BookOpen size={18} />} 
        label={t.quran} 
        onClick={() => setActiveSection(AppSection.QURAN)} 
      />
      <BottomNavItem 
        active={activeSection === AppSection.INSPIRATION} 
        icon={<Sparkles size={18} />} 
        label={t.inspiration} 
        onClick={() => setActiveSection(AppSection.INSPIRATION)} 
      />
      <BottomNavItem 
        active={activeSection === AppSection.GREETINGS} 
        icon={<MessageSquareHeart size={18} />} 
        label={t.greetings} 
        onClick={() => setActiveSection(AppSection.GREETINGS)} 
      />
      <BottomNavItem 
        active={activeSection === AppSection.RECIPES} 
        icon={<Utensils size={18} />} 
        label={t.recipes} 
        onClick={() => setActiveSection(AppSection.RECIPES)} 
      />
      <button 
        onClick={toggleLanguage}
        className="flex flex-col items-center justify-center p-2 text-amber-400 opacity-80"
      >
        <Languages size={18} />
        <span className="text-[9px] mt-1 font-bold">{t.langToggle === 'English' ? 'EN' : 'عربي'}</span>
      </button>
    </nav>
  );

  const BottomNavItem: React.FC<{ active: boolean; icon: React.ReactNode; label: string; onClick: () => void }> = ({ active, icon, label, onClick }) => (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-1 min-w-[50px] transition-all duration-300 ${active ? 'text-amber-400' : 'text-slate-500'}`}
    >
      <div className={`p-1 rounded-full ${active ? 'bg-amber-400/10' : ''}`}>
        {icon}
      </div>
      <span className={`text-[9px] mt-0.5 font-medium ${active ? 'font-bold' : ''}`}>{label}</span>
    </button>
  );

  return (
    <div className={`min-h-screen flex flex-col md:flex-row bg-slate-900 text-slate-100 selection:bg-amber-400 selection:text-slate-900 ${isRtl ? 'font-amiri' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between p-5 bg-slate-950/20 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Moon className="w-6 h-6 text-amber-400 fill-amber-400" />
          <span className="text-xl font-bold tracking-tight text-amber-50">{t.appName}</span>
        </div>
      </header>

      {/* Desktop Navigation Sidebar */}
      <nav className={`
        hidden md:flex sticky top-0 h-screen w-72 bg-slate-950 p-6 flex-col border-r border-slate-800
      `}>
        <div className="flex items-center space-x-3 space-x-reverse mb-10">
          <Moon className="w-8 h-8 text-amber-400 fill-amber-400" />
          <h1 className="text-2xl font-bold text-amber-50">{t.appName}</h1>
        </div>

        <div className="space-y-3 flex-1">
          <NavItem section={AppSection.HOME} icon={<HomeIcon size={20} />} label={t.home} active={activeSection === AppSection.HOME} onClick={() => setActiveSection(AppSection.HOME)} isRtl={isRtl} />
          <NavItem section={AppSection.QURAN} icon={<BookOpen size={20} />} label={t.quran} active={activeSection === AppSection.QURAN} onClick={() => setActiveSection(AppSection.QURAN)} isRtl={isRtl} />
          <NavItem section={AppSection.INSPIRATION} icon={<Sparkles size={20} />} label={t.inspiration} active={activeSection === AppSection.INSPIRATION} onClick={() => setActiveSection(AppSection.INSPIRATION)} isRtl={isRtl} />
          <NavItem section={AppSection.GREETINGS} icon={<MessageSquareHeart size={20} />} label={t.greetings} active={activeSection === AppSection.GREETINGS} onClick={() => setActiveSection(AppSection.GREETINGS)} isRtl={isRtl} />
          <NavItem section={AppSection.RECIPES} icon={<Utensils size={20} />} label={t.recipes} active={activeSection === AppSection.RECIPES} onClick={() => setActiveSection(AppSection.RECIPES)} isRtl={isRtl} />
        </div>

        <div className="mt-auto pt-6 border-t border-slate-800 space-y-4">
          <button 
            onClick={toggleLanguage}
            className="w-full flex items-center justify-center space-x-2 space-x-reverse bg-slate-800/50 text-amber-400 py-3 rounded-xl border border-amber-400/20 hover:bg-amber-400 hover:text-slate-900 transition-all font-bold"
          >
            <Languages size={18} />
            <span>{t.langToggle}</span>
          </button>
          
          <div className="bg-slate-900/50 rounded-2xl p-4 border border-amber-400/20">
            <p className="text-xs text-amber-400 font-bold uppercase tracking-widest mb-2">{t.ramadan1446}</p>
            <p className="text-sm text-slate-400">{t.peaceMsg}</p>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative pb-24 md:pb-0">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className={`absolute top-0 ${isRtl ? 'left-0' : 'right-0'} w-96 h-96 bg-amber-400 rounded-full blur-[100px]`} />
        </div>

        <div className="max-w-5xl mx-auto p-5 md:p-12 relative z-10">
          {activeSection === AppSection.HOME && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="mb-10">
                <h2 className="text-amber-400 font-bold tracking-widest uppercase text-xs mb-3">{t.welcome}</h2>
                <h1 className="text-4xl md:text-7xl font-bold mb-4 text-white leading-tight">
                   {lang === 'ar' ? '' : 'Ramadan '} 
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">{t.companion}</span>
                </h1>
                <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
                  {t.description}
                </p>
              </div>

              {/* Today's Reflection Card */}
              <div className="mb-10">
                {loadingVerse ? (
                  <div className="bg-slate-800/20 border border-slate-700/50 rounded-3xl p-10 animate-pulse flex flex-col items-center">
                    <div className="w-12 h-1 bg-amber-400/20 rounded-full mb-4" />
                    <div className="h-6 w-3/4 bg-slate-700 rounded-lg" />
                  </div>
                ) : dailyVerse ? (
                  <div className="relative group bg-slate-800/30 border border-slate-700/50 rounded-[2.5rem] p-8 md:p-10 hover:border-amber-400/30 transition-all duration-500 shadow-xl overflow-hidden active:scale-[0.98]">
                    <Quote size={60} className={`absolute -top-2 ${isRtl ? '-right-2' : '-left-2'} text-amber-400/5 pointer-events-none`} />
                    <div className="flex flex-col items-center text-center space-y-6">
                      <div className="inline-flex items-center space-x-2 space-x-reverse text-amber-400 font-bold uppercase tracking-[0.2em] text-[10px] bg-amber-400/10 px-4 py-1.5 rounded-full border border-amber-400/20">
                        <Sparkles size={12} />
                        <span>{t.todayReflection}</span>
                      </div>
                      <p className="font-amiri text-2xl md:text-4xl text-amber-100 leading-relaxed">
                        {dailyVerse.verse}
                      </p>
                      <button 
                        onClick={() => setActiveSection(AppSection.INSPIRATION)}
                        className={`flex items-center space-x-2 space-x-reverse text-sm font-bold text-amber-400 group`}
                      >
                        <span>{t.deepen}</span>
                        <ArrowRight size={16} className={`${isRtl ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'} transition-transform`} />
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FeatureCard title={t.guidedReflection} description={t.reflectionDesc} icon={<BookOpen className="text-amber-400" />} onClick={() => setActiveSection(AppSection.QURAN)} isRtl={isRtl} />
                <FeatureCard title={t.spiritualNourishment} description={t.spiritualDesc} icon={<Sparkles className="text-amber-400" />} onClick={() => setActiveSection(AppSection.INSPIRATION)} isRtl={isRtl} />
                <FeatureCard title={t.heartfeltGreetings} description={t.greetingsDesc} icon={<MessageSquareHeart className="text-rose-400" />} onClick={() => setActiveSection(AppSection.GREETINGS)} isRtl={isRtl} />
                <FeatureCard title={t.healthyMeals} description={t.mealsDesc} icon={<Utensils className="text-emerald-400" />} onClick={() => setActiveSection(AppSection.RECIPES)} isRtl={isRtl} />
              </div>
            </div>
          )}

          {activeSection === AppSection.QURAN && <QuranView lang={lang} />}
          {activeSection === AppSection.INSPIRATION && <DailyInspirationView lang={lang} />}
          {activeSection === AppSection.GREETINGS && <GreetingsGeneratorView lang={lang} />}
          {activeSection === AppSection.RECIPES && <RecipePlannerView lang={lang} />}
        </div>
        <MobileBottomNav />
      </main>
    </div>
  );
};

const NavItem: React.FC<{ section: AppSection; icon: React.ReactNode; label: string; active: boolean; onClick: () => void; isRtl: boolean }> = ({ icon, label, active, onClick, isRtl }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-xl transition-all duration-300 ${
      active ? 'bg-amber-400 text-slate-900 shadow-lg' : 'text-slate-300 hover:bg-slate-800'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

const FeatureCard: React.FC<{ title: string; description: string; icon: React.ReactNode; onClick: () => void, isRtl: boolean }> = ({ title, description, icon, onClick, isRtl }) => (
  <button 
    onClick={onClick}
    className="group p-6 bg-slate-800/40 border border-slate-700 rounded-3xl text-left transition-all duration-300 active:scale-95 hover:border-amber-400/50"
  >
    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center mb-4">
      {icon}
    </div>
    <h4 className={`text-lg font-bold mb-2 text-white group-hover:text-amber-400 transition-colors ${isRtl ? 'text-right' : 'text-left'}`}>{title}</h4>
    <p className={`text-sm text-slate-400 leading-relaxed ${isRtl ? 'text-right' : 'text-left'}`}>{description}</p>
  </button>
);

export default App;
