'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Suggestion } from '@/lib/api';
import { toast } from 'sonner';
import { Check, X, ArrowRight, Lightbulb } from 'lucide-react';

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
    <div className={`grammarly-suggestion ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Lightbulb className="h-4 w-4 text-blue-600" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Grammar Enhancement
              </span>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-600 font-medium">Original:</span>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded font-medium">
                  {suggestion.originalText}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mb-3">
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 font-medium text-sm">Suggested improvement:</span>
            </div>
            
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-medium text-sm">
                {suggestion.suggestedText}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={() => handleAction('accept')}
              disabled={isLoading}
              className="grammarly-suggestion-accept"
              size="sm"
            >
              <Check className="h-4 w-4 mr-1" />
              Accept
            </Button>
            <Button
              onClick={() => handleAction('reject')}
              disabled={isLoading}
              className="grammarly-suggestion-reject"
              size="sm"
            >
              <X className="h-4 w-4 mr-1" />
              Ignore
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 