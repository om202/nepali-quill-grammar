'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  Check, 
  X, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
  SkipForward,
  SkipBack
} from 'lucide-react';

import { Suggestion } from '@/lib/api';
import { getSuggestionContainerColor } from '@/utils/colors';

interface SuggestionNavigatorProps {
  suggestions: Suggestion[];
  sessionId: string;
  onUpdate: (
    sessionId: string,
    suggestionId: string,
    action: 'accept' | 'reject'
  ) => Promise<void>;
  onSuggestionChange?: (suggestionId: string | null) => void;
}

export function SuggestionNavigator({
  suggestions,
  sessionId,
  onUpdate,
  onSuggestionChange,
}: SuggestionNavigatorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Reset to first suggestion when suggestions change
  useEffect(() => {
    if (suggestions.length > 0) {
      setCurrentIndex(0);
      onSuggestionChange?.(suggestions[0].id);
    } else {
      onSuggestionChange?.(null);
    }
  }, [suggestions, onSuggestionChange]);

  // Update selected suggestion when index changes
  useEffect(() => {
    if (suggestions.length > 0 && currentIndex < suggestions.length) {
      onSuggestionChange?.(suggestions[currentIndex].id);
    }
  }, [currentIndex, suggestions, onSuggestionChange]);

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => {
      if (prev < suggestions.length - 1) {
        return prev + 1;
      }
      return prev;
    });
  }, [suggestions.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => {
      if (prev > 0) {
        return prev - 1;
      }
      return prev;
    });
  }, []);

  const goToFirst = useCallback(() => {
    setCurrentIndex(0);
  }, []);

  const goToLast = useCallback(() => {
    setCurrentIndex(suggestions.length - 1);
  }, [suggestions.length]);

  const handleAction = useCallback(async (action: 'accept' | 'reject') => {
    if (suggestions.length === 0 || isLoading) {
return;
}

    const currentSuggestion = suggestions[currentIndex];
    setIsLoading(true);

    try {
      await onUpdate(sessionId, currentSuggestion.id, action);
      toast.success(`Suggestion ${action}ed successfully`);
      
      // After action, adjust index if needed
      if (currentIndex >= suggestions.length - 1) {
        // If we're at the last suggestion, go to previous
        setCurrentIndex(Math.max(0, currentIndex - 1));
      }
      // If not at last suggestion, stay at same index (next suggestion will slide into place)
    } catch (error) {
      toast.error(`Failed to ${action} suggestion`);
      // eslint-disable-next-line no-console
      console.error('Action error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [suggestions, currentIndex, isLoading, sessionId, onUpdate]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (suggestions.length === 0) {
return;
}

      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          goToNext();
          break;
        case 'Enter':
          event.preventDefault();
          if (event.shiftKey) {
            handleAction('reject');
          } else {
            handleAction('accept');
          }
          break;
        case 'Escape':
          event.preventDefault();
          handleAction('reject');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [suggestions.length, goToNext, goToPrevious, handleAction]);

  if (suggestions.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center h-full text-center py-12'>
        <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
          <Check className='h-6 w-6 text-gray-400' />
        </div>
        <p className='text-gray-600 mb-2'>No suggestions</p>
        <p className='text-sm text-gray-500'>All suggestions have been reviewed</p>
      </div>
    );
  }

  const currentSuggestion = suggestions[currentIndex];
  const colors = getSuggestionContainerColor(currentIndex, suggestions.length);

  return (
    <div className='flex flex-col h-full'>
      {/* Progress indicator */}
      <div className='flex items-center justify-between mb-4 text-sm text-gray-600'>
        <span>
          Suggestion {currentIndex + 1} of {suggestions.length}
        </span>
        <div className='flex space-x-1'>
          {suggestions.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Current suggestion */}
      <div
        className='flex-1 border rounded-lg p-4 mb-4 transition-all duration-200'
        style={{
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
        }}
      >
        <div className='flex items-center space-x-3 mb-4'>
          <span 
            className='text-base font-medium'
            style={{ color: colors.textColor }}
          >
            &quot;{currentSuggestion.originalText}&quot;
          </span>
          <ArrowRight className='h-4 w-4' style={{ color: colors.textColor }} />
          <span 
            className='text-base font-medium'
            style={{ color: colors.textColor }}
          >
            &quot;{currentSuggestion.suggestedText}&quot;
          </span>
        </div>

        {/* Action buttons */}
        <div className='flex space-x-3'>
          <button
            onClick={() => handleAction('accept')}
            disabled={isLoading}
            className='flex-1 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-md font-medium transition-colors hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <Check className='h-4 w-4 mr-2' />
            Accept
          </button>

          <button
            onClick={() => handleAction('reject')}
            disabled={isLoading}
            className='flex-1 flex items-center justify-center border border-gray-300 text-gray-600 hover:bg-gray-100 px-4 py-3 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <X className='h-4 w-4 mr-2' />
            Reject
          </button>
        </div>
      </div>

      {/* Navigation controls */}
      <div className='flex items-center justify-between'>
        <div className='flex space-x-1'>
          <button
            onClick={goToFirst}
            disabled={currentIndex === 0}
            className='p-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            title='First suggestion'
          >
            <SkipBack className='h-4 w-4' />
          </button>
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className='p-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            title='Previous suggestion'
          >
            <ChevronLeft className='h-4 w-4' />
          </button>
        </div>

        <div className='flex space-x-1'>
          <button
            onClick={goToNext}
            disabled={currentIndex === suggestions.length - 1}
            className='p-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            title='Next suggestion'
          >
            <ChevronRight className='h-4 w-4' />
          </button>
          <button
            onClick={goToLast}
            disabled={currentIndex === suggestions.length - 1}
            className='p-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            title='Last suggestion'
          >
            <SkipForward className='h-4 w-4' />
          </button>
        </div>
      </div>

      {/* Keyboard shortcuts help */}
      <div className='mt-4 text-xs text-gray-500 text-center'>
        <div className='space-y-1'>
          <div>← → or ↑ ↓ to navigate</div>
          <div>Enter to accept • Shift+Enter or Esc to reject</div>
        </div>
      </div>
    </div>
  );
} 