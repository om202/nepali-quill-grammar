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
        <p className="mb-2">
          <span className="font-semibold">Original:</span>{' '}
          {suggestion.suggestedText}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('accept')}
            disabled={isLoading}
          >
            Accept
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('reject')}
            disabled={isLoading}
          >
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 