
import React, { useState } from 'react';
import { MessageSquareHeart, Send, Download, Share2, Sparkles, User, Heart, CheckCircle2, Loader2, Image as ImageIcon, Palette, Layout } from 'lucide-react';
import { generateGreeting, generateGreetingImage } from '../services/geminiService';
import { RamadanGreeting } from '../types';

interface Props {
  lang: 'en' | 'ar';
}

const translations = {
  en: {
    subtitle: "Spread the Joy",
    title: "Greeting Card Generator",
    recipient: "Recipient's Name",
    relation: "Relation",
    vision: "Artistic Vision",
    visionPlaceholder: "Describe the scene...",
    style: "Artistic Style",
    aspectRatio: "Aspect Ratio",
    btnGenerate: "Generate Card",
    btnCrafting: "Crafting Card...",
    noCard: "Ready to create?",
    noCardDesc: "Select your favorite style and aspect ratio to generate a personalized Ramadan card.",
    btnDownload: "Download",
    btnShare: "Share",
    shared: "Shared!",
    dear: "Dear",
    thinking: "Thinking of the perfect words...",
    artGen: "Generating Art",
    optional: "Optional",
    relations: ["Friend", "Mother", "Father", "Sibling", "Spouse", "Colleague", "Teacher"]
  },
  ar: {
    subtitle: "انشر البهجة",
    title: "مصمم بطاقات التهنئة",
    recipient: "اسم المستلم",
    relation: "الصلة",
    vision: "الرؤية الفنية",
    visionPlaceholder: "صف المشهد الذي تتخيله...",
    style: "النمط الفني",
    aspectRatio: "نسبة العرض",
    btnGenerate: "صمم البطاقة",
    btnCrafting: "جاري التصميم...",
    noCard: "هل أنت جاهز للإبداع؟",
    noCardDesc: "اختر النمط المفضل ونسبة العرض لتوليد بطاقة رمضان مخصصة.",
    btnDownload: "تحميل",
    btnShare: "مشاركة",
    shared: "تمت المشاركة!",
    dear: "عزيزي/عزيزتي",
    thinking: "نبحث عن أجمل الكلمات...",
    artGen: "جاري رسم اللوحة",
    optional: "اختياري",
    relations: ["صديق", "أم", "أب", "أخ/أخت", "زوج/زوجة", "زميل", "معلم"]
  }
};

const STYLES = [
  { name: 'Ethereal', nameAr: 'أثيري' },
  { name: 'Minimalist', nameAr: 'بسيط' },
  { name: 'Traditional', nameAr: 'تقليدي' },
  { name: 'Vibrant', nameAr: 'حيوي' },
  { name: 'Watercolor', nameAr: 'ألوان مائية' },
  { name: 'Papercut', nameAr: 'قصاصات ورق' },
];

const ASPECT_RATIOS = [
  { label: '1:1', value: '1:1', icon: <SquareIcon size={16} /> },
  { label: '4:3', value: '4:3', icon: <LandscapeIcon size={16} /> },
  { label: '16:9', value: '16:9', icon: <WideIcon size={16} /> },
  { label: '9:16', value: '9:16', icon: <PortraitIcon size={16} /> },
];

function SquareIcon({ size }: { size: number }) { return <div style={{ width: size, height: size }} className="border-2 border-current rounded-sm" />; }
function LandscapeIcon({ size }: { size: number }) { return <div style={{ width: size * 1.3, height: size }} className="border-2 border-current rounded-sm" />; }
function WideIcon({ size }: { size: number }) { return <div style={{ width: size * 1.6, height: size * 0.9 }} className="border-2 border-current rounded-sm" />; }
function PortraitIcon({ size }: { size: number }) { return <div style={{ width: size * 0.9, height: size * 1.6 }} className="border-2 border-current rounded-sm" />; }

const GreetingsGeneratorView: React.FC<Props> = ({ lang }) => {
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Friend');
  const [customArtPrompt, setCustomArtPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Ethereal');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [greeting, setGreeting] = useState<RamadanGreeting | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isTextLoading, setIsTextLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const t = translations[lang];
  const isRtl = lang === 'ar';

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setGreeting(null);
    setImageUrl(null);
    setShareStatus('idle');
    
    setIsTextLoading(true);
    setIsImageLoading(true);

    const textPromise = generateGreeting(name, relation)
      .then(data => {
        setGreeting(data);
        setIsTextLoading(false);
      })
      .catch(err => {
        console.error("Error generating text:", err);
        setIsTextLoading(false);
      });

    const finalImagePrompt = customArtPrompt.trim() 
      ? customArtPrompt 
      : `Ramadan scene for ${name}, moonlit and peaceful with lanterns and crescent moon`;

    const imagePromise = generateGreetingImage(finalImagePrompt, aspectRatio, selectedStyle)
      .then(url => {
        setImageUrl(url);
        setIsImageLoading(false);
      })
      .catch(err => {
        console.error("Error generating image:", err);
        setIsImageLoading(false);
      });

    await Promise.all([textPromise, imagePromise]);
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ramadan-greeting-${name.toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!greeting || !imageUrl) return;

    const shareText = `${greeting.arabicText}\n\n${greeting.englishText}\n\n- Personalized Ramadan greeting for ${name}`;
    
    try {
      const blob = await (await fetch(imageUrl)).blob();
      const file = new File([blob], 'ramadan-greeting.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Ramadan Kareem Greeting',
          text: shareText,
        });
        setShareStatus('success');
      } else if (navigator.share) {
        await navigator.share({
          title: 'Ramadan Kareem Greeting',
          text: shareText,
        });
        setShareStatus('success');
      } else {
        await navigator.clipboard.writeText(shareText);
        alert("Sharing not supported on this browser. Greeting text copied to clipboard!");
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
        setShareStatus('error');
      }
    }
  };

  const isAnyLoading = isTextLoading || isImageLoading;

  return (
    <div className={`space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ${isRtl ? 'text-right' : ''}`}>
      <div>
        <h2 className="text-amber-400 font-bold tracking-widest uppercase text-sm mb-2">{t.subtitle}</h2>
        <h1 className="text-4xl font-bold text-white">{t.title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <form onSubmit={handleGenerate} className="bg-slate-800/40 border border-slate-700 rounded-3xl p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">{t.recipient}</label>
                <div className="relative">
                  <User size={18} className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-500`} />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={lang === 'ar' ? "مثلاً: عبدالله" : "e.g. Abdullah"}
                    className={`w-full bg-slate-900 border border-slate-700 rounded-xl py-3 ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-white focus:outline-none focus:border-amber-400 transition-colors`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">{t.relation}</label>
                <select 
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-amber-400 transition-colors appearance-none"
                >
                  {t.relations.map((rel, i) => (
                    <option key={i} value={translations.en.relations[i]}>{rel}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-700/50">
              <div>
                <label className={`block text-sm font-medium text-slate-400 mb-3 flex items-center ${isRtl ? 'space-x-reverse' : ''} space-x-2`}>
                  <Palette size={16} className="text-amber-400" />
                  <span>{t.style}</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {STYLES.map((style) => (
                    <button
                      key={style.name}
                      type="button"
                      onClick={() => setSelectedStyle(style.name)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                        selectedStyle === style.name 
                          ? 'bg-amber-400 border-amber-400 text-slate-900 shadow-lg shadow-amber-400/20' 
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {isRtl ? style.nameAr : style.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium text-slate-400 mb-3 flex items-center ${isRtl ? 'space-x-reverse' : ''} space-x-2`}>
                  <Layout size={16} className="text-amber-400" />
                  <span>{t.aspectRatio}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio.value}
                      type="button"
                      onClick={() => setAspectRatio(ratio.value)}
                      className={`flex-1 min-w-[60px] flex flex-col items-center justify-center space-y-1.5 p-2 rounded-xl transition-all border ${
                        aspectRatio === ratio.value 
                          ? 'bg-slate-700 border-amber-400 text-amber-400' 
                          : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'
                      }`}
                    >
                      {ratio.icon}
                      <span className="text-[10px] font-bold">{ratio.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium text-slate-400 mb-2 flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <span>{t.vision}</span>
                  <span className="text-[10px] uppercase tracking-tighter text-amber-500/60 font-bold">{t.optional}</span>
                </label>
                <div className="relative">
                  <Sparkles size={18} className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-4 text-slate-500`} />
                  <textarea 
                    value={customArtPrompt}
                    onChange={(e) => setCustomArtPrompt(e.target.value)}
                    placeholder={t.visionPlaceholder}
                    rows={2}
                    className={`w-full bg-slate-900 border border-slate-700 rounded-xl py-3 ${isRtl ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4'} text-white focus:outline-none focus:border-amber-400 transition-colors resize-none text-sm leading-relaxed`}
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isAnyLoading || !name.trim()}
              className="w-full flex items-center justify-center space-x-2 space-x-reverse bg-amber-400 text-slate-900 py-4 rounded-xl font-bold hover:bg-amber-300 disabled:opacity-50 transition-all shadow-lg active:scale-95"
            >
              {isAnyLoading ? <Sparkles size={20} className="animate-spin" /> : <Send size={20} />}
              <span>{isAnyLoading ? t.btnCrafting : t.btnGenerate}</span>
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          {(!greeting && isTextLoading) ? (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-slate-800/20 border-2 border-dashed border-slate-700 rounded-[2.5rem] space-y-4">
              <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500 italic">{t.thinking}</p>
            </div>
          ) : greeting ? (
            <div className="space-y-6 animate-in zoom-in-95 duration-500">
              <div 
                className="relative group rounded-[2.5rem] overflow-hidden bg-slate-800 shadow-2xl flex items-center justify-center transition-all duration-500"
                style={{ 
                  aspectRatio: aspectRatio.replace(':', ' / '),
                  maxHeight: '70vh'
                }}
              >
                <div className="absolute inset-0 z-0">
                  {isImageLoading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm">
                      <Loader2 size={40} className="text-amber-400 animate-spin mb-4" />
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400/40">{t.artGen}</p>
                    </div>
                  ) : imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt="Ramadan art" 
                      className="w-full h-full object-cover opacity-60 scale-105 group-hover:scale-110 transition-transform duration-[2000ms]" 
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-900/40" />
                  )}
                </div>
                
                <div className="relative z-10 w-full h-full bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-6 md:p-10 flex flex-col justify-end text-center">
                  <div className="space-y-4 md:space-y-6">
                    <p className="font-amiri text-3xl md:text-5xl text-amber-200 drop-shadow-lg leading-tight">
                      {greeting.arabicText}
                    </p>
                    <div className="w-12 md:w-16 h-1 bg-amber-400 mx-auto rounded-full shadow-glow" />
                    <h3 className="text-xl md:text-2xl font-bold text-white drop-shadow-md">
                      {t.dear} {name},
                    </h3>
                    <p className="text-base md:text-lg text-slate-200 font-medium leading-relaxed drop-shadow-sm max-w-2xl mx-auto">
                      {greeting.englishText}
                    </p>
                    <p className="hidden md:block text-xs md:text-sm text-amber-400/90 italic max-w-lg mx-auto leading-relaxed">
                      {greeting.poeticNote}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={handleDownload}
                  disabled={isImageLoading || !imageUrl}
                  className="flex-1 flex items-center justify-center space-x-2 space-x-reverse bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl transition-all disabled:opacity-50"
                >
                  <Download size={20} />
                  <span>{t.btnDownload}</span>
                </button>
                <button 
                  onClick={handleShare}
                  disabled={isImageLoading || !imageUrl}
                  className="flex-1 flex items-center justify-center space-x-2 space-x-reverse bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {shareStatus === 'success' ? <CheckCircle2 size={20} className="text-green-400" /> : <Share2 size={20} />}
                  <span>{shareStatus === 'success' ? t.shared : t.btnShare}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-slate-800/20 border-2 border-dashed border-slate-700 rounded-[2.5rem] p-12 text-center">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-600">
                <MessageSquareHeart size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-400 mb-2">{t.noCard}</h3>
              <p className="text-slate-500 max-w-sm">{t.noCardDesc}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GreetingsGeneratorView;
