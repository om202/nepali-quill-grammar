'use client';

import { generateSuggestionColors, getSuggestionContainerColor } from '@/utils/colors';

export function ColorDemo() {
  const demoSuggestions = [
    { id: '1', text: 'Suggestion 1' },
    { id: '2', text: 'Suggestion 2' },
    { id: '3', text: 'Suggestion 3' },
    { id: '4', text: 'Suggestion 4' },
    { id: '5', text: 'Suggestion 5' },
    { id: '6', text: 'Suggestion 6' },
    { id: '7', text: 'Suggestion 7' },
    { id: '8', text: 'Suggestion 8' },
  ];

  const colors = generateSuggestionColors(demoSuggestions.length);

  return (
    <div className='p-6 space-y-4'>
      <h2 className='text-xl font-bold text-gray-900'>Color Palette Demo</h2>
      
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {demoSuggestions.map((suggestion, index) => {
          const colorPair = getSuggestionContainerColor(index, demoSuggestions.length);
          
          return (
            <div
              key={suggestion.id}
              className='p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md'
              style={{
                backgroundColor: colorPair.backgroundColor,
                borderColor: colorPair.borderColor,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colorPair.hoverBackgroundColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colorPair.backgroundColor;
              }}
            >
              <div 
                className='font-medium text-center'
                style={{ color: colorPair.textColor }}
              >
                {suggestion.text}
              </div>
              <div className='text-xs text-center mt-2 opacity-75'>
                Color: {colors[index]}
              </div>
            </div>
          );
        })}
      </div>

      <div className='mt-8'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>Base Color Palette</h3>
        <div className='flex flex-wrap gap-2'>
          {colors.map((color, index) => (
            <div
              key={index}
              className='w-12 h-12 rounded-lg border-2 border-gray-300 flex items-center justify-center text-xs font-mono text-white shadow-sm'
              style={{ backgroundColor: color }}
              title={color}
            >
              {index + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 