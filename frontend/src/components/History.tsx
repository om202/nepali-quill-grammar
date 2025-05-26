'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUserHistory, UserHistoryItem } from '@/lib/api';
import { RootState } from '@/store';
import { toast } from 'sonner';
import { Calendar, FileText, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';

export function History() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [history, setHistory] = useState<UserHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchHistory();
    }
  }, [isAuthenticated, user]);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getUserHistory();
      setHistory(response.history);
    } catch (error: any) {
      setError(error.message || 'Failed to load history');
      toast.error('Failed to load history');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="grammarly-card p-8 text-center fade-in">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4 transition-colors-smooth" />
        <h3 className="text-base font-medium text-gray-900 mb-2 transition-colors-smooth">Sign in to view history</h3>
        <p className="text-gray-600 transition-colors-smooth">Your text enhancement history will appear here once you're logged in.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grammarly-card p-8 text-center fade-in">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 transition-colors-smooth">Loading your history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grammarly-card p-8 text-center fade-in">
        <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4 transition-colors-smooth" />
        <h3 className="text-base font-medium text-gray-900 mb-2 transition-colors-smooth">Failed to load history</h3>
        <p className="text-gray-600 mb-4 transition-colors-smooth">{error}</p>
        <Button onClick={fetchHistory} className="grammarly-button-primary">
          Try again
        </Button>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="grammarly-card p-8 text-center fade-in">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4 transition-colors-smooth" />
        <h3 className="text-base font-medium text-gray-900 mb-2 transition-colors-smooth">No history yet</h3>
        <p className="text-gray-600 transition-colors-smooth">Start enhancing your Nepali text to see your history here.</p>
      </div>
    );
  }

  const totalSessions = history.length;
  const totalSuggestions = history.reduce((sum, item) => sum + item.suggestionsCount, 0);
  const totalAccepted = history.reduce((sum, item) => sum + item.acceptedCount, 0);
  const acceptanceRate = totalSuggestions > 0 ? Math.round((totalAccepted / totalSuggestions) * 100) : 0;

  return (
    <div className="space-y-6 fade-in">
      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="grammarly-card p-4 text-center transition-smooth hover:scale-[1.02] fade-in" style={{ animationDelay: '0.1s' }}>
          <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2 transition-colors-smooth" />
          <div className="text-xl font-semibold text-gray-900 transition-colors-smooth">{totalSessions}</div>
          <div className="text-sm text-gray-600 transition-colors-smooth">Sessions</div>
        </div>
        <div className="grammarly-card p-4 text-center transition-smooth hover:scale-[1.02] fade-in" style={{ animationDelay: '0.2s' }}>
          <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2 transition-colors-smooth" />
          <div className="text-xl font-semibold text-gray-900 transition-colors-smooth">{totalSuggestions}</div>
          <div className="text-sm text-gray-600 transition-colors-smooth">Suggestions</div>
        </div>
        <div className="grammarly-card p-4 text-center transition-smooth hover:scale-[1.02] fade-in" style={{ animationDelay: '0.3s' }}>
          <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2 transition-colors-smooth" />
          <div className="text-xl font-semibold text-gray-900 transition-colors-smooth">{totalAccepted}</div>
          <div className="text-sm text-gray-600 transition-colors-smooth">Accepted</div>
        </div>
        <div className="grammarly-card p-4 text-center transition-smooth hover:scale-[1.02] fade-in" style={{ animationDelay: '0.4s' }}>
          <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2 transition-colors-smooth" />
          <div className="text-xl font-semibold text-gray-900 transition-colors-smooth">{acceptanceRate}%</div>
          <div className="text-sm text-gray-600 transition-colors-smooth">Acceptance Rate</div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 transition-colors-smooth">Recent Sessions</h3>
        {history.map((item, index) => (
          <div key={item.id} className="grammarly-card p-6 transition-smooth hover:scale-[1.01] fade-in" style={{ animationDelay: `${0.5 + index * 0.1}s` }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4 transition-colors-smooth" />
                <span className="transition-colors-smooth">{formatDate(item.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4 text-purple-600 transition-colors-smooth" />
                  <span className="text-gray-600 transition-colors-smooth">{item.suggestionsCount} suggestions</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-600 transition-colors-smooth" />
                  <span className="text-gray-600 transition-colors-smooth">{item.acceptedCount} accepted</span>
                </div>
                <div className="flex items-center space-x-1">
                  <XCircle className="h-4 w-4 text-red-600 transition-colors-smooth" />
                  <span className="text-gray-600 transition-colors-smooth">{item.rejectedCount} rejected</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 transition-colors-smooth">
              <h4 className="text-sm font-medium text-gray-700 mb-2 transition-colors-smooth">Original Text:</h4>
              <p className="text-gray-900 leading-relaxed transition-colors-smooth">
                {truncateText(item.originalText)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 