
import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, BookOpen, Quote } from 'lucide-react';
import { getDailyInspiration } from '../services/geminiService';
import { VerseInspiration } from '../types';

interface Props {
  lang: 'en' | 'ar';
}

const translations = {
  en: {
    subtitle: "Spiritual Nourishment",
    title: "Daily Inspiration",
    refresh: "Generate New",
    loading: "Consulting the wisdom of the ages...",
    reflection: "Heartfelt Reflection"
  },
  ar: {
    subtitle: "غذاء الروح",
    title: "إلهام يومي",
    refresh: "توليد جديد",
    loading: "نستقي الحكمة من كنوز المعرفة...",
    reflection: "تأمل قلبي"
  }
};

const DailyInspirationView: React.FC<Props> = ({ lang }) => {
  const [inspiration, setInspiration] = useState<VerseInspiration | null>(null);
  const [loading, setLoading] = useState(false);
  const t = translations[lang];
  const isRtl = lang === 'ar';

  const fetchInspiration = async () => {
    setLoading(true);
    try {
      const data = await getDailyInspiration();
      setInspiration(data);
    } catch (error) {
      console.error("Error fetching inspiration:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspiration();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 ${isRtl ? 'text-right' : ''}`}>
        <div>
          <h2 className="text-amber-400 font-bold tracking-widest uppercase text-sm mb-2">{t.subtitle}</h2>
          <h1 className="text-4xl font-bold text-white">{t.title}</h1>
        </div>
        <button 
          onClick={fetchInspiration}
          disabled={loading}
          className={`flex items-center space-x-2 space-x-reverse bg-amber-400 text-slate-900 px-6 py-3 rounded-full font-bold hover:bg-amber-300 disabled:opacity-50 transition-all shadow-lg active:scale-95`}
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          <span>{t.refresh}</span>
        </button>
      </div>

      {loading ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 animate-pulse">{t.loading}</p>
        </div>
      ) : inspiration ? (
        <div className="grid grid-cols-1 gap-8">
          {/* Main Verse Card */}
          <div className="bg-slate-800/40 border border-slate-700 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group">
            <Quote size={80} className={`absolute -top-4 ${isRtl ? '-right-4' : '-left-4'} text-amber-400/10 pointer-events-none`} />
            
            <div className="relative z-10 space-y-8">
              <div className="text-center space-y-6">
                <p className="font-amiri text-4xl md:text-5xl lg:text-6xl text-amber-200 leading-relaxed tracking-wide">
                  {inspiration.verse}
                </p>
                <div className="w-24 h-1 bg-amber-400/30 mx-auto rounded-full" />
                <p className="text-xl md:text-2xl text-slate-300 font-light italic leading-relaxed max-w-3xl mx-auto">
                  "{inspiration.translation}"
                </p>
                <p className="text-amber-400 font-semibold tracking-widest uppercase text-sm">
                  — {inspiration.reference}
                </p>
              </div>
            </div>
          </div>

          {/* Reflection Card */}
          <div className={`bg-indigo-950/30 border border-indigo-400/20 rounded-[2rem] p-8 md:p-10 ${isRtl ? 'text-right' : ''}`}>
            <div className={`flex items-center space-x-3 space-x-reverse mb-6 ${isRtl ? 'justify-start' : ''}`}>
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <BookOpen size={24} className="text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">{t.reflection}</h3>
            </div>
            <p className="text-lg text-slate-300 leading-relaxed font-light">
              {inspiration.reflection}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default DailyInspirationView;
