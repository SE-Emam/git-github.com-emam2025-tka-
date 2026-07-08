import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from '@/src/lib/translations';

export type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  isRtl: boolean;
  t: (key: any) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'ar',
  setLanguage: () => {},
  toggleLanguage: () => {},
  isRtl: true,
  t: (key: any) => key,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar'); // Default to Arabic
  const t = useTranslation(language);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
  };

  useEffect(() => {
    // Update the document direction based on language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, isRtl: language === 'ar', t }}>
      <div className={language === 'ar' ? 'font-arabic text-right dir-rtl dir-ar' : 'font-sans text-left dir-ltr dir-en'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};
