'use client';

import React from 'react';
import {
  Bot,
  Zap,
  History as HistoryIcon,
  Keyboard,
  Sparkles,
} from 'lucide-react';

import { useLanguage } from '@/contexts/LanguageContext';

export const FeatureShowcase: React.FC = () => {
  const { t, language } = useLanguage();

  // Conditional classes for Nepali text
  const heroTitleClass =
    language === 'ne'
      ? 'text-[32px] text-gray-900 font-bold'
      : 'text-3xl font-bold text-gray-900';

  const heroSubtitleClass =
    language === 'ne'
      ? 'text-lg text-gray-600 leading-relaxed'
      : 'text-base text-gray-600 leading-relaxed';

  const featureTextClass =
    language === 'ne'
      ? 'nepali-feature-text font-semibold text-gray-700 group-hover:text-gray-900 transition-colors duration-300'
      : 'text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors duration-300';

  return (
    <div className='w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 py-12 px-4 mb-8'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-8'>
          <div className='flex items-center justify-center space-x-2 mb-3'>
            <Sparkles className='h-6 w-6 text-indigo-600' />
            <h2 className={heroTitleClass}>{t.heroTitle}</h2>
          </div>
        </div>

        {/* Feature Grid */}
        <div className='flex justify-center items-center space-x-12 mb-8'>
          <div className='flex flex-col items-center text-center group'>
            <Bot className='h-10 w-10 text-indigo-600 mb-2 transition-all duration-300 group-hover:scale-110 group-hover:text-indigo-700 feature-icon-bot' />
            <span className={featureTextClass}>{t.fixErrors}</span>
          </div>
          <div className='flex flex-col items-center text-center group'>
            <Zap className='h-10 w-10 text-purple-600 mb-2 transition-all duration-300 group-hover:scale-110 group-hover:text-purple-700 feature-icon-zap' />
            <span className={featureTextClass}>{t.improveStyle}</span>
          </div>
          <div className='flex flex-col items-center text-center group'>
            <HistoryIcon className='h-10 w-10 text-green-600 mb-2 transition-all duration-300 group-hover:scale-110 group-hover:text-green-700 feature-icon-history' />
            <span className={featureTextClass}>{t.saveWork}</span>
          </div>
          <div className='flex flex-col items-center text-center group'>
            <Keyboard className='h-10 w-10 text-blue-600 mb-2 transition-all duration-300 group-hover:scale-110 group-hover:text-blue-700 feature-icon-keyboard' />
            <span className={featureTextClass}>{t.typeFaster}</span>
          </div>
        </div>

        {/* Call to Action */}
        <div className='text-center'>
          <p className={heroSubtitleClass}>{t.heroSubtitle}</p>
        </div>
      </div>
    </div>
  );
};
