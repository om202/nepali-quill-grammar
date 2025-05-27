'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Check, X, ArrowRight } from 'lucide-react';

import { Suggestion } from '@/lib/api';
import { getSuggestionContainerColor } from '@/utils/colors';
import { useLanguage } from '@/contexts/LanguageContext';

interface SuggestionCardProps {
  suggestion: Suggestion;
  sessionId: string;
  onUpdate: (
    sessionId: string,
    suggestionId: string,
    action: 'accept' | 'reject'
  ) => Promise<void>;
  onSelect?: (suggestionId: string) => void;
  className?: string;
  index: number;
  total: number;
}

export function SuggestionCard({
  suggestion,
  sessionId,
  onUpdate,
  onSelect,
  className,
  index,
  total,
}: SuggestionCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();
  const colors = getSuggestionContainerColor(index, total);

  const handleAction = async (action: 'accept' | 'reject') => {
    setIsLoading(true);
    try {
      await onUpdate(sessionId, suggestion.id, action);
      toast.success(action === 'accept' ? t.suggestionAcceptedSuccessfully : t.suggestionRejectedSuccessfully);
    } catch (error) {
      toast.error(action === 'accept' ? t.failedToAcceptSuggestion : t.failedToRejectSuggestion);
      console.error('Action error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`border rounded-lg p-4 hover:shadow-sm transition-all duration-200 cursor-pointer ${className}`}
      style={{
        backgroundColor: colors.backgroundColor,
        borderColor: colors.borderColor,
      }}
      onClick={() => onSelect?.(suggestion.id)}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.hoverBackgroundColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = colors.backgroundColor;
      }}
    >
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center space-x-3'>
          <span 
            className='text-base font-medium'
            style={{ color: colors.textColor }}
          >
            {suggestion.originalText}
          </span>
          <ArrowRight className='h-4 w-4' style={{ color: colors.textColor }} />
          <span 
            className='text-base font-medium'
            style={{ color: colors.textColor }}
          >
            {suggestion.suggestedText}
          </span>
        </div>
      </div>

      <div className='flex space-x-2'>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAction('accept');
          }}
          disabled={isLoading}
          className='flex items-center bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-xs font-medium transition-colors-smooth hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
        >
          <Check className='h-3 w-3 mr-1' />
          {t.acceptButton}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAction('reject');
          }}
          disabled={isLoading}
          className='flex items-center border border-gray-300 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-md text-xs font-medium transition-colors-smooth disabled:opacity-50 disabled:cursor-not-allowed'
        >
          <X className='h-3 w-3 mr-1' />
          {t.rejectButton}
        </button>
      </div>
    </div>
  );
}
