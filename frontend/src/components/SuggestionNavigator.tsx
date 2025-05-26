'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { 
  Check, 
  X, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
  SkipForward,
  SkipBack,
  Keyboard,
  ChevronDown,
  ChevronUp
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
  selectedSuggestionId?: string | null;
}

export function SuggestionNavigator({
  suggestions,
  sessionId,
  onUpdate,
  onSuggestionChange,
  selectedSuggestionId,
}: SuggestionNavigatorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showKeyboardGuide, setShowKeyboardGuide] = useState(false);
  
  // Track if the index change is from external selection to prevent circular updates
  const isExternalUpdateRef = useRef(false);

  // Reset to first suggestion when suggestions change
  useEffect(() => {
    if (suggestions.length > 0) {
      setCurrentIndex(0);
      onSuggestionChange?.(suggestions[0].id);
    } else {
      onSuggestionChange?.(null);
    }
  }, [suggestions, onSuggestionChange]);

  // Sync with external selection (when user clicks on highlighted text)
  useEffect(() => {
    if (selectedSuggestionId && suggestions.length > 0) {
      const suggestionIndex = suggestions.findIndex(s => s.id === selectedSuggestionId);
      if (suggestionIndex !== -1 && suggestionIndex !== currentIndex) {
        isExternalUpdateRef.current = true;
        setCurrentIndex(suggestionIndex);
      }
    }
  }, [selectedSuggestionId, suggestions]);

  // Update selected suggestion when index changes (only for internal navigation)
  useEffect(() => {
    if (suggestions.length > 0 && currentIndex < suggestions.length) {
      // Only notify parent if this wasn't triggered by external selection
      if (!isExternalUpdateRef.current) {
        onSuggestionChange?.(suggestions[currentIndex].id);
      } else {
        // Reset the flag after handling external update
        isExternalUpdateRef.current = false;
      }
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
      {/* Keyboard shortcuts toggle */}
      <button
        onClick={() => setShowKeyboardGuide(!showKeyboardGuide)}
        className='flex items-center justify-between w-full p-2 mb-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors text-left'
      >
        <div className='flex items-center space-x-2'>
          <Keyboard className='h-3.5 w-3.5 text-gray-600' />
          <span className='text-xs font-medium text-gray-700'>Keyboard Shortcuts</span>
        </div>
        {showKeyboardGuide ? (
          <ChevronUp className='h-3.5 w-3.5 text-gray-500' />
        ) : (
          <ChevronDown className='h-3.5 w-3.5 text-gray-500' />
        )}
      </button>

      {/* Collapsible keyboard guide */}
      {showKeyboardGuide && (
        <div className='bg-white border border-gray-200 rounded-lg p-3 mb-3'>
          <div className='space-y-1.5 text-xs text-gray-600'>
            <div className='flex items-center justify-between'>
              <span>Navigate</span>
              <div className='flex items-center space-x-1'>
                <kbd className='px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono'>←</kbd>
                <kbd className='px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono'>→</kbd>
                <span className='text-gray-400'>or</span>
                <kbd className='px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono'>↑</kbd>
                <kbd className='px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono'>↓</kbd>
              </div>
            </div>
            
            <div className='flex items-center justify-between'>
              <span>Accept</span>
              <kbd className='px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono'>Enter</kbd>
            </div>
            
            <div className='flex items-center justify-between'>
              <span>Reject</span>
              <div className='flex items-center space-x-1'>
                <kbd className='px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono'>Shift</kbd>
                <span className='text-gray-400'>+</span>
                <kbd className='px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono'>Enter</kbd>
                <span className='text-gray-400'>or</span>
                <kbd className='px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono'>Esc</kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress indicator */}
      <div className='flex items-center justify-between mb-3 text-xs text-gray-600'>
        <span>
          Suggestion {currentIndex + 1} of {suggestions.length}
        </span>
        <div className='flex space-x-1'>
          {suggestions.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Current suggestion */}
      <div
        className='border rounded-lg p-3 mb-3 transition-all duration-200'
        style={{
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
        }}
      >
        <div className='flex items-center space-x-2 mb-3'>
          <span 
            className='text-sm font-medium'
            style={{ color: colors.textColor }}
          >
            &quot;{currentSuggestion.originalText}&quot;
          </span>
          <ArrowRight className='h-3.5 w-3.5' style={{ color: colors.textColor }} />
          <span 
            className='text-sm font-medium'
            style={{ color: colors.textColor }}
          >
            &quot;{currentSuggestion.suggestedText}&quot;
          </span>
        </div>

        {/* Action buttons */}
        <div className='flex space-x-2'>
          <button
            onClick={() => handleAction('accept')}
            disabled={isLoading}
            className='flex-1 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <Check className='h-3.5 w-3.5 mr-1.5' />
            Accept
          </button>

          <button
            onClick={() => handleAction('reject')}
            disabled={isLoading}
            className='flex-1 flex items-center justify-center bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <X className='h-3.5 w-3.5 mr-1.5' />
            Reject
          </button>
        </div>
      </div>

      {/* Navigation controls */}
      <div className='flex items-center justify-between mb-2'>
        <div className='flex space-x-1'>
          <button
            onClick={goToFirst}
            disabled={currentIndex === 0}
            className='p-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            title='First suggestion'
          >
            <SkipBack className='h-3.5 w-3.5' />
          </button>
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className='p-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            title='Previous suggestion'
          >
            <ChevronLeft className='h-3.5 w-3.5' />
          </button>
        </div>

        <div className='flex space-x-1'>
          <button
            onClick={goToNext}
            disabled={currentIndex === suggestions.length - 1}
            className='p-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            title='Next suggestion'
          >
            <ChevronRight className='h-3.5 w-3.5' />
          </button>
          <button
            onClick={goToLast}
            disabled={currentIndex === suggestions.length - 1}
            className='p-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            title='Last suggestion'
          >
            <SkipForward className='h-3.5 w-3.5' />
          </button>
        </div>
      </div>
    </div>
  );
} 