'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

import { useLanguage } from '@/contexts/LanguageContext';

export const FAQSection: React.FC = () => {
  const { t } = useLanguage();
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className='w-full bg-white py-16 px-4'>
      <div className='max-w-4xl mx-auto'>
        {/* Section Header */}
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold text-gray-900 mb-4'>
            {t.faqTitle}
          </h2>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            {t.faqSubtitle}
          </p>
        </div>

        {/* FAQ Items */}
        <div className='space-y-4'>
          {t.faqData.map((item, index) => (
            <div
              key={index}
              className='border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors duration-200'
            >
              <button
                onClick={() => toggleItem(index)}
                className='w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:bg-gray-50'
              >
                <span className='font-semibold text-gray-900 pr-4'>
                  {item.question}
                </span>
                {openItems.includes(index) ? (
                  <ChevronUp className='h-5 w-5 text-gray-500 flex-shrink-0' />
                ) : (
                  <ChevronDown className='h-5 w-5 text-gray-500 flex-shrink-0' />
                )}
              </button>
              
              {openItems.includes(index) && (
                <div className='px-6 pb-4 pt-2 border-t border-gray-100 bg-gray-50'>
                  <p className='text-gray-700 leading-relaxed'>
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className='text-center mt-12 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg'>
          <h3 className='text-xl font-semibold text-gray-900 mb-2'>
            {t.stillHaveQuestions}
          </h3>
          <p className='text-gray-600 mb-4'>
            {t.faqSubtitle}
          </p>
          <button className='bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200'>
            {t.contactSupport}
          </button>
        </div>
      </div>
    </div>
  );
}; 