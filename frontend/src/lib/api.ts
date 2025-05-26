import axios, { AxiosError } from 'axios';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export interface Suggestion {
  id: string;
  tokenId: string;
  suggestedText: string;
  originalText: string;
  startIndex: number;
  endIndex: number;
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

// Authentication interfaces
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: User;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  session: AuthSession;
}

export interface ProfileResponse {
  user: User;
}

export interface UpdateProfileRequest {
  name: string;
}

export interface UserHistoryItem {
  id: string;
  originalText: string;
  createdAt: string;
  suggestionsCount: number;
  acceptedCount: number;
  rejectedCount: number;
}

export interface UserHistoryResponse {
  history: UserHistoryItem[];
}

// Password reset interfaces
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface VerifyResetTokenResponse {
  message: string;
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

interface ErrorResponse {
  message?: string;
  error?: string;
  [key: string]: unknown;
}

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Token management
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

export const getAuthToken = (): string | null => {
  if (authToken) {
return authToken;
}
  if (typeof window !== 'undefined') {
    authToken = localStorage.getItem('auth_token');
  }
  return authToken;
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  config => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Error interceptor to format error responses
api.interceptors.response.use(
  response => response,
  (error: AxiosError<ErrorResponse>) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const message =
        error.response.data?.message ||
        error.response.data?.error ||
        error.message;

      // Handle 401 errors by clearing auth token
      if (error.response.status === 401) {
        setAuthToken(null);
      }

      throw new APIError(message, error.response.status, error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      throw new APIError(
        'No response received from server. Please check your connection.',
        0
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new APIError('Failed to make request: ' + error.message, 0);
    }
  }
);

// Authentication API functions
export const signup = async (data: SignupRequest): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/signup', data);
    // Store the token
    setAuthToken(response.data.session.access_token);
    return response.data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      'Failed to sign up',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/login', data);
    // Store the token
    setAuthToken(response.data.session.access_token);
    return response.data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      'Failed to log in',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    // Even if logout fails on server, clear local token
    console.warn('Logout request failed:', error);
  } finally {
    setAuthToken(null);
  }
};

export const getProfile = async (): Promise<ProfileResponse> => {
  try {
    const response = await api.get<ProfileResponse>('/auth/profile');
    return response.data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      'Failed to get profile',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

export const updateProfile = async (
  data: UpdateProfileRequest
): Promise<ProfileResponse> => {
  try {
    const response = await api.put<ProfileResponse>('/auth/profile', data);
    return response.data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      'Failed to update profile',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

// Existing text analysis functions
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

export const getUserHistory = async (): Promise<UserHistoryResponse> => {
  try {
    const response = await api.get<UserHistoryResponse>('/auth/history');
    return response.data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      'Failed to get user history',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

// Password reset API functions
export const forgotPassword = async (
  data: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> => {
  try {
    const response = await api.post<ForgotPasswordResponse>('/auth/forgot-password', data);
    return response.data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      'Failed to send password reset email',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

export const verifyResetToken = async (
  token: string
): Promise<VerifyResetTokenResponse> => {
  try {
    const response = await api.get<VerifyResetTokenResponse>(
      `/auth/verify-reset-token?token=${encodeURIComponent(token)}`
    );
    return response.data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      'Failed to verify reset token',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

export const resetPassword = async (
  data: ResetPasswordRequest
): Promise<ResetPasswordResponse> => {
  try {
    const response = await api.post<ResetPasswordResponse>('/auth/reset-password', data);
    return response.data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      'Failed to reset password',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

export const changePassword = async (
  data: ChangePasswordRequest
): Promise<ChangePasswordResponse> => {
  try {
    const response = await api.post<ChangePasswordResponse>('/auth/change-password', data);
    return response.data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      'Failed to change password',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};
