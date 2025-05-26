'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SuggestionCard } from '@/components/suggestion-card';
import { analyzeText, updateSuggestion, APIError } from '@/lib/api';
import { toast } from 'sonner';
import { HighlightedTextEditor } from '@/components/HighlightedTextEditor';
import { Provider } from 'react-redux';
import { store, RootState } from '@/store';
import { setSuggestions, removeSuggestion } from '@/store/suggestionsSlice';

export default function Home() {
  const dispatch = useDispatch();
  const suggestions = useSelector((state: RootState) => state.suggestions.items);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | null>(null);

  const handleAnalyze = async () => {
    const text = store.getState().text.value;
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
      await updateSuggestion(sessionId, suggestionId, action);
      dispatch(removeSuggestion(suggestionId));
      setSelectedSuggestionId(null);
      if (suggestions.length === 1) {
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
    <Provider store={store}>
      <main className="container mx-auto p-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 text-center">NepaliQuill</h1>
        
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
      </main>
    </Provider>
  );
}
