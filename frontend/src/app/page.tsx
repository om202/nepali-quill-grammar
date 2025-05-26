'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SuggestionCard } from '@/components/suggestion-card';
import { analyzeText, updateSuggestion, APIError } from '@/lib/api';
import { toast } from 'sonner';
import { HighlightedTextEditor } from '@/components/HighlightedTextEditor';
import { RootState } from '@/store';
import { setSuggestions, removeSuggestion } from '@/store/suggestionsSlice';
import { setText } from '@/store/textSlice';

export default function Home() {
  const dispatch = useDispatch();
  const suggestions = useSelector((state: RootState) => state.suggestions.items);
  const text = useSelector((state: RootState) => state.text.value);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | null>(null);

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

  const handleSuggestionUpdate = async (sessionId: string, suggestionId: string, action: 'accept' | 'reject') => {
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
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Welcome message for authenticated users */}
      {isAuthenticated && user && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
            Welcome back, {user.name}!
          </h2>
          <p className="text-blue-700 dark:text-blue-300">
            Your text analysis sessions are now saved to your account.
          </p>
        </div>
      )}

      {/* Guest user notice */}
      {!isAuthenticated && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border">
          <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
            Using as Guest
          </h2>
          <p className="text-amber-700 dark:text-amber-300">
            Sign up or log in to save your text analysis sessions and access additional features.
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Enter Nepali Text</CardTitle>
          </CardHeader>
          <CardContent>
            <HighlightedTextEditor
              onSelectSuggestion={setSelectedSuggestionId}
            />
            {error && (
              <div className="text-red-500 text-sm mb-4">
                {error}
              </div>
            )}
            <Button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="w-full mt-4"
            >
              {isLoading ? 'Analyzing...' : 'Analyze Text'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            {suggestions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                {isLoading ? 'Analyzing...' : error ? 'Analysis failed' : 'No suggestions yet'}
              </p>
            ) : (
              <div className="space-y-4">
                {suggestions.map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    sessionId={sessionId!}
                    onUpdate={handleSuggestionUpdate}
                    className={selectedSuggestionId === suggestion.id ? 'ring-2 ring-blue-500' : ''}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
