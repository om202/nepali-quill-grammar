import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, signup, login, logout, getProfile, updateProfile, SignupRequest, LoginRequest, UpdateProfileRequest, getAuthToken } from '@/lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const signupAsync = createAsyncThunk(
  'auth/signup',
  async (data: SignupRequest, { rejectWithValue }) => {
    try {
      const response = await signup(data);
      return response.user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Signup failed');
    }
  }
);

export const loginAsync = createAsyncThunk(
  'auth/login',
  async (data: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await login(data);
      return response.user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logout();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

export const getProfileAsync = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getProfile();
      return response.user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get profile');
    }
  }
);

export const updateProfileAsync = createAsyncThunk(
  'auth/updateProfile',
  async (data: UpdateProfileRequest, { rejectWithValue }) => {
    try {
      const response = await updateProfile(data);
      return response.user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No token found');
      }
      const response = await getProfile();
      return response.user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Authentication check failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Signup
      .addCase(signupAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupAsync.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signupAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Login
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logoutAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get Profile
      .addCase(getProfileAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProfileAsync.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getProfileAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
      })
      // Update Profile
      .addCase(updateProfileAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfileAsync.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfileAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Check Auth Status
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null; // Don't show error for auth check failures
      });
  },
});

export const { clearError, clearAuth } = authSlice.actions;
export default authSlice.reducer; 