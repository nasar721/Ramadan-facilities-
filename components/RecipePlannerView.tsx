
import React, { useState } from 'react';
import { Utensils, RefreshCw, Clock, Leaf, Info, ChevronRight, Sunset, Sunrise, Share2, CheckCircle2 } from 'lucide-react';
import { getRecipeSuggestion } from '../services/geminiService';
import { RamadanRecipe } from '../types';

interface Props {
  lang: 'en' | 'ar';
}

const translations = {
  en: {
    subtitle: "Mindful Eating",
    title: "Wholesome Meal Planner",
    iftar: "Iftar",
    suhoor: "Suhoor",
    generate: "Generate",
    noRecipe: "Discover a {meal} Feast",
    noRecipeDesc: "Let our AI curate a nutritious {meal} menu specifically balanced for the Ramadan fasting window.",
    loading: "Preparing something special...",
    loadingDesc: "Balancing nutrition and flavor for your {meal}.",
    perfectFor: "Perfect for {meal}",
    share: "Share Recipe",
    copied: "Copied!",
    ingredients: "Ingredients",
    method: "Method",
    wellness: "Wellness Tip",
    nutritionInsight: "Nutritional Insight",
    refresh: "Refresh {meal} Ideas"
  },
  ar: {
    subtitle: "أكل واعي",
    title: "مخطط وجبات صحية",
    iftar: "إفطار",
    suhoor: "سحور",
    generate: "توليد",
    noRecipe: "اكتشف وليمة {meal}",
    noRecipeDesc: "دع ذكاءنا الاصطناعي يقدم لك قائمة {meal} مغذية ومتوازنة خصيصاً للصائم.",
    loading: "نجهز لك شيئاً مميزاً...",
    loadingDesc: "نوازن بين التغذية والمذاق لوجبة {meal} الخاصة بك.",
    perfectFor: "مثالي لـ {meal}",
    share: "مشاركة الوصفة",
    copied: "تم النسخ!",
    ingredients: "المكونات",
    method: "طريقة التحضير",
    wellness: "نصيحة صحية",
    nutritionInsight: "رؤية تغذوية",
    refresh: "أفكار {meal} جديدة"
  }
};

