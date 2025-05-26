import axios, { AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export interface Suggestion {
  id: string;
  tokenId: string;
  suggestedText: string;
  createdAt: string;
  action?: 'accept' | 'reject';
}

export interface AnalysisResponse {
  sessionId: string;
  suggestions: Suggestion[];
}

export interface DiffModel {
  originalText: string;
  enhancedText: string;
  appliedSuggestions: Suggestion[];
  pendingSuggestions: Suggestion[];
}

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error interceptor to format error responses
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const message = error.response.data?.message || error.message;
      throw new APIError(
        message,
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      // The request was made but no response was received
      throw new APIError(
        'No response received from server. Please check your connection.',
        0
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new APIError(
        'Failed to make request: ' + error.message,
        0
      );
    }
  }
);

export const analyzeText = async (text: string): Promise<AnalysisResponse> => {
  try {
    const response = await api.post<AnalysisResponse>('/analyze', { text });
    return response.data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      'Failed to analyze text',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

export const updateSuggestion = async (
  sessionId: string,
  suggestionId: string,
  action: 'accept' | 'reject'
): Promise<DiffModel> => {
  try {
    const response = await api.patch<DiffModel>(`/suggestions/${sessionId}`, {
      suggestionId,
      action,
    });
    return response.data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      'Failed to update suggestion',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

export const getSession = async (sessionId: string): Promise<DiffModel> => {
  try {
    const response = await api.get<DiffModel>(`/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      'Failed to get session',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}; 