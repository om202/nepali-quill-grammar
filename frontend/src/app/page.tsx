'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SuggestionCard } from '@/components/suggestion-card';
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
      console.log('API Response:', response);
      console.log('Suggestions:', response.suggestions);
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
      console.error('Analysis error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionUpdate = async (
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
      console.error('Update error:', error);
      throw error;
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col'>
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

      {/* Full width content area */}
      <div className='flex-1 w-full px-4 pb-8 min-h-0'>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='w-full h-full'
        >
          <TabsContent value='enhance' className='h-full'>
            <div className='flex flex-col lg:flex-row gap-6 h-full'>
              {/* Text Input Section */}
              <div className='w-full lg:w-[70%] grammarly-card flex flex-col min-h-0'>
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
                <div className='flex-1 flex flex-col min-h-[400px] p-4'>
                  <div className='flex-1 min-h-[300px] mb-4'>
                    <NepaliTextEditor
                      onSelectSuggestion={setSelectedSuggestionId}
                    />
                  </div>
                  {error && (
                    <div className='grammarly-status-error mb-4 flex-shrink-0'>
                      {error}
                    </div>
                  )}
                </div>
              </div>

              {/* Suggestions Panel - 30% width */}
              <div className='w-full lg:w-[30%] grammarly-card flex flex-col min-h-0 border-2 border-transparent bg-clip-padding'>
                <div className='flex items-center space-x-2 p-4 border-b border-gray-200 flex-shrink-0'>
                  <Bot className='h-5 w-5 text-purple-600' />
                  <span className='text-gray-700 font-medium'>Suggestions</span>
                  {suggestions.length > 0 && (
                    <span className='bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full border border-green-200'>
                      {suggestions.length} suggestion
                      {suggestions.length !== 1 ? 's' : ''}
                    </span>
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
                  ) : (
                    <div className='space-y-4'>
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={suggestion.id}
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <SuggestionCard
                            suggestion={suggestion}
                            sessionId={sessionId!}
                            onUpdate={handleSuggestionUpdate}
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
