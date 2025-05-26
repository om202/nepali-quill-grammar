import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Suggestion } from '@/lib/api';

interface SuggestionsState {
  items: Suggestion[];
  loading: boolean;
  error: string | null;
}

const initialState: SuggestionsState = {
  items: [],
  loading: false,
  error: null,
};

const suggestionsSlice = createSlice({
  name: 'suggestions',
  initialState,
  reducers: {
    setSuggestions(state, action: PayloadAction<Suggestion[]>) {
      state.items = action.payload;
      state.error = null;
    },
    clearSuggestions(state) {
      state.items = [];
      state.error = null;
    },
    setSuggestionsLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setSuggestionsError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    removeSuggestion(state, action: PayloadAction<string>) {
      state.items = state.items.filter(s => s.id !== action.payload);
    },
  },
});

export const {
  setSuggestions,
  clearSuggestions,
  setSuggestionsLoading,
  setSuggestionsError,
  removeSuggestion,
} = suggestionsSlice.actions;
export default suggestionsSlice.reducer;
