'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { getUserHistory, UserHistoryItem } from '@/lib/api';
import { SessionDetail } from '@/components/SessionDetail';
import { RootState } from '@/store';
import { toast } from 'sonner';
import { Calendar, FileText, CheckCircle, XCircle, Clock, TrendingUp, ChevronRight, Eye } from 'lucide-react';

export function History() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [history, setHistory] = useState<UserHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load history';
      setError(errorMessage);
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

  const handleSessionClick = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  };

  const handleBackToHistory = () => {
    setSelectedSessionId(null);
  };

  // If a session is selected, show the session detail view
  if (selectedSessionId) {
    return (
      <SessionDetail 
        sessionId={selectedSessionId} 
        onBack={handleBackToHistory} 
      />
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="grammarly-card p-8 text-center">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-base font-medium text-gray-900 mb-2">Sign in to view history</h3>
          <p className="text-gray-600">Your text enhancement history will appear here once you&apos;re logged in.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grammarly-card p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grammarly-card p-8 text-center">
        <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-base font-medium text-gray-900 mb-2">Failed to load history</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchHistory} className="grammarly-button-primary">
          Try again
        </Button>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="grammarly-card p-8 text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-base font-medium text-gray-900 mb-2">No history yet</h3>
        <p className="text-gray-600">Start enhancing your Nepali text to see your history here.</p>
      </div>
    );
  }

  const totalSessions = history.length;
  const totalSuggestions = history.reduce((sum, item) => sum + item.suggestionsCount, 0);
  const totalAccepted = history.reduce((sum, item) => sum + item.acceptedCount, 0);
  const acceptanceRate = totalSuggestions > 0 ? Math.round((totalAccepted / totalSuggestions) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="grammarly-card p-4 text-center" style={{ animationDelay: '0.1s' }}>
          <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <div className="text-xl font-semibold text-gray-900">{totalSessions}</div>
          <div className="text-sm text-gray-600">Sessions</div>
        </div>
        <div className="grammarly-card p-4 text-center" style={{ animationDelay: '0.2s' }}>
          <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <div className="text-xl font-semibold text-gray-900">{totalSuggestions}</div>
          <div className="text-sm text-gray-600">Suggestions</div>
        </div>
        <div className="grammarly-card p-4 text-center" style={{ animationDelay: '0.3s' }}>
          <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <div className="text-xl font-semibold text-gray-900">{totalAccepted}</div>
          <div className="text-sm text-gray-600">Accepted</div>
        </div>
        <div className="grammarly-card p-4 text-center" style={{ animationDelay: '0.4s' }}>
          <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
          <div className="text-xl font-semibold text-gray-900">{acceptanceRate}%</div>
          <div className="text-sm text-gray-600">Acceptance Rate</div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Recent Sessions</h3>
        {history.map((item, index) => (
          <div 
            key={item.id} 
            className="grammarly-card p-6 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all duration-200 group" 
            style={{ animationDelay: `${0.5 + index * 0.1}s` }}
            onClick={() => handleSessionClick(item.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(item.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <span className="text-gray-600">{item.suggestionsCount} suggestions</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-600">{item.acceptedCount} accepted</span>
                </div>
                <div className="flex items-center space-x-1">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-gray-600">{item.rejectedCount} rejected</span>
                </div>
                <div className="flex items-center space-x-1 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm font-medium">View Details</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Original Text:</h4>
              <p className="text-gray-900 leading-relaxed">
                {truncateText(item.originalText)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 