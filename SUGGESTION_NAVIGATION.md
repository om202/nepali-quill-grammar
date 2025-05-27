# Suggestion Navigation Feature

## Overview

The suggestion navigation feature provides two viewing modes for reviewing text suggestions:

1. **List Mode**: Shows all suggestions at once (original behavior) with the ability to click and select individual suggestions
2. **Navigate Mode**: Shows suggestions one by one with navigation controls for a focused review experience

Users can easily switch between modes using toggle buttons in the suggestions panel.

## Features

### View Modes

#### List Mode

- **Show All**: Display all suggestions simultaneously in the text editor
- **Click to Select**: Click on any suggestion card to highlight it in the text
- **Visual Selection**: Selected suggestions have a blue ring and border highlight
- **Bulk Review**: See the full scope of suggestions at once

#### Navigate Mode

- **One at a Time**: Show only the current suggestion highlighted in the text
- **Navigation Controls**: Next/Previous buttons and keyboard shortcuts
- **Progress Indicator**: Visual dots showing current position and total suggestions
- **Focused Review**: Concentrate on one suggestion without distractions

### Actions (Both Modes)

- **Accept**: Apply the suggestion to the text
- **Reject**: Dismiss the suggestion without applying it

### Keyboard Shortcuts (Navigate Mode)

- `←` or `↑`: Previous suggestion
- `→` or `↓`: Next suggestion
- `Enter`: Accept current suggestion
- `Shift + Enter`: Reject current suggestion
- `Esc`: Reject current suggestion

## Implementation Details

### Components

#### SuggestionNavigator

- Handles the navigate mode with one-by-one suggestion review
- Shows navigation controls and progress indicators
- Manages keyboard shortcuts and user interactions
- Located at: `frontend/src/components/SuggestionNavigator.tsx`

#### SuggestionCard (Updated)

- Enhanced with click-to-select functionality for list mode
- Prevents event bubbling on action buttons
- Shows visual selection state with ring styling
- Located at: `frontend/src/components/suggestion-card.tsx`

#### NepaliTextEditor (Updated)

- Supports both view modes through `viewMode` prop
- In list mode: highlights all suggestions with click-to-select
- In navigate mode: highlights only the selected suggestion
- Maintains consistent styling and interaction patterns

### Key Changes

1. **Dual Mode Support**: The application now supports both list and navigate viewing modes with a toggle switch.

2. **Mode-Aware Highlighting**: The text editor adapts its highlighting behavior based on the selected view mode.

3. **Interactive Selection**: In list mode, users can click on suggestion cards to select and highlight them in the text.

4. **Persistent Navigation**: The navigate mode retains all original keyboard shortcuts and navigation features.

5. **Visual Mode Toggle**: Clear toggle buttons allow users to switch between modes instantly.

## Usage

### Getting Started

1. **Analyze Text**: Enter text and click "Enhance Text" to get suggestions
2. **Choose View Mode**: Use the toggle buttons (List/Navigate icons) to select your preferred mode

### List Mode Workflow

1. **Overview**: See all suggestions highlighted in the text simultaneously
2. **Select**: Click on any suggestion card to focus on it in the text editor
3. **Review**: The selected suggestion will have a blue ring and border highlight
4. **Act**: Accept or reject suggestions using the buttons on each card

### Navigate Mode Workflow

1. **Focus**: Only the current suggestion is highlighted in the text
2. **Navigate**: Use arrow keys or navigation buttons to move between suggestions
3. **Review**: Each suggestion shows the original text and proposed replacement
4. **Act**: Accept or reject using buttons or keyboard shortcuts
5. **Progress**: Track your position with the visual progress indicators

## Benefits

### List Mode Benefits

- **Complete Overview**: See all suggestions and their context simultaneously
- **Flexible Selection**: Jump to any suggestion without sequential navigation
- **Efficient Bulk Review**: Quickly scan and prioritize suggestions
- **Familiar Interface**: Traditional suggestion review experience

### Navigate Mode Benefits

- **Focused Review**: Concentrate on one suggestion at a time
- **Reduced Cognitive Load**: Less visual clutter and distraction
- **Efficient Navigation**: Keyboard shortcuts enable rapid review
- **Clear Progress**: Always know your position in the suggestion list
- **Guided Workflow**: Sequential review ensures no suggestions are missed

### Combined Benefits

- **User Choice**: Pick the mode that fits your workflow and preferences
- **Seamless Switching**: Change modes at any time during review
- **Consistent Actions**: Accept/reject functionality works the same in both modes
- **Unified Experience**: Shared styling and interaction patterns across modes

## Technical Notes

- Both modes share the same underlying suggestion data and API interactions
- The text editor dynamically adapts its highlighting based on the selected view mode
- Keyboard events are properly scoped to navigate mode to avoid conflicts
- State management ensures smooth transitions between modes
- Error handling and loading states are consistent across both modes
- The implementation maintains backward compatibility with existing suggestion workflows
