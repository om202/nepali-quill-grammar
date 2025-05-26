import chroma from 'chroma-js';

// Simple seeded random number generator for consistent colors
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Generate a color palette with super random distinct colors for suggestions
export const generateSuggestionColors = (count: number) => {
  if (count === 0) {
    return [];
  }
  
  const colors: string[] = [];
  
  for (let i = 0; i < count; i++) {
    // Use seeded random for consistent colors across re-renders
    const seed = i * 1234.5678; // Different seed for each index
    
    // Generate completely random colors with good saturation and lightness
    const hue = seededRandom(seed) * 360; // Random hue (0-360)
    const saturation = 0.6 + seededRandom(seed + 1) * 0.4; // Saturation between 60-100%
    const lightness = 0.4 + seededRandom(seed + 2) * 0.3; // Lightness between 40-70% for good contrast
    
    const color = chroma.hsl(hue, saturation, lightness).hex();
    colors.push(color);
  }
  
  return colors;
};

// Generate background and text colors for a suggestion
export const getSuggestionColorPair = (color: string, opacity: number = 0.1) => {
  const baseColor = chroma(color);
  
  return {
    backgroundColor: baseColor.alpha(opacity).css(),
    borderColor: baseColor.alpha(0.3).css(),
    textColor: baseColor.darken(1).css(),
    hoverBackgroundColor: baseColor.alpha(opacity + 0.05).css(),
  };
};

// Get color for suggestion container
export const getSuggestionContainerColor = (index: number, total: number) => {
  return getSuggestionColorByIndex(index, total, 0.1);
};

// Generate colors for highlighted text in editor
export const getHighlightColor = (index: number, total: number) => {
  return getSuggestionColorByIndex(index, total, 0.15);
};

// Shared base function for getting suggestion colors by index
export const getSuggestionColorByIndex = (index: number, total: number, opacity: number = 0.1) => {
  const colors = generateSuggestionColors(total);
  const color = colors[index % colors.length];
  return getSuggestionColorPair(color, opacity);
}; 