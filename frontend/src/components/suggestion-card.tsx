'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Suggestion } from '@/lib/api';
import { toast } from 'sonner';
import { Check, X, ArrowRight } from 'lucide-react';

interface SuggestionCardProps {
  suggestion: Suggestion;
  sessionId: string;
  onUpdate: (sessionId: string, suggestionId: string, action: 'accept' | 'reject') => Promise<void>;
  className?: string;
}

export function SuggestionCard({ suggestion, sessionId, onUpdate, className }: SuggestionCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: 'accept' | 'reject') => {
    setIsLoading(true);
    try {
      await onUpdate(sessionId, suggestion.id, action);
      toast.success(`Suggestion ${action}ed successfully`);
    } catch (error) {
      toast.error(`Failed to ${action} suggestion`);
      console.error('Action error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`bg-white border border-gray-200 p-4 hover:border-gray-300 transition-smooth hover:shadow-sm hover:scale-[1.01] ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-red-700 bg-red-100 px-2 py-1 text-sm font-medium transition-colors-smooth">
            {suggestion.originalText}
          </span>
          <ArrowRight className="h-4 w-4 text-gray-400 transition-colors-smooth" />
          <span className="text-green-700 bg-green-100 px-2 py-1 text-sm font-medium transition-colors-smooth">
            {suggestion.suggestedText}
          </span>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Button
          onClick={() => handleAction('accept')}
          disabled={isLoading}
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs font-medium transition-smooth hover:shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <Check className="h-3 w-3 mr-1 transition-transform-smooth" />
          Accept
        </Button>
        <Button
          onClick={() => handleAction('reject')}
          disabled={isLoading}
          size="sm"
          variant="outline"
          className="border-gray-300 text-gray-600 hover:bg-gray-100 px-3 py-1 text-xs font-medium transition-smooth hover:shadow-sm hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <X className="h-3 w-3 mr-1 transition-transform-smooth" />
          Ignore
        </Button>
      </div>
    </div>
  );
} 