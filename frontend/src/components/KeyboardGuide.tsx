'use client';
import React, { useState, useEffect } from 'react';
import { Keyboard, X, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface KeyboardGuideProps {
  className?: string;
}

export const KeyboardGuide: React.FC<KeyboardGuideProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

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
        variant="outline"
        size="sm"
        className={`flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-300 transition-colors ${className}`}
        title="Show Nepali Keyboard Layout (Press Esc to close)"
      >
        <Keyboard className="h-4 w-4" />
        <span className="hidden sm:inline">Keyboard Guide</span>
        <span className="sm:hidden">Guide</span>
      </Button>

      {/* Modal Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4"
          onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center space-x-2">
                <Keyboard className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-800">
                  Nepali Keyboard Layout Guide
                </h2>
              </div>
              <Button
                onClick={toggleGuide}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
                title="Close (Esc)"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="text-center mb-4">
                  <p className="text-gray-600 mb-2">
                    Use this guide to understand the Nepali keyboard layout mapping
                  </p>
                  <p className="text-sm text-gray-500">
                    Type in English characters to get Nepali Devanagari script
                  </p>
                </div>

                {/* Keyboard Layout Image */}
                <div className="flex justify-center mb-6">
                  <div className="w-full max-w-4xl">
                    <img
                      src="/nplkeys.svg"
                      alt="Nepali Keyboard Layout"
                      className="w-full h-auto border border-gray-200 rounded-lg shadow-sm bg-white"
                      style={{ maxHeight: '50vh', objectFit: 'contain' }}
                    />
                  </div>
                </div>

                {/* Instructions */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Info className="h-4 w-4 text-blue-600" />
                      <h3 className="font-medium text-blue-800">How to use:</h3>
                    </div>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Type English characters as shown in the layout</li>
                      <li>• Text automatically converts to Nepali Devanagari</li>
                      <li>• Use the romanized layout for intuitive typing</li>
                      <li>• Press space or punctuation to complete words</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Keyboard className="h-4 w-4 text-green-600" />
                      <h3 className="font-medium text-green-800">Examples:</h3>
                    </div>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• <code className="bg-white px-1 rounded">namaste</code> → नमस्ते</li>
                      <li>• <code className="bg-white px-1 rounded">nepal</code> → नेपाल</li>
                      <li>• <code className="bg-white px-1 rounded">dhanyawaad</code> → धन्यवाद</li>
                      <li>• <code className="bg-white px-1 rounded">swagatam</code> → स्वागतम्</li>
                    </ul>
                  </div>
                </div>

                {/* Keyboard Shortcuts */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Esc</kbd> to close this guide
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