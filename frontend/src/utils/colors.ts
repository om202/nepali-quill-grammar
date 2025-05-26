import chroma from 'chroma-js';

// Generate a color palette with distinct colors for suggestions
export const generateSuggestionColors = (count: number) => {
  if (count === 0) return [];
  
  // Use a color scale that provides good contrast and readability
  const baseColors = [
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Violet
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6366F1', // Indigo
  ];

  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }

  // If we need more colors than our base set, generate them using chroma
  const scale = chroma.scale(['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'])
    .mode('hsl')
    .colors(count);
  
  return scale;
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
  const colors = generateSuggestionColors(total);
  const color = colors[index % colors.length];
  return getSuggestionColorPair(color);
};

// Generate colors for highlighted text in editor
export const getHighlightColor = (index: number, total: number) => {
  const colors = generateSuggestionColors(total);
  const color = colors[index % colors.length];
  return getSuggestionColorPair(color, 0.15);
}; 