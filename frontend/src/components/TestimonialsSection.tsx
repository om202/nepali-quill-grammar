'use client';

import React from 'react';
import { Star, Quote } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface TestimonialsSectionProps {
  onSignUpClick: () => void;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  onSignUpClick,
}) => {
  const { t } = useLanguage();

  return (
    <div className='w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 py-16 px-4'>
      <div className='max-w-6xl mx-auto'>
        {/* Section Header */}
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold text-gray-900 mb-4'>
            {t.whatUsersAreSaying}
          </h2>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            {t.testimonialsSubtitle}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className='grid md:grid-cols-3 gap-8'>
          {/* Testimonial 1 */}
          <div className='bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 group testimonial-card-1'>
            <div className='flex items-center mb-4'>
              <div className='flex space-x-1'>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className='h-4 w-4 text-yellow-400 fill-current' />
                ))}
              </div>
            </div>
            <Quote className='h-8 w-8 text-indigo-200 mb-4 group-hover:text-indigo-300 transition-colors duration-300' />
            <p className='text-gray-700 mb-6 leading-relaxed'>
              "{t.testimonial1Text}"
            </p>
            <div className='flex items-center'>
              <div className='w-10 h-10 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold text-sm'>
                प्र
              </div>
              <div className='ml-3'>
                <p className='font-semibold text-gray-900'>{t.testimonial1Name}</p>
                <p className='text-sm text-gray-600'>{t.testimonial1Title}</p>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className='bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 group testimonial-card-2'>
            <div className='flex items-center mb-4'>
              <div className='flex space-x-1'>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className='h-4 w-4 text-yellow-400 fill-current' />
                ))}
              </div>
            </div>
            <Quote className='h-8 w-8 text-purple-200 mb-4 group-hover:text-purple-300 transition-colors duration-300' />
            <p className='text-gray-700 mb-6 leading-relaxed'>
              "{t.testimonial2Text}"
            </p>
            <div className='flex items-center'>
              <div className='w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold text-sm'>
                A
              </div>
              <div className='ml-3'>
                <p className='font-semibold text-gray-900'>{t.testimonial2Name}</p>
                <p className='text-sm text-gray-600'>{t.testimonial2Title}</p>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className='bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 group testimonial-card-3'>
            <div className='flex items-center mb-4'>
              <div className='flex space-x-1'>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className='h-4 w-4 text-yellow-400 fill-current' />
                ))}
              </div>
            </div>
            <Quote className='h-8 w-8 text-blue-200 mb-4 group-hover:text-blue-300 transition-colors duration-300' />
            <p className='text-gray-700 mb-6 leading-relaxed'>
              "{t.testimonial3Text}"
            </p>
            <div className='flex items-center'>
              <div className='w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center text-white font-semibold text-sm'>
                र
              </div>
              <div className='ml-3'>
                <p className='font-semibold text-gray-900'>{t.testimonial3Name}</p>
                <p className='text-sm text-gray-600'>{t.testimonial3Title}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className='text-center mt-12'>
          <p className='text-gray-600 mb-6'>
            {t.readyToImprove}
          </p>
          <Button
            onClick={onSignUpClick}
            className='bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300'
          >
            {t.startWritingBetter}
          </Button>
        </div>
      </div>
    </div>
  );
}; 