'use client';
import React, { useRef, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import nepalify from 'nepalify';

import { RootState } from '@/store';
import { setText } from '@/store/textSlice';
import { Suggestion } from '@/lib/api';

interface NepaliTextEditorProps {
  onSelectSuggestion?: (suggestionId: string) => void;
}

export const NepaliTextEditor: React.FC<NepaliTextEditorProps> = ({
  onSelectSuggestion,
}) => {
  const dispatch = useDispatch();
  const text = useSelector((state: RootState) => state.text.value);
  const suggestions = useSelector(
    (state: RootState) => state.suggestions.items
  ) as Suggestion[];

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const nepalifyInstanceRef = useRef<{
    isEnabled(): boolean;
    enable(): void;
    disable(): void;
  } | null>(null);

  // Unique ID for the textarea
  const textareaId = 'nepali-text-editor';

  // Initialize Nepalify when component mounts
  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }

    // Clean up previous instance
    if (nepalifyInstanceRef.current) {
      try {
        nepalifyInstanceRef.current.disable();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('Error disabling previous nepalify instance:', error);
      }
    }

    try {
      // Initialize nepalify on the textarea with romanized layout
      const instance = nepalify.interceptElementById(textareaId, {
        layout: 'romanized',
        enable: true,
      });

      nepalifyInstanceRef.current = instance;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error initializing Nepalify:', error);
    }

    // Cleanup function
    return () => {
      if (nepalifyInstanceRef.current) {
        try {
          nepalifyInstanceRef.current.disable();
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn('Error during cleanup:', error);
        }
      }
    };
  }, []);

  // Handle textarea input
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    dispatch(setText(newText));
  };

  // Sync Redux text with textarea value
  useEffect(() => {
    if (textareaRef.current && textareaRef.current.value !== text) {
      textareaRef.current.value = text;
    }
  }, [text]);

  // Build highlighted text for overlay
  const getHighlightedHTML = useCallback(() => {
    if (!text && !suggestions.length) {
      const placeholderText = 'यहाँ नेपाली पाठ लेख्नुहोस्...';
      return `<span class="text-gray-500">${placeholderText}</span>`;
    }
    if (!suggestions.length) {
return escapeHTML(text);
}

    let html = '';
    let lastIndex = 0;
    const sortedSuggestions: Suggestion[] = [...suggestions].sort(
      (a, b) => a.startIndex - b.startIndex
    );

    sortedSuggestions.forEach((s: Suggestion) => {
      if (
        s.startIndex === undefined ||
        s.endIndex === undefined ||
        s.startIndex < lastIndex ||
        s.startIndex >= s.endIndex
      ) {
        return;
      }

      html += escapeHTML(text.slice(lastIndex, s.startIndex));
      html += `<span class='underline text-red-600 bg-red-100 cursor-pointer' data-suggestion-id='${s.id}'>`;
      html += escapeHTML(text.slice(s.startIndex, s.endIndex));
      html += '</span>';
      lastIndex = s.endIndex;
    });

    html += escapeHTML(text.slice(lastIndex));
    return html;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, suggestions]);

  // Escape HTML to prevent XSS
  const escapeHTML = useCallback((str: string) => {
    return str.replace(/[&<>"']/g, function (tag) {
      const chars: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };
      return chars[tag] || tag;
    });
  }, []);

  // Handle click on suggestion highlight in overlay
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.dataset.suggestionId && onSelectSuggestion) {
      onSelectSuggestion(target.dataset.suggestionId);
    }
  };

  // Update overlay content when text or suggestions change
  useEffect(() => {
    if (overlayRef.current) {
      overlayRef.current.innerHTML = getHighlightedHTML();
    }
  }, [getHighlightedHTML]);

  return (
    <div className='w-full h-full flex flex-col'>
      {/* Text Editor Container */}
      <div className='flex-1 relative border border-gray-300 rounded-lg bg-white'>
        {/* Textarea for actual input */}
        <textarea
          ref={textareaRef}
          id={textareaId}
          className='absolute inset-0 w-full h-full p-6 bg-transparent resize-none focus:outline-none text-lg text-gray-800 leading-relaxed z-10'
          value={text}
          onChange={handleTextareaChange}
          placeholder='यहाँ नेपाली पाठ लेख्नुहोस्...'
          spellCheck={false}
          autoComplete='off'
          autoCorrect='off'
          autoCapitalize='off'
          style={{
            fontFamily: "'Noto Sans Devanagari', 'Mangal', sans-serif",
            color: suggestions.length > 0 ? 'transparent' : 'inherit', // Hide text when showing suggestions
          }}
        />

        {/* Overlay for highlighting suggestions */}
        {suggestions.length > 0 && (
          <div
            ref={overlayRef}
            className='absolute inset-0 w-full h-full p-6 pointer-events-none text-lg  text-gray-700 leading-relaxed z-20 whitespace-pre-wrap'
            onClick={handleOverlayClick}
            style={{
              fontFamily: "'Noto Sans Devanagari', 'Mangal', sans-serif",
              pointerEvents: 'auto', // Allow clicks on suggestions
            }}
          />
        )}
      </div>
    </div>
  );
};
