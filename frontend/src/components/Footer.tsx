'use client';

import React from 'react';
import Image from 'next/image';
import { Heart } from 'lucide-react';

import { useLanguage } from '@/contexts/LanguageContext';

export const Footer: React.FC = () => {
  const { t, language } = useLanguage();

  // Conditional classes for Nepali text
  const companyNameClass = language === 'ne'
    ? 'nepali-body-text font-bold text-2xl text-gray-900 mb-2'
    : 'font-bold text-2xl text-gray-900 mb-2';
    
  const companyLocationClass = language === 'ne'
    ? 'nepali-body-text text-gray-600 text-lg'
    : 'text-gray-600 text-lg';
    
  const rightsTextClass = language === 'ne'
    ? 'nepali-body-text text-gray-700 text-lg mb-4 font-medium'
    : 'text-gray-700 text-lg mb-4 font-medium';
    
  const madeWithTextClass = language === 'ne'
    ? 'nepali-body-text text-gray-600 text-base flex items-center justify-center md:justify-end space-x-2'
    : 'text-gray-600 text-base flex items-center justify-center md:justify-end space-x-2';

  return (
    <footer className='w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 py-20 px-4'>
      <div className='max-w-6xl mx-auto'>
        <div className='flex flex-col md:flex-row items-center justify-between'>
          {/* Logo and Company Info */}
          <div className='flex flex-col items-center md:items-start mb-12 md:mb-0'>
            <Image
              src='/nb2.png'
              alt='Noble Stack'
              width={120}
              height={120}
              className='mb-6'
            />
            <div className='text-center md:text-left'>
              <h3 className={companyNameClass}>{t.companyName}</h3>
              <p className={companyLocationClass}>{t.companyLocation}</p>
            </div>
          </div>

          {/* Rights and Love */}
          <div className='text-center md:text-right'>
            <p className={rightsTextClass}>
              © {new Date().getFullYear()} {t.companyName} {t.allRightsReserved}.
            </p>
            <p className={madeWithTextClass}>
              <span>{t.madeWith}</span>
              <Heart className='h-5 w-5 text-red-500 fill-current' />
              <span>{t.inNepal}</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}; 