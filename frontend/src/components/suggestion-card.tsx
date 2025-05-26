'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Check, X, ArrowRight } from 'lucide-react';

import { Suggestion } from '@/lib/api';

interface SuggestionCardProps {
  suggestion: Suggestion;
  sessionId: string;
  onUpdate: (
    sessionId: string,
    suggestionId: string,
    action: 'accept' | 'reject'
  ) => Promise<void>;
  className?: string;
}

export function SuggestionCard({
  suggestion,
  sessionId,
  onUpdate,
  className,
}: SuggestionCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: 'accept' | 'reject') => {
    setIsLoading(true);
    try {
      await onUpdate(sessionId, suggestion.id, action);
      toast.success(`Suggestion ${action}ed successfully`);
    } catch (error) {
      toast.error(`Failed to ${action} suggestion`);
      console.error('Action error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors-smooth hover:shadow-sm ${className}`}
    >
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center space-x-3'>
          <span className='text-red-700 text-base font-medium'>
            {suggestion.originalText}
          </span>
          <ArrowRight className='h-4 w-4 text-gray-400' />
          <span className='text-green-700 text-base font-medium'>
            {suggestion.suggestedText}
          </span>
        </div>
      </div>

      <div className='flex space-x-2'>
        <button
          onClick={() => handleAction('accept')}
          disabled={isLoading}
          className='flex items-center bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-xs font-medium transition-colors-smooth hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
        >
          <Check className='h-3 w-3 mr-1' />
          Accept
        </button>

        <button
          onClick={() => handleAction('reject')}
          disabled={isLoading}
          className='flex items-center border border-gray-300 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-md text-xs font-medium transition-colors-smooth disabled:opacity-50 disabled:cursor-not-allowed'
        >
          <X className='h-3 w-3 mr-1' />
          Reject
        </button>
      </div>
    </div>
  );
}