const RecipePlannerView: React.FC<Props> = ({ lang }) => {
  const [mealType, setMealType] = useState<'Iftar' | 'Suhoor'>('Iftar');
  const [recipe, setRecipe] = useState<RamadanRecipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const t = translations[lang];
  const isRtl = lang === 'ar';

  const theme = {
    Iftar: {
      accent: 'amber',
      accentColor: 'text-amber-400',
      bgColor: 'bg-amber-500',
      glow: 'shadow-amber-500/20',
      border: 'border-amber-400/20',
      light: 'bg-amber-400/10',
      icon: <Sunset size={20} />,
      label: t.iftar
    },
    Suhoor: {
      accent: 'emerald',
      accentColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500',
      glow: 'shadow-emerald-500/20',
      border: 'border-emerald-400/20',
      light: 'bg-emerald-400/10',
      icon: <Sunrise size={20} />,
      label: t.suhoor
    }
  }[mealType];

  const fetchRecipe = async (type: 'Iftar' | 'Suhoor' = mealType) => {
    setLoading(true);
    setRecipe(null);
    setShareSuccess(false);
    try {
      const data = await getRecipeSuggestion(type, lang);
      setRecipe(data);
    } catch (error) {
      console.error("Error fetching recipe:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (type: 'Iftar' | 'Suhoor') => {
    if (type === mealType && recipe) return;
    setMealType(type);
    fetchRecipe(type);
  };

  const handleShareRecipe = async () => {
    if (!recipe) return;

    const recipeText = `🌙 ${lang === 'ar' ? 'وصفة رمضان' : 'Ramadan Recipe'} (${theme.label}): ${recipe.name}\n\n` +
      `${recipe.description}\n\n` +
      `${t.ingredients}:\n${recipe.ingredients.map(i => `• ${i}`).join('\n')}\n\n` +
      `${t.method}:\n${recipe.instructions.map((step, i) => `${i + 1}. ${step}`).join('\n')}\n\n` +
      `${t.wellness}: ${recipe.nutritionTips}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: recipe.name,
          text: recipeText,
        });
        setShareSuccess(true);
      } else {
        await navigator.clipboard.writeText(recipeText);
        setShareSuccess(true);
      }
      
      setTimeout(() => setShareSuccess(false), 3000);
    } catch (error) {
      console.error("Error sharing recipe:", error);
    }
  };

  return (
    <div className={`space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ${isRtl ? 'text-right' : ''}`}>
      <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 ${isRtl ? 'md:flex-row-reverse' : ''}`}>
        <div className={isRtl ? 'text-right' : 'text-left'}>
          <h2 className={`${theme.accentColor} font-bold tracking-widest uppercase text-sm mb-2 transition-colors duration-500`}>
            {t.subtitle}
          </h2>
          <h1 className="text-4xl font-bold text-white">{t.title}</h1>
        </div>
        
        {/* Dynamic Toggle Switch */}
        <div className={`relative flex bg-slate-800/80 p-1.5 rounded-full shadow-inner w-full md:w-auto max-w-xs border border-slate-700 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div 
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] ${theme.bgColor} rounded-full transition-all duration-500 ease-out shadow-lg ${theme.glow} ${
              mealType === 'Suhoor' ? (isRtl ? 'translate-x-0' : 'translate-x-[calc(100%+6px)]') : (isRtl ? 'translate-x-[calc(-100%-6px)]' : 'translate-x-0')
            }`}
          />
          <button
            onClick={() => handleToggle('Iftar')}
            className={`relative z-10 flex-1 flex items-center justify-center space-x-2 space-x-reverse px-6 py-2.5 rounded-full font-bold transition-all duration-300 text-sm md:text-base ${
              mealType === 'Iftar' ? 'text-slate-900 scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sunset size={16} />
            <span>{t.iftar}</span>
          </button>
          <button
            onClick={() => handleToggle('Suhoor')}
            className={`relative z-10 flex-1 flex items-center justify-center space-x-2 space-x-reverse px-6 py-2.5 rounded-full font-bold transition-all duration-300 text-sm md:text-base ${
              mealType === 'Suhoor' ? 'text-slate-900 scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sunrise size={16} />
            <span>{t.suhoor}</span>
          </button>
        </div>
      </div>

      {!recipe && !loading && (
        <div className="bg-slate-800/40 border border-slate-700 rounded-[2.5rem] p-12 text-center group transition-all hover:bg-slate-800/60">
          <div className="relative mx-auto w-24 h-24 mb-8">
            <div className={`absolute inset-0 ${theme.bgColor} opacity-20 rounded-full animate-ping`} />
            <div className={`relative flex items-center justify-center w-full h-full bg-slate-900 rounded-full border ${theme.border}`}>
              <div className={`${theme.accentColor}`}>{theme.icon}</div>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-4">{t.noRecipe.replace('{meal}', theme.label)}</h3>
          <p className="text-slate-400 max-w-md mx-auto mb-10 text-lg leading-relaxed">
            {t.noRecipeDesc.replace('{meal}', theme.label)}
          </p>
          <button 
            onClick={() => fetchRecipe()}
            className={`group flex items-center space-x-3 space-x-reverse mx-auto ${theme.bgColor} text-slate-900 px-10 py-4 rounded-full font-bold hover:brightness-110 transition-all shadow-xl ${theme.glow} active:scale-95`}
          >
            <span>{t.generate} {theme.label}</span>
            <ChevronRight size={20} className={`transition-transform ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
          </button>
        </div>
      )}

      {loading && (
        <div className="min-h-[400px] flex flex-col items-center justify-center space-y-6">
          <div className="relative">
             <div className="w-20 h-20 border-4 border-slate-800 rounded-full"></div>
             <div className={`absolute top-0 w-20 h-20 border-4 border-t-transparent rounded-full animate-spin ${mealType === 'Iftar' ? 'border-amber-400' : 'border-emerald-500'}`}></div>
          </div>
          <div className="text-center space-y-2">
            <p className={`text-xl font-medium ${theme.accentColor}`}>{t.loading}</p>
            <p className="text-slate-500 animate-pulse">{t.loadingDesc.replace('{meal}', theme.label)}</p>
          </div>
        </div>
      )}

      {recipe && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-800/40 border border-slate-700 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
              <div className={`absolute top-0 ${isRtl ? 'left-0' : 'right-0'} p-12 opacity-5 pointer-events-none`}>
                <Utensils size={200} />
              </div>
              
              <div className={`flex flex-wrap items-center justify-between gap-4 mb-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center space-x-2 space-x-reverse ${theme.accentColor} ${theme.light} w-fit px-4 py-1.5 rounded-full border ${theme.border}`}>
                  <Clock size={16} />
                  <span className="text-xs font-bold uppercase tracking-[0.2em]">{t.perfectFor.replace('{meal}', theme.label)}</span>
                </div>

                <button 
                  onClick={handleShareRecipe}
                  className={`flex items-center space-x-2 space-x-reverse bg-slate-900/50 hover:bg-slate-900 text-slate-300 hover:text-white px-4 py-1.5 rounded-full border border-slate-700 transition-all text-xs font-bold uppercase tracking-wider group`}
                >
                  {shareSuccess ? (
                    <>
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span className="text-emerald-400">{t.copied}</span>
                    </>
                  ) : (
                    <>
                      <Share2 size={14} className="group-hover:scale-110 transition-transform" />
                      <span>{t.share}</span>
                    </>
                  )}
                </button>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight relative z-10">{recipe.name}</h2>
              <p className="text-xl text-slate-400 leading-relaxed mb-12 font-light relative z-10">
                {recipe.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <h4 className={`flex items-center space-x-3 space-x-reverse text-xl font-bold text-white mb-8`}>
                    <div className={`w-10 h-10 ${theme.light} rounded-xl flex items-center justify-center ${theme.accentColor} border ${theme.border}`}>
                      <Leaf size={20} />
                    </div>
                    <span>{t.ingredients}</span>
                  </h4>
                  <ul className="space-y-5">
                    {recipe.ingredients.map((ing, i) => (
                      <li key={i} className={`flex items-start space-x-4 space-x-reverse text-slate-300 group`}>
                        <div className={`mt-1.5 w-4 h-4 rounded-full border ${theme.border} flex items-center justify-center shrink-0 group-hover:bg-slate-700 transition-colors`}>
                          <div className={`w-1.5 h-1.5 ${theme.bgColor} rounded-full`} />
                        </div>
                        <span className="text-lg">{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <h4 className={`flex items-center space-x-3 space-x-reverse text-xl font-bold text-white mb-8`}>
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                      <Utensils size={20} />
                    </div>
                    <span>{t.method}</span>
                  </h4>
                  <div className="space-y-8">
                    {recipe.instructions.map((step, i) => (
                      <div key={i} className={`flex space-x-5 space-x-reverse group`}>
                        <span className={`text-3xl font-black transition-colors pt-1 leading-none ${mealType === 'Iftar' ? 'text-amber-500/20 group-hover:text-amber-400' : 'text-emerald-500/20 group-hover:text-emerald-400'}`}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <p className="text-slate-300 leading-relaxed text-lg font-light pt-0.5">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className={`border ${theme.border} rounded-[2rem] p-8 md:p-10 sticky top-24 backdrop-blur-sm ${mealType === 'Iftar' ? 'bg-amber-950/20' : 'bg-emerald-950/20'}`}>
              <div className={`flex items-center space-x-4 space-x-reverse mb-8`}>
                <div className={`p-4 ${theme.bgColor} rounded-2xl shadow-lg ${theme.glow} ring-4 ring-white/5`}>
                  <Info size={28} className="text-slate-900" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{t.wellness}</h3>
                  <p className={`${theme.accentColor} opacity-60 text-sm font-medium`}>{t.nutritionInsight}</p>
                </div>
              </div>
              
              <div className="relative">
                <div className={`absolute ${isRtl ? '-right-4' : '-left-4'} top-0 bottom-0 w-1 ${theme.bgColor} opacity-20 rounded-full`} />
                <p className={`text-lg text-slate-200 leading-relaxed italic ${isRtl ? 'pr-4' : 'pl-4'}`}>
                  "{recipe.nutritionTips}"
                </p>
              </div>
              
              <div className="mt-10 pt-10 border-t border-white/5 space-y-4">
                <button 
                  onClick={() => fetchRecipe()}
                  className={`w-full flex items-center justify-center space-x-3 space-x-reverse bg-slate-800/80 text-white py-4 rounded-2xl font-bold hover:bg-slate-700 transition-all border border-white/5 group shadow-lg`}
                >
                  <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500 text-slate-400" />
                  <span>{t.refresh.replace('{meal}', theme.label)}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipePlannerView;
