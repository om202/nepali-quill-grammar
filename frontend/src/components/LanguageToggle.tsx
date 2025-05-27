'use client';

import React from 'react';
import { Globe } from 'lucide-react';

import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/lib/i18n';

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    const newLanguage: Language = language === 'ne' ? 'en' : 'ne';
    setLanguage(newLanguage);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
      title={`${t.language}: ${language === 'ne' ? t.nepali : t.english}`}
    >
      <Globe className="h-4 w-4" />
      <span className="hidden sm:inline">
        {language === 'ne' ? 'नेपाली' : 'English'}
      </span>
    </button>
  );
} 