'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Suggestion } from '@/lib/api';
import { toast } from 'sonner';

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
    <Card className={className}>
      <CardContent className="p-4">
        <div className="mb-3">
          <p className="mb-1">
            <span className="font-semibold">Original:</span>{' '}
            <span className="text-red-600">{suggestion.originalText}</span>
          </p>
          <p className="mb-2">
            <span className="font-semibold">Suggested:</span>{' '}
            <span className="text-green-600">{suggestion.suggestedText}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('accept')}
            disabled={isLoading}
            className="text-green-600 border-green-600 hover:bg-green-50"
          >
            Accept
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('reject')}
            disabled={isLoading}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 