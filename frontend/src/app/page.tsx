'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
  CheckCircle,
  Zap,
  Sparkles,
  History as HistoryIcon,
  Edit3,
  Bot,
  X,
  List,
  Navigation,
  Keyboard,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SuggestionCard } from '@/components/suggestion-card';
import { SuggestionNavigator } from '@/components/SuggestionNavigator';
import { History } from '@/components/History';
import { analyzeText, updateSuggestion, APIError } from '@/lib/api';
import { NepaliTextEditor } from '@/components/NepaliTextEditor';
import { KeyboardGuide } from '@/components/KeyboardGuide';
import { RootState } from '@/store';
import { setSuggestions, removeSuggestion } from '@/store/suggestionsSlice';
import { setText } from '@/store/textSlice';


export default function Home() {
  const dispatch = useDispatch();
  const suggestions = useSelector(
    (state: RootState) => state.suggestions.items
  );
  const text = useSelector((state: RootState) => state.text.value);
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<
    string | null
  >(null);
  const [activeTab, setActiveTab] = useState('enhance');
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [showFreeTrialMessage, setShowFreeTrialMessage] = useState(true);
  const [suggestionViewMode, setSuggestionViewMode] = useState<'list' | 'navigate'>('navigate');
  const [listModeSelectedIndex, setListModeSelectedIndex] = useState(0);
  const [showListKeyboardGuide, setShowListKeyboardGuide] = useState(false);

  // Use refs to prevent unnecessary re-renders
  const isScrollingRef = useRef(false);
  const lastSuggestionsLengthRef = useRef(0);
  const suggestionsRef = useRef(suggestions);
  const suggestionViewModeRef = useRef(suggestionViewMode);

  // Update refs when values change
  useEffect(() => {
    suggestionsRef.current = suggestions;
  }, [suggestions]);

  useEffect(() => {
    suggestionViewModeRef.current = suggestionViewMode;
  }, [suggestionViewMode]);

  // Check if welcome message should be shown
  useEffect(() => {
    if (isAuthenticated && user) {
      const welcomeKey = `welcome-dismissed-${user.id}`;
      const isDismissed = localStorage.getItem(welcomeKey);
      setShowWelcomeMessage(!isDismissed);

      // Auto-hide after 5 seconds if not manually dismissed
      if (!isDismissed) {
        const timer = setTimeout(() => {
          setShowWelcomeMessage(false);
        }, 5000);

        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, user]);

  const dismissFreeTrialMessage = () => {
    setShowFreeTrialMessage(false);
  };

  const dismissWelcomeMessage = () => {
    if (user) {
      const welcomeKey = `welcome-dismissed-${user.id}`;
      localStorage.setItem(welcomeKey, 'true');
    }
    setShowWelcomeMessage(false);
  };

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to analyze');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await analyzeText(text);
      dispatch(setSuggestions(response.suggestions));
      setSessionId(response.sessionId);
      if (response.suggestions.length === 0) {
        toast.info('No suggestions found for the given text');
      } else {
        toast.success('Text analyzed successfully');
      }
    } catch (error) {
      let errorMessage = 'Failed to analyze text';
      if (error instanceof APIError) {
        errorMessage = error.message;
        if (error.statusCode === 500) {
          errorMessage = 'Server error: ' + error.message;
        } else if (error.statusCode === 0) {
          errorMessage = 'Connection error: ' + error.message;
        }
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionUpdate = useCallback(async (
    sessionId: string,
    suggestionId: string,
    action: 'accept' | 'reject'
  ) => {
    if (!sessionId) {
      toast.error('No active session');
      return;
    }

    try {
      const result = await updateSuggestion(sessionId, suggestionId, action);

      // If suggestion was accepted, update the text with the enhanced version
      if (action === 'accept') {
        dispatch(setText(result.enhancedText));
        // Update suggestions to show remaining pending suggestions
        dispatch(setSuggestions(result.pendingSuggestions));
      } else {
        // If rejected, just remove this suggestion
        dispatch(removeSuggestion(suggestionId));
      }

      setSelectedSuggestionId(null);

      // If no more suggestions, clear session
      if (result.pendingSuggestions.length === 0) {
        setSessionId(null);
      }
    } catch (error) {
      let errorMessage = 'Failed to update suggestion';
      if (error instanceof APIError) {
        errorMessage = error.message;
        if (error.statusCode === 500) {
          errorMessage = 'Server error: ' + error.message;
        } else if (error.statusCode === 0) {
          errorMessage = 'Connection error: ' + error.message;
        }
      }
      toast.error(errorMessage);
      throw error;
    }
  }, [dispatch]);

  // Keyboard navigation for list mode
  useEffect(() => {
    if (suggestionViewMode !== 'list' || suggestions.length === 0) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          setListModeSelectedIndex(prev => {
            const newIndex = Math.max(0, prev - 1);
            setSelectedSuggestionId(suggestionsRef.current[newIndex]?.id || null);
            return newIndex;
          });
          break;
        case 'ArrowDown':
          event.preventDefault();
          setListModeSelectedIndex(prev => {
            const newIndex = Math.min(suggestionsRef.current.length - 1, prev + 1);
            setSelectedSuggestionId(suggestionsRef.current[newIndex]?.id || null);
            return newIndex;
          });
          break;
        case 'Enter':
          event.preventDefault();
          if (suggestionsRef.current[listModeSelectedIndex]) {
            if (event.shiftKey) {
              handleSuggestionUpdate(sessionId!, suggestionsRef.current[listModeSelectedIndex].id, 'reject');
            } else {
              handleSuggestionUpdate(sessionId!, suggestionsRef.current[listModeSelectedIndex].id, 'accept');
            }
          }
          break;
        case 'Escape':
          event.preventDefault();
          if (suggestionsRef.current[listModeSelectedIndex]) {
            handleSuggestionUpdate(sessionId!, suggestionsRef.current[listModeSelectedIndex].id, 'reject');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [suggestionViewMode, suggestions.length, listModeSelectedIndex, sessionId, handleSuggestionUpdate]);

  // Reset list mode selection when suggestions change (only when suggestions actually change)
  useEffect(() => {
    // Only reset if suggestions array actually changed, not just re-rendered
    if (suggestionViewMode === 'list' && suggestions.length > 0 && 
        suggestions.length !== lastSuggestionsLengthRef.current) {
      lastSuggestionsLengthRef.current = suggestions.length;
      setListModeSelectedIndex(0);
      setSelectedSuggestionId(suggestions[0].id);
    }
  }, [suggestions.length, suggestionViewMode]);

  // Auto-scroll to selected suggestion in list mode (debounced)
  useEffect(() => {
    if (suggestionViewMode === 'list' && suggestions.length > 0 && !isScrollingRef.current) {
      const timeoutId = setTimeout(() => {
        const selectedElement = document.querySelector(`[data-suggestion-index="${listModeSelectedIndex}"]`) as HTMLElement;
        if (selectedElement) {
          const container = selectedElement.closest('.overflow-y-auto') as HTMLElement;
          if (container) {
            const containerRect = container.getBoundingClientRect();
            const elementRect = selectedElement.getBoundingClientRect();
            
            const buffer = 40;
            const isOutOfView = 
              elementRect.top < containerRect.top + buffer || 
              elementRect.bottom > containerRect.bottom - buffer;
            
            if (isOutOfView) {
              isScrollingRef.current = true;
              const elementTop = selectedElement.offsetTop;
              const containerHeight = container.clientHeight;
              const elementHeight = selectedElement.offsetHeight;
              
              let newScrollTop;
              if (elementRect.top < containerRect.top + buffer) {
                newScrollTop = elementTop - buffer;
              } else {
                newScrollTop = elementTop - containerHeight + elementHeight + buffer;
              }
              
              container.scrollTo({
                top: Math.max(0, newScrollTop),
                behavior: 'smooth'
              });

              // Reset scrolling flag after animation
              setTimeout(() => {
                isScrollingRef.current = false;
              }, 300);
            }
          }
        }
      }, 50);

      return () => clearTimeout(timeoutId);
    }
  }, [listModeSelectedIndex, suggestionViewMode, suggestions.length]);

  // Function to scroll to a specific suggestion in the suggestions panel
  const scrollToSuggestion = useCallback((suggestionId: string) => {
    const suggestionIndex = suggestionsRef.current.findIndex(s => s.id === suggestionId);
    if (suggestionIndex === -1) {
      return;
    }

    if (suggestionViewModeRef.current === 'list') {
      // Prevent circular updates
      setListModeSelectedIndex(prev => {
        if (prev !== suggestionIndex) {
          return suggestionIndex;
        }
        return prev;
      });
    }
  }, []);

  // Enhanced suggestion selection handler
  const handleSuggestionSelect = useCallback((suggestionId: string) => {
    setSelectedSuggestionId(prev => {
      if (prev !== suggestionId) {
        scrollToSuggestion(suggestionId);
        return suggestionId;
      }
      return prev;
    });
  }, [scrollToSuggestion]);

  return (
    <div className='h-screen bg-gray-50 flex flex-col overflow-hidden'>
      <div className='px-6 py-6 flex-shrink-0'>
        {/* Status Messages */}
        {isAuthenticated && user && showWelcomeMessage && (
          <div className='grammarly-status-success mb-8 max-w-2xl mx-auto relative'>
            <button
              onClick={dismissWelcomeMessage}
              className='absolute top-2 right-2 text-green-600 hover:text-green-800 cursor-pointer transition-colors-smooth'
              aria-label='Dismiss welcome message'
            >
              <X className='h-4 w-4' />
            </button>
            <div className='flex items-center justify-center space-x-2'>
              <CheckCircle className='h-5 w-5' />
              <span className='font-semibold'>
                Welcome, {user.name.split(' ')[0]}!
              </span>
            </div>
          </div>
        )}

        {!isAuthenticated && showFreeTrialMessage && (
          <div className='grammarly-status-info mb-8 max-w-2xl mx-auto relative'>
            <button
              onClick={dismissFreeTrialMessage}
              className='absolute top-2 right-2 text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors-smooth'
              aria-label='Dismiss message'
            >
              <X className='h-4 w-4' />
            </button>
            <div className='flex items-center justify-center space-x-2'>
              <Sparkles className='h-5 w-5' />
              <span className='font-semibold'>Try Vyakaranly for free</span>
            </div>
            <p className='mt-2 text-sm text-center'>
              Sign up to save your sessions and unlock additional features.
            </p>
          </div>
        )}

        {/* Main Content with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='grid w-full grid-cols-2 gap-2 mb-0 max-w-md mx-auto'>
            <TabsTrigger
              value='enhance'
              className='flex items-center space-x-2 font-medium data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 transition-colors-smooth'
            >
              <Zap className='h-4 w-4' />
              <span>Enhance</span>
            </TabsTrigger>
            <TabsTrigger
              value='history'
              className='flex items-center space-x-2 font-medium data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 transition-colors-smooth'
            >
              <HistoryIcon className='h-4 w-4' />
              <span>History</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Full width content area - constrained to remaining viewport height */}
      <div className='flex-1 w-full px-4 pb-8 min-h-0 overflow-hidden'>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='w-full h-full'
        >
          <TabsContent value='enhance' className='h-full'>
            <div className='flex flex-col lg:flex-row gap-6 h-full max-h-full'>
              {/* Text Input Section */}
              <div className='w-full lg:w-[70%] grammarly-card flex flex-col h-full max-h-full'>
                <div className='flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0'>
                  <div className='flex items-center space-x-6'>
                    <div className='flex items-center space-x-2'>
                      <Edit3 className='h-5 w-5 text-indigo-600' />
                      <span className='text-gray-700 font-medium'>Text</span>
                    </div>
                    <KeyboardGuide />
                  </div>
                  <Button
                    onClick={handleAnalyze}
                    disabled={isLoading || !text.trim()}
                    className='bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-medium px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:via-purple-600 disabled:hover:to-indigo-600'
                  >
                    {isLoading ? (
                      <>
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap className='h-4 w-4 mr-2' />
                        Enhance Text
                      </>
                    )}
                  </Button>
                </div>
                <div className='flex-1 flex flex-col p-4 min-h-0'>
                  <div className='flex-1 mb-4 min-h-0'>
                    <NepaliTextEditor
                      onSelectSuggestion={handleSuggestionSelect}
                      selectedSuggestionId={selectedSuggestionId}
                      viewMode={suggestionViewMode}
                    />
                  </div>
                  {error && (
                    <div className='grammarly-status-error mb-4 flex-shrink-0'>
                      {error}
                    </div>
                  )}
                </div>
              </div>

              {/* Suggestions Panel - 30% width, constrained height */}
              <div className='w-full lg:w-[30%] grammarly-card flex flex-col h-full max-h-full border-2 border-transparent bg-clip-padding'>
                <div className='flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0'>
                  <div className='flex items-center space-x-2'>
                    <Bot className='h-5 w-5 text-purple-600' />
                    <span className='text-gray-700 font-medium'>Suggestions</span>
                    {suggestions.length > 0 && (
                      <span className='bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full border border-green-200'>
                        {suggestions.length} suggestion
                        {suggestions.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  
                  {/* View Mode Toggle */}
                  {suggestions.length > 0 && (
                    <div className='flex items-center space-x-1 bg-gray-100 rounded-md p-1'>
                      <button
                        onClick={() => setSuggestionViewMode('list')}
                        className={`p-1.5 rounded text-xs font-medium transition-colors ${
                          suggestionViewMode === 'list'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                        title='List view - Show all suggestions'
                      >
                        <List className='h-3.5 w-3.5' />
                      </button>
                      <button
                        onClick={() => setSuggestionViewMode('navigate')}
                        className={`p-1.5 rounded text-xs font-medium transition-colors ${
                          suggestionViewMode === 'navigate'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                        title='Navigate view - Review one by one'
                      >
                        <Navigation className='h-3.5 w-3.5' />
                      </button>
                    </div>
                  )}
                </div>

                <div className='flex-1 overflow-y-auto min-h-0 p-4'>
                  {suggestions.length === 0 ? (
                    <div className='flex flex-col items-center justify-center h-full text-center py-12'>
                      {isLoading ? (
                        <>
                          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4'></div>
                          <p className='text-gray-600'>
                            Analyzing your text...
                          </p>
                        </>
                      ) : error ? (
                        <>
                          <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4'>
                            <span className='text-red-500 text-lg'>!</span>
                          </div>
                          <p className='text-gray-600'>
                            Analysis failed. Please try again.
                          </p>
                        </>
                      ) : (
                        <>
                          <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
                            <Sparkles className='h-6 w-6 text-gray-400' />
                          </div>
                          <p className='text-gray-600 mb-2'>
                            No suggestions
                          </p>
                        </>
                      )}
                    </div>
                  ) : suggestionViewMode === 'navigate' ? (
                    <SuggestionNavigator
                      suggestions={suggestions}
                      sessionId={sessionId!}
                      onUpdate={handleSuggestionUpdate}
                      onSuggestionChange={setSelectedSuggestionId}
                      selectedSuggestionId={selectedSuggestionId}
                    />
                  ) : (
                    <div className='space-y-4'>
                      {/* Keyboard guide toggle for list mode */}
                      <button
                        onClick={() => setShowListKeyboardGuide(!showListKeyboardGuide)}
                        className='flex items-center justify-between w-full p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors text-left'
                      >
                        <div className='flex items-center space-x-2'>
                          <Keyboard className='h-3.5 w-3.5 text-gray-600' />
                          <span className='text-xs font-medium text-gray-700'>Keyboard Shortcuts</span>
                        </div>
                        {showListKeyboardGuide ? (
                          <ChevronUp className='h-3.5 w-3.5 text-gray-500' />
                        ) : (
                          <ChevronDown className='h-3.5 w-3.5 text-gray-500' />
                        )}
                      </button>

                      {/* Collapsible keyboard guide for list mode */}
                      {showListKeyboardGuide && (
                        <div className='bg-white border border-gray-200 rounded-lg p-3'>
                          <div className='space-y-1.5 text-xs text-gray-600'>
                            <div className='flex items-center justify-between'>
                              <span>Navigate</span>
                              <div className='flex items-center space-x-1'>
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

                      {suggestions.map((suggestion, index) => (
                        <div
                          key={suggestion.id}
                          data-suggestion-index={index}
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <SuggestionCard
                            suggestion={suggestion}
                            sessionId={sessionId!}
                            onUpdate={handleSuggestionUpdate}
                            onSelect={(suggestionId) => {
                              handleSuggestionSelect(suggestionId);
                            }}
                            index={index}
                            total={suggestions.length}
                            className={
                              selectedSuggestionId === suggestion.id
                                ? 'ring-2 ring-blue-500'
                                : ''
                            }
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value='history' className='h-full'>
            <div className='px-6 h-full'>
              <History />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
