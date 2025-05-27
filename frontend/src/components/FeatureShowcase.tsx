'use client';

import React from 'react';
import { Bot, Zap, History as HistoryIcon, Keyboard, Sparkles, X } from 'lucide-react';

interface FeatureShowcaseProps {
  onDismiss: () => void;
}

export const FeatureShowcase: React.FC<FeatureShowcaseProps> = ({
  onDismiss,
}) => {
  return (
    <div className='grammarly-status-info mb-4 w-full relative'>
      <button
        onClick={onDismiss}
        className='absolute top-2 right-2 text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors-smooth'
        aria-label='Dismiss message'
      >
        <X className='h-4 w-4' />
      </button>
      
      {/* Header */}
      <div className='flex items-center justify-center space-x-2 mb-6'>
        <Sparkles className='h-6 w-6' />
        <span className='font-semibold text-lg'>Perfect Your Nepali Writing</span>
      </div>
      
      {/* Feature Grid */}
      <div className='flex justify-center items-center space-x-8 mb-6'>
        <div className='flex flex-col items-center text-center group'>
          <Bot className='h-8 w-8 text-indigo-600 mb-2 transition-all duration-300 group-hover:scale-110 group-hover:text-indigo-700 feature-icon-bot' />
          <span className='text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300'>Fix Errors</span>
        </div>
        <div className='flex flex-col items-center text-center group'>
          <Zap className='h-8 w-8 text-purple-600 mb-2 transition-all duration-300 group-hover:scale-110 group-hover:text-purple-700 feature-icon-zap' />
          <span className='text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300'>Improve Style</span>
        </div>
        <div className='flex flex-col items-center text-center group'>
          <HistoryIcon className='h-8 w-8 text-green-600 mb-2 transition-all duration-300 group-hover:scale-110 group-hover:text-green-700 feature-icon-history' />
          <span className='text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300'>Save Work</span>
        </div>
        <div className='flex flex-col items-center text-center group'>
          <Keyboard className='h-8 w-8 text-blue-600 mb-2 transition-all duration-300 group-hover:scale-110 group-hover:text-blue-700 feature-icon-keyboard' />
          <span className='text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300'>Type Faster</span>
        </div>
      </div>
      
      {/* Call to Action */}
      <p className='text-sm text-center text-gray-600'>
        Write better Nepali instantly. <span className='font-medium text-indigo-700'>Sign up free</span> to start using Vyakaranly.
      </p>
    </div>
  );
}; 