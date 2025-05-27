'use client';
import React, { useState, useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface KeyboardGuideProps {
  className?: string;
}

export const KeyboardGuide: React.FC<KeyboardGuideProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  const toggleGuide = () => {
    setIsOpen(!isOpen);
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={toggleGuide}
        variant='outline'
        size='sm'
        className={`flex items-center font-sm text-gray-500 space-x-1`}
        title={t.keyboardGuideTooltip}
      >
        <Keyboard className='h-4 w-4' />
        <span className=''>{t.keyboardGuide}</span>
      </Button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className='fixed inset-0 bg-gray-50 bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4'
          onClick={e => e.target === e.currentTarget && setIsOpen(false)}
        >
          <div className='bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col'>
            {/* Header */}
            <div className='flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0'>
              <div className='flex items-center space-x-2'>
                <Keyboard className='h-5 w-5 text-indigo-600' />
                <h2 className='text-lg font-semibold text-gray-800'>
                  {t.nepaliKeyboardLayoutGuide}
                </h2>
              </div>
              <Button
                onClick={toggleGuide}
                variant='ghost'
                size='sm'
                className='text-gray-500 hover:text-gray-700'
                title={`${t.close} (Esc)`}
              >
                <X className='h-5 w-5' />
              </Button>
            </div>

            {/* Content */}
            <div className='flex-1 overflow-y-auto'>
              <div className='p-4 sm:p-6'>
                <div className='text-center mb-6'>
                  <p className='text-gray-600'>
                    {t.typeEnglishToNepali}
                  </p>
                </div>

                {/* Keyboard Layout Image */}
                <div className='flex justify-center mb-6'>
                  <div className='w-full max-w-4xl'>
                    <Image
                      width={'100'}
                      height={'100'}
                      src='/nplkeys.svg'
                      alt={t.nepaliKeyboardLayoutGuide}
                      className='w-full h-auto border border-gray-200 rounded-lg shadow-sm bg-white'
                      style={{ maxHeight: '50vh', objectFit: 'contain' }}
                    />
                  </div>
                </div>

                {/* Kudos Section */}
                <div className='bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-3 border border-purple-100'>
                  <div className='text-center'>
                    <p className='text-sm text-purple-700'>
                      {t.thanksToNepalify}{' '}
                      <a 
                        href="https://github.com/suvash/nepalify" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className='font-semibold text-purple-800 hover:text-purple-900 underline decoration-purple-300 hover:decoration-purple-500 transition-colors'
                      >
                        Suvash Thapaliya's Nepalify
                      </a>
                    </p>
                  </div>
                </div>

                {/* Keyboard Shortcuts */}
                <div className='mt-4 text-center'>
                  <p className='text-xs text-gray-500'>
                    {t.pressEscToClose.replace('ESC', '')}{' '}
                    <kbd className='px-2 py-1 bg-gray-100 rounded text-xs'>
                      Esc
                    </kbd>{' '}
                    {t.close.toLowerCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
