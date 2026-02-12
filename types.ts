
export interface VerseInspiration {
  verse: string;
  reference: string;
  translation: string;
  reflection: string;
}

export interface RamadanGreeting {
  arabicText: string;
  englishText: string;
  poeticNote: string;
}

export interface RamadanRecipe {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  nutritionTips: string;
}

export enum AppSection {
  HOME = 'home',
  INSPIRATION = 'inspiration',
  QURAN = 'quran',
  GREETINGS = 'greetings',
  RECIPES = 'recipes'
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
}
