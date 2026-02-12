
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Book, BookOpen, ChevronLeft, ChevronRight, Sparkles, Loader2, Info, Play, Pause, Type, Plus, Minus, Bookmark, BookmarkCheck, Trash2, Settings2, ChevronDown, ChevronUp, AlertCircle, RefreshCcw } from 'lucide-react';
import { Surah, Ayah } from '../types';
import { explainAyah } from '../services/geminiService';

interface BookmarkItem {
  surahNumber: number;
  surahName: string;
  ayahNumberInSurah: number;
  ayahAbsoluteNumber: number;
  text: string;
  translation: string;
}

interface Props {
  lang: 'en' | 'ar';
}

const ARABIC_FONTS = [
  { id: 'font-cairo', name: 'Cairo (Modern)', nameAr: 'خط القاهرة (عصري)' },
  { id: 'font-amiri', name: 'Amiri (Classic)', nameAr: 'الخط الأميري (كلاسيك)' },
  { id: 'font-reem', name: 'Reem Kufi (Stylized)', nameAr: 'ريم كوفي (مزخرف)' },
  { id: 'font-lateef', name: 'Lateef (Script)', nameAr: 'خط لطيف (رقيق)' },
];

const translations = {
  en: {
    title: "Holy Quran",
    searchPlaceholder: "Search Surah...",
    meccan: "Meccan",
    medinan: "Medinan",
    ayahs: "Ayahs",
    back: "Back to Chapters",
    explain: "Explain with AI",
    explaining: "Gemini is thinking...",
    tafsir: "AI Reflection",
    close: "Close",
    play: "Listen",
    stop: "Stop",
    playSurah: "Play Surah",
    pauseSurah: "Pause Surah",
    loadingAudio: "Loading Audio...",
    textSize: "Text Size",
    fontFamily: "Font",
    bookmarks: "Bookmarks",
    noBookmarks: "No bookmarks yet",
    noBookmarksDesc: "Save your favorite verses to find them quickly later.",
    backToIndex: "Back to Index",
    remove: "Remove",
    showTafsir: "View Explanation",
    hideTafsir: "Hide Explanation",
    errorTitle: "Connection Error",
    errorDesc: "We couldn't reach the Quran server. Please check your connection and try again.",
    retry: "Retry"
  },
  ar: {
    title: "القرآن الكريم",
    searchPlaceholder: "ابحث عن سورة...",
    meccan: "مكية",
    medinan: "مدنية",
    ayahs: "آية",
    back: "العودة للفهرس",
    explain: "تفسير بالذكاء الاصطناعي",
    explaining: "جاري استحضار المعاني...",
    tafsir: "تأمل ذكي",
    close: "إغلاق",
    play: "استماع",
    stop: "إيقاف",
    playSurah: "تشغيل السورة",
    pauseSurah: "إيقاف مؤقت",
    loadingAudio: "جاري التحميل...",
    textSize: "حجم الخط",
    fontFamily: "نوع الخط",
    bookmarks: "المحفوظات",
    noBookmarks: "لا توجد محفوظات",
    noBookmarksDesc: "احفظ آياتك المفضلة لتجدها بسرعة لاحقاً.",
    backToIndex: "العودة للفهرس",
    remove: "حذف",
    showTafsir: "عرض التفسير",
    hideTafsir: "إخفاء التفسير",
    errorTitle: "خطأ في الاتصال",
    errorDesc: "تعذر الوصول إلى خوادم القرآن الكريم. يرجى التأكد من اتصالك بالإنترنت والمحاولة مرة أخرى.",
    retry: "إعادة المحاولة"
  }
};

