'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Copy,
  Download,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getSession, DiffModel, Suggestion } from '@/lib/api';
import { getSuggestionContainerColor } from '@/utils/colors';

interface SessionDetailProps {
  sessionId: string;
  onBack: () => void;
}

export function SessionDetail({ sessionId, onBack }: SessionDetailProps) {
  const [sessionData, setSessionData] = useState<DiffModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessionData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSession(sessionId);
      setSessionData(data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load session details';
      setError(errorMessage);
      toast.error('Failed to load session details');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSessionData();
  }, [fetchSessionData]);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type} copied to clipboard`);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const downloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${filename} downloaded`);
  };

  const renderHighlightedText = (
    text: string,
    suggestions: Suggestion[],
    isOriginal: boolean = true
  ) => {
    if (!suggestions.length) {
      return <span>{text}</span>;
    }

    const result = [];
    let lastIndex = 0;

    // Sort suggestions by start index
    const sortedSuggestions = [...suggestions].sort(
      (a, b) => a.startIndex - b.startIndex
    );

    sortedSuggestions.forEach((suggestion, index) => {
      // Add text before suggestion
      if (suggestion.startIndex > lastIndex) {
        result.push(
          <span key={`text-${index}`}>
            {text.slice(lastIndex, suggestion.startIndex)}
          </span>
        );
      }

      // Add highlighted suggestion with unique color
      const suggestionText = text.slice(
        suggestion.startIndex,
        suggestion.endIndex
      );
      
      // Get unique color for this suggestion
      const colors = getSuggestionContainerColor(index, suggestions.length);
      
      // Override color based on action status
      let finalColors = colors;
      if (suggestion.action === 'accept') {
        finalColors = {
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderColor: 'rgba(34, 197, 94, 0.3)',
          textColor: 'rgb(21, 128, 61)',
          hoverBackgroundColor: 'rgba(34, 197, 94, 0.15)',
        };
      } else if (suggestion.action === 'reject') {
        finalColors = {
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'rgba(239, 68, 68, 0.3)',
          textColor: 'rgb(153, 27, 27)',
          hoverBackgroundColor: 'rgba(239, 68, 68, 0.15)',
        };
      }

      result.push(
        <span
          key={`suggestion-${suggestion.id}`}
          className='px-1 py-0.5 rounded font-medium border'
          style={{
            backgroundColor: finalColors.backgroundColor,
            borderColor: finalColors.borderColor,
            color: finalColors.textColor,
          }}
          title={
            isOriginal
              ? `Original: "${suggestionText}" → Suggested: "${suggestion.suggestedText}" (${suggestion.action || 'pending'})`
              : `Applied suggestion: "${suggestion.suggestedText}"`
          }
        >
          {isOriginal ? suggestionText : suggestion.suggestedText}
        </span>
      );

      lastIndex = suggestion.endIndex;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      result.push(<span key='text-end'>{text.slice(lastIndex)}</span>);
    }

    return <>{result}</>;
  };

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center space-x-4'>
          <Button
            variant='outline'
            onClick={onBack}
            className='flex items-center space-x-2'
          >
            <ArrowLeft className='h-4 w-4' />
            <span>Back to History</span>
          </Button>
        </div>

        <div className='grammarly-card p-8 text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading session details...</p>
        </div>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center space-x-4'>
          <Button
            variant='outline'
            onClick={onBack}
            className='flex items-center space-x-2'
          >
            <ArrowLeft className='h-4 w-4' />
            <span>Back to History</span>
          </Button>
        </div>

        <div className='grammarly-card p-8 text-center'>
          <XCircle className='h-12 w-12 text-red-400 mx-auto mb-4' />
          <h3 className='text-base font-medium text-gray-900 mb-2'>
            Failed to load session
          </h3>
          <p className='text-gray-600 mb-4'>{error}</p>
          <Button
            onClick={fetchSessionData}
            className='grammarly-button-primary'
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  const allSuggestions = [
    ...sessionData.appliedSuggestions,
    ...sessionData.pendingSuggestions,
  ];
  const acceptedCount = sessionData.appliedSuggestions.filter(
    s => s.action === 'accept'
  ).length;
  const rejectedCount = allSuggestions.filter(
    s => s.action === 'reject'
  ).length;
  const pendingCount = sessionData.pendingSuggestions.length;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <Button
          variant='outline'
          onClick={onBack}
          className='flex items-center space-x-2'
        >
          <ArrowLeft className='h-4 w-4' />
          <span>Back to History</span>
        </Button>

        <div className='text-sm text-gray-500'>Session ID: {sessionId}</div>
      </div>

      {/* Statistics */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='grammarly-card p-4 text-center'>
          <FileText className='h-8 w-8 text-indigo-600 mx-auto mb-2' />
          <div className='text-xl font-semibold text-gray-900'>
            {allSuggestions.length}
          </div>
          <div className='text-sm text-gray-600'>Total Suggestions</div>
        </div>
        <div className='grammarly-card p-4 text-center'>
          <CheckCircle className='h-8 w-8 text-green-600 mx-auto mb-2' />
          <div className='text-xl font-semibold text-gray-900'>
            {acceptedCount}
          </div>
          <div className='text-sm text-gray-600'>Accepted</div>
        </div>
        <div className='grammarly-card p-4 text-center'>
          <XCircle className='h-8 w-8 text-red-600 mx-auto mb-2' />
          <div className='text-xl font-semibold text-gray-900'>
            {rejectedCount}
          </div>
          <div className='text-sm text-gray-600'>Rejected</div>
        </div>
        <div className='grammarly-card p-4 text-center'>
          <Clock className='h-8 w-8 text-orange-600 mx-auto mb-2' />
          <div className='text-xl font-semibold text-gray-900'>
            {pendingCount}
          </div>
          <div className='text-sm text-gray-600'>Pending</div>
        </div>
      </div>

      {/* Text Comparison */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Original Text */}
        <div className='grammarly-card p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-medium text-gray-900 flex items-center space-x-2'>
              <FileText className='h-5 w-5' />
              <span>Original Text</span>
            </h3>
            <div className='flex space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  copyToClipboard(sessionData.originalText, 'Original text')
                }
                className='flex items-center space-x-1'
              >
                <Copy className='h-4 w-4' />
                <span>Copy</span>
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  downloadText(sessionData.originalText, 'original-text.txt')
                }
                className='flex items-center space-x-1'
              >
                <Download className='h-4 w-4' />
                <span>Download</span>
              </Button>
            </div>
          </div>
          <div className='bg-gray-50 rounded-lg p-4 min-h-[200px]'>
            <div className='text-gray-900 leading-relaxed whitespace-pre-wrap'>
              {renderHighlightedText(
                sessionData.originalText,
                allSuggestions,
                true
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Text */}
        <div className='grammarly-card p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-medium text-gray-900 flex items-center space-x-2'>
              <CheckCircle className='h-5 w-5 text-green-600' />
              <span>Enhanced Text</span>
            </h3>
            <div className='flex space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  copyToClipboard(sessionData.enhancedText, 'Enhanced text')
                }
                className='flex items-center space-x-1'
              >
                <Copy className='h-4 w-4' />
                <span>Copy</span>
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  downloadText(sessionData.enhancedText, 'enhanced-text.txt')
                }
                className='flex items-center space-x-1'
              >
                <Download className='h-4 w-4' />
                <span>Download</span>
              </Button>
            </div>
          </div>
          <div className='bg-green-50 rounded-lg p-4 min-h-[200px]'>
            <div className='text-gray-900 leading-relaxed whitespace-pre-wrap'>
              {renderHighlightedText(
                sessionData.enhancedText,
                sessionData.appliedSuggestions,
                false
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Suggestions List */}
      {allSuggestions.length > 0 && (
        <div className='grammarly-card p-6'>
          <h3 className='text-lg font-medium text-gray-900 mb-4'>
            All Suggestions
          </h3>
          <div className='space-y-3'>
            {allSuggestions.map((suggestion, index) => {
              const colors = getSuggestionContainerColor(index, allSuggestions.length);
              
              return (
                <div
                  key={suggestion.id}
                  className='flex items-center justify-between p-4 rounded-lg border'
                  style={{
                    backgroundColor: colors.backgroundColor,
                    borderColor: colors.borderColor,
                  }}
                >
                  <div className='flex items-center space-x-4 flex-1'>
                    <div className='flex items-center space-x-2'>
                      <span 
                        className='font-medium'
                        style={{ color: colors.textColor }}
                      >
                        "{suggestion.originalText}"
                      </span>
                      <ArrowRight 
                        className='h-4 w-4' 
                        style={{ color: colors.textColor }}
                      />
                      <span 
                        className='font-medium'
                        style={{ color: colors.textColor }}
                      >
                        "{suggestion.suggestedText}"
                      </span>
                    </div>
                  </div>

                  <div className='flex items-center space-x-2'>
                    {suggestion.action === 'accept' && (
                      <div className='flex items-center space-x-1 text-green-600'>
                        <CheckCircle className='h-4 w-4' />
                        <span className='text-sm font-medium'>Accepted</span>
                      </div>
                    )}
                    {suggestion.action === 'reject' && (
                      <div className='flex items-center space-x-1 text-red-600'>
                        <XCircle className='h-4 w-4' />
                        <span className='text-sm font-medium'>Rejected</span>
                      </div>
                    )}
                    {!suggestion.action && (
                      <div className='flex items-center space-x-1 text-orange-600'>
                        <Clock className='h-4 w-4' />
                        <span className='text-sm font-medium'>Pending</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className='grammarly-card p-4'>
        <h4 className='text-sm font-medium text-gray-700 mb-3'>Legend:</h4>
        <div className='flex flex-wrap gap-4 text-sm'>
          <div className='flex items-center space-x-2'>
            <span className='px-2 py-1 bg-green-100 text-green-800 rounded'>
              Accepted
            </span>
            <span className='text-gray-600'>Suggestions that were applied</span>
          </div>
          <div className='flex items-center space-x-2'>
            <span className='px-2 py-1 bg-red-100 text-red-800 rounded'>
              Rejected
            </span>
            <span className='text-gray-600'>
              Suggestions that were declined
            </span>
          </div>
          <div className='flex items-center space-x-2'>
            <span className='px-2 py-1 bg-yellow-100 text-yellow-800 rounded'>
              Pending
            </span>
            <span className='text-gray-600'>
              Suggestions that were not reviewed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