const QuranView: React.FC<Props> = ({ lang }) => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [viewMode, setViewMode] = useState<'index' | 'bookmarks'>('index');
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [translationsAyahs, setTranslationsAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<boolean>(false);
  const [search, setSearch] = useState('');
  const [explainingId, setExplainingId] = useState<number | null>(null);
  const [tafsirs, setTafsirs] = useState<Record<number, string>>({});
  const [expandedTafsirIds, setExpandedTafsirIds] = useState<Set<number>>(new Set());
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [audioLoadingId, setAudioLoadingId] = useState<number | null>(null);
  const [isSurahPlaying, setIsSurahPlaying] = useState(false);

  const [fontSizeScale, setFontSizeScale] = useState(() => {
    const saved = localStorage.getItem('quranFontSizeScale');
    return saved ? parseFloat(saved) : 1.0;
  });

  const [fontFamily, setFontFamily] = useState(() => {
    const saved = localStorage.getItem('quranFontFamily');
    return saved || 'font-cairo'; 
  });

  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    const saved = localStorage.getItem('quranBookmarks');
    return saved ? JSON.parse(saved) : [];
  });

  const t = translations[lang] || translations.en;
  const isRtl = lang === 'ar';

  useEffect(() => {
    localStorage.setItem('quranFontSizeScale', fontSizeScale.toString());
  }, [fontSizeScale]);

  useEffect(() => {
    localStorage.setItem('quranFontFamily', fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    localStorage.setItem('quranBookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const fetchSurahs = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch('https://api.alquran.cloud/v1/surah');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setSurahs(data.data);
      setFilteredSurahs(data.data);
    } catch (error) {
      console.error("Error fetching Quran index:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSurahs();
  }, [fetchSurahs]);

  useEffect(() => {
    const term = search.toLowerCase();
    setFilteredSurahs(
      surahs.filter(s => 
        s.name.includes(term) || 
        s.englishName.toLowerCase().includes(term) ||
        s.englishNameTranslation.toLowerCase().includes(term)
      )
    );
  }, [search, surahs]);

  const fetchSurahContent = async (surah: Surah, targetAyahNumber?: number) => {
    setLoading(true);
    setError(false);
    setSelectedSurah(surah);
    setViewMode('index');
    setSearch('');
    stopAudio();
    setTafsirs({});
    setExpandedTafsirIds(new Set());
    try {
      const arRes = await fetch(`https://api.alquran.cloud/v1/surah/${surah.number}`);
      if (!arRes.ok) throw new Error('Arabic fetch failed');
      const arData = await arRes.json();
      setAyahs(arData.data.ayahs);

      const enRes = await fetch(`https://api.alquran.cloud/v1/surah/${surah.number}/en.pickthall`);
      if (!enRes.ok) throw new Error('Translation fetch failed');
      const enData = await enRes.json();
      setTranslationsAyahs(enData.data.ayahs);

      if (targetAyahNumber) {
        setTimeout(() => {
            const element = document.getElementById(`ayah-${targetAyahNumber}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              element.classList.add('bg-amber-400/10');
              setTimeout(() => element.classList.remove('bg-amber-400/10'), 3000);
            }
        }, 500);
      }
    } catch (error) {
      console.error("Error fetching surah content:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setPlayingId(null);
    setAudioLoadingId(null);
    setIsSurahPlaying(false);
  };

  const playAyah = (ayah: Ayah, autoPlayNext: boolean = false) => {
    if (playingId === ayah.number && !autoPlayNext) {
      stopAudio();
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`;
    setAudioLoadingId(ayah.number);
    
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.oncanplaythrough = () => {
      setAudioLoadingId(null);
      setPlayingId(ayah.number);
      audio.play();
      
      const element = document.getElementById(`ayah-${ayah.number}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    audio.onended = () => {
      setPlayingId(null);
      if (autoPlayNext || isSurahPlaying) {
        const currentIndex = ayahs.findIndex(a => a.number === ayah.number);
        if (currentIndex !== -1 && currentIndex < ayahs.length - 1) {
          playAyah(ayahs[currentIndex + 1], true);
        } else {
          setIsSurahPlaying(false);
        }
      }
    };

    audio.onerror = () => {
      setAudioLoadingId(null);
      setPlayingId(null);
      setIsSurahPlaying(false);
      console.error("Audio playback error");
    };
  };

  const handleToggleSurahAudio = () => {
    if (isSurahPlaying) {
      stopAudio();
    } else {
      setIsSurahPlaying(true);
      const startIndex = playingId ? ayahs.findIndex(a => a.number === playingId) : 0;
      playAyah(ayahs[startIndex === -1 ? 0 : startIndex], true);
    }
  };

  const handleToggleAudio = (ayah: Ayah) => {
    setIsSurahPlaying(false);
    playAyah(ayah);
  };

  const handleExplain = async (ayah: Ayah) => {
    if (!selectedSurah) return;
    
    if (tafsirs[ayah.number]) {
      toggleTafsir(ayah.number);
      return;
    }

    setExplainingId(ayah.number);
    try {
      const explanation = await explainAyah(ayah.text, selectedSurah.name, ayah.numberInSurah, lang);
      setTafsirs(prev => ({ ...prev, [ayah.number]: explanation }));
      setExpandedTafsirIds(prev => {
        const next = new Set(prev);
        next.add(ayah.number);
        return next;
      });
    } catch (error) {
      console.error("Error explaining ayah:", error);
    } finally {
      setExplainingId(null);
    }
  };

  const toggleTafsir = (ayahNumber: number) => {
    setExpandedTafsirIds(prev => {
      const next = new Set(prev);
      if (next.has(ayahNumber)) {
        next.delete(ayahNumber);
      } else {
        next.add(ayahNumber);
      }
      return next;
    });
  };

  const toggleBookmark = (ayah: Ayah, index: number) => {
    if (!selectedSurah) return;
    const isBookmarked = bookmarks.some(b => b.ayahAbsoluteNumber === ayah.number);
    
    if (isBookmarked) {
      setBookmarks(prev => prev.filter(b => b.ayahAbsoluteNumber !== ayah.number));
    } else {
      const newBookmark: BookmarkItem = {
        surahNumber: selectedSurah.number,
        surahName: selectedSurah.name,
        ayahNumberInSurah: ayah.numberInSurah,
        ayahAbsoluteNumber: ayah.number,
        text: ayah.text,
        translation: translationsAyahs[index]?.text || ""
      };
      setBookmarks(prev => [...prev, newBookmark]);
    }
  };

  const adjustFontSize = (delta: number) => {
    setFontSizeScale(prev => {
      const newVal = prev + delta;
      return Math.min(Math.max(newVal, 0.8), 2.5);
    });
  };

  if (loading && !selectedSurah) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
        <Loader2 size={48} className="text-amber-400 animate-spin" />
        <p className="text-slate-400 animate-pulse">{t.explaining}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 space-y-6 bg-slate-800/20 rounded-[2.5rem] border border-red-500/20">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
          <AlertCircle size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">{t.errorTitle}</h2>
          <p className="text-slate-400 max-w-sm">{t.errorDesc}</p>
        </div>
        <button 
          onClick={() => selectedSurah ? fetchSurahContent(selectedSurah) : fetchSurahs()}
          className="flex items-center gap-2 bg-amber-400 text-slate-900 px-8 py-3 rounded-full font-bold hover:bg-amber-300 transition-all shadow-lg active:scale-95"
        >
          <RefreshCcw size={18} />
          <span>{t.retry}</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ${isRtl ? 'text-right' : ''}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <Book className="text-amber-400" />
            {t.title}
          </h1>
          {!selectedSurah && (
            <button 
                onClick={() => setViewMode(viewMode === 'index' ? 'bookmarks' : 'index')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                    viewMode === 'bookmarks' 
                    ? 'bg-amber-400 text-slate-900 border-amber-400' 
                    : 'bg-slate-800/50 text-amber-400 border-amber-400/20 hover:bg-amber-400/10'
                }`}
            >
                {viewMode === 'bookmarks' ? <BookOpen size={16} /> : <Bookmark size={16} />}
                {viewMode === 'bookmarks' ? t.backToIndex : t.bookmarks}
            </button>
          )}
        </div>

        {!selectedSurah ? (
          viewMode === 'index' && (
            <div className="relative w-full md:w-72">
              <Search size={18} className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-500`} />
              <input 
                type="text" 
                placeholder={t.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full bg-slate-800/50 border border-slate-700 rounded-full py-2.5 ${isRtl ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4'} text-white focus:outline-none focus:border-amber-400 transition-all`}
              />
            </div>
          )
        ) : (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-800/50 p-1.5 px-3 rounded-full border border-slate-700/50">
              <Settings2 size={16} className="text-amber-400/70" />
              <select 
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="bg-transparent text-slate-200 text-xs font-bold focus:outline-none cursor-pointer"
              >
                {ARABIC_FONTS.map(f => (
                  <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                    {isRtl ? f.nameAr : f.name}
                  </option>
                ))}
              </select>
            </div>

            <button 
              onClick={handleToggleSurahAudio}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all border shadow-lg ${
                isSurahPlaying 
                ? 'bg-emerald-500 text-white border-emerald-400' 
                : 'bg-slate-800/80 text-emerald-400 border-emerald-400/30 hover:bg-emerald-400/10'
              }`}
            >
              {isSurahPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
              <span>{isSurahPlaying ? t.pauseSurah : t.playSurah}</span>
            </button>

            <div className="flex items-center gap-2 bg-slate-800/50 p-1.5 rounded-full border border-slate-700/50">
              <button 
                onClick={() => adjustFontSize(-0.1)} 
                className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <Minus size={16} />
              </button>
              <div className="flex items-center gap-1.5 px-2 text-slate-300 font-bold text-xs uppercase tracking-wider min-w-[80px] justify-center">
                <Type size={14} className="text-amber-400" />
                <span>{Math.round(fontSizeScale * 100)}%</span>
              </div>
              <button 
                onClick={() => adjustFontSize(0.1)} 
                className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {!selectedSurah ? (
        viewMode === 'index' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredSurahs.map(surah => (
                <button
                key={surah.number}
                onClick={() => fetchSurahContent(surah)}
                className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 hover:border-amber-400/50 hover:bg-slate-800 transition-all text-right group active:scale-95 flex flex-col justify-between h-32"
                >
                <div className="flex justify-between items-start w-full">
                    <span className="w-8 h-8 flex items-center justify-center bg-slate-900 rounded-lg text-xs font-bold text-amber-400 border border-amber-400/20">
                    {surah.number}
                    </span>
                    <span className="font-amiri text-xl text-amber-100 group-hover:text-amber-400 transition-colors">
                    {surah.name}
                    </span>
                </div>
                <div className={`mt-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <p className="text-sm font-bold text-slate-200">{surah.englishName}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                    {surah.numberOfAyahs} {t.ayahs} • {surah.revelationType === 'Meccan' ? t.meccan : t.medinan}
                    </p>
                </div>
                </button>
            ))}
            </div>
        ) : (
            <div className="space-y-6">
                {bookmarks.length === 0 ? (
                    <div className="min-h-[300px] flex flex-col items-center justify-center text-center space-y-4 bg-slate-800/20 border-2 border-dashed border-slate-700 rounded-3xl p-8">
                        <Bookmark size={48} className="text-slate-600 mb-2" />
                        <h3 className="text-xl font-bold text-white">{t.noBookmarks}</h3>
                        <p className="text-slate-500 max-w-sm">{t.noBookmarksDesc}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {bookmarks.map((b) => (
                            <div 
                                key={b.ayahAbsoluteNumber} 
                                className="bg-slate-800/40 border border-slate-700/50 rounded-3xl overflow-hidden group hover:border-amber-400/30 transition-all relative shadow-xl"
                            >
                                <div className="bg-slate-950/60 p-6 border-b border-slate-800">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex flex-col">
                                            <span className="text-amber-400 font-amiri text-2xl">{b.surahName}</span>
                                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                                {t.ayahs} {b.ayahNumberInSurah}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => {
                                                    const s = surahs.find(su => su.number === b.surahNumber);
                                                    if (s) fetchSurahContent(s, b.ayahAbsoluteNumber);
                                                }}
                                                className="px-4 py-2 bg-amber-400 text-slate-900 rounded-full text-xs font-bold flex items-center gap-2"
                                            >
                                                <BookOpen size={14} />
                                                {t.backToIndex}
                                            </button>
                                            <button 
                                                onClick={() => setBookmarks(prev => prev.filter(item => item.ayahAbsoluteNumber !== b.ayahAbsoluteNumber))}
                                                className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <p 
                                      className={`${fontFamily} text-right text-amber-50 leading-relaxed`} 
                                      dir="rtl"
                                      style={{ fontSize: `${2 * fontSizeScale}rem` }}
                                    >
                                      {b.text}
                                    </p>
                                </div>
                                <div className="bg-slate-900/40 p-6">
                                    <p 
                                      className="text-slate-400 italic font-light"
                                      style={{ fontSize: `${1 * fontSizeScale}rem` }}
                                    >
                                      {b.translation}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
      ) : (
        <div className="space-y-8 pb-20">
          <button 
            onClick={() => {
              stopAudio();
              setSelectedSurah(null);
            }}
            className="flex items-center gap-2 text-amber-400 font-bold hover:text-amber-300 transition-colors mb-6"
          >
            {isRtl ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {t.back}
          </button>

          <div className="text-center space-y-4 mb-12">
            <h2 className="font-amiri text-5xl text-amber-200">{selectedSurah.name}</h2>
            <p className="text-xl text-slate-400 italic">"{selectedSurah.englishNameTranslation}"</p>
          </div>

          <div className="space-y-12">
            {ayahs.map((ayah, index) => {
              const isBookmarked = bookmarks.some(b => b.ayahAbsoluteNumber === ayah.number);
              const isActive = playingId === ayah.number;
              const hasTafsir = !!tafsirs[ayah.number];
              const isTafsirExpanded = expandedTafsirIds.has(ayah.number);

              return (
                <div 
                  key={ayah.number} 
                  id={`ayah-${ayah.number}`}
                  className={`group relative border border-slate-800/50 rounded-[2.5rem] overflow-hidden transition-all duration-700 shadow-lg ${isActive ? 'ring-2 ring-emerald-500/40 shadow-2xl scale-[1.01]' : 'hover:border-amber-400/20'}`}
                >
                  <div className={`p-8 md:p-10 transition-colors duration-500 ${isActive ? 'bg-slate-900/90' : 'bg-slate-950/60'}`}>
                    <div className="relative">
                      <span className={`absolute -top-10 -right-6 text-[10rem] font-black pointer-events-none select-none transition-colors duration-500 ${isActive ? 'text-emerald-500/5' : 'text-slate-800/5'}`}>
                        {ayah.numberInSurah}
                      </span>
                      <p 
                        className={`${fontFamily} text-right leading-[1.8] transition-colors duration-500 ${isActive ? 'text-emerald-100' : 'text-amber-50'}`}
                        style={{ fontSize: `${3 * fontSizeScale}rem` }}
                      >
                        {ayah.text}
                        <span 
                          className={`inline-flex items-center justify-center rounded-full border mr-6 font-sans translate-y-[-0.2em] transition-all duration-500 ${isActive ? 'border-emerald-400/50 text-emerald-400' : 'border-amber-400/30 text-amber-400/60'}`}
                          style={{ 
                            width: `${1.8 * fontSizeScale}rem`, 
                            height: `${1.8 * fontSizeScale}rem`, 
                            fontSize: `${0.6 * fontSizeScale}rem` 
                          }}
                        >
                          {ayah.numberInSurah}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className={`p-8 md:p-10 border-t border-slate-800/50 transition-colors duration-500 ${isActive ? 'bg-slate-800/80' : 'bg-slate-900/40'}`}>
                    <p 
                      className={`leading-relaxed font-light italic transition-colors duration-500 ${isActive ? 'text-slate-200' : 'text-slate-400'}`} 
                      style={{ fontSize: `${1.125 * fontSizeScale}rem` }}
                    >
                      {translationsAyahs[index]?.text}
                    </p>
                  </div>

                  <div className="bg-slate-950/80 px-8 py-5 flex items-center justify-between border-t border-slate-800/50">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleToggleAudio(ayah)}
                        disabled={audioLoadingId === ayah.number}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold border transition-all shadow-sm ${isActive ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-amber-400/30'}`}
                      >
                        {audioLoadingId === ayah.number ? <Loader2 size={14} className="animate-spin" /> : isActive ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                        <span>{isActive ? t.stop : t.play}</span>
                      </button>

                      <button 
                        onClick={() => handleExplain(ayah)} 
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold border transition-all ${explainingId === ayah.number ? 'bg-amber-400/10 border-amber-400/40 text-amber-400' : 'border-amber-400/20 text-amber-400 hover:bg-amber-400/5'}`}
                      >
                        {explainingId === ayah.number ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        {explainingId === ayah.number ? t.explaining : t.explain}
                      </button>

                      {hasTafsir && !explainingId && (
                        <button 
                          onClick={() => toggleTafsir(ayah.number)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all ${isTafsirExpanded ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-indigo-400 border border-indigo-500/20'}`}
                        >
                          {isTafsirExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          {isTafsirExpanded ? t.hideTafsir : t.showTafsir}
                        </button>
                      )}
                    </div>

                    <button 
                      onClick={() => toggleBookmark(ayah, index)} 
                      className={`p-2.5 rounded-full border transition-all ${isBookmarked ? 'bg-amber-400 text-slate-900 border-amber-400 shadow-md' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}
                    >
                      {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                    </button>
                  </div>

                  {hasTafsir && isTafsirExpanded && (
                    <div className="animate-in slide-in-from-top-2 duration-500 bg-indigo-950/40 border-t border-indigo-500/20 p-8 relative">
                      <div className="flex items-center gap-2 text-indigo-400 mb-4">
                        <Info size={18} />
                        <span className="text-xs font-bold uppercase tracking-widest">{t.tafsir}</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed italic text-lg whitespace-pre-line border-l-2 border-indigo-500/30 pl-4">
                        {tafsirs[ayah.number]}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuranView;
