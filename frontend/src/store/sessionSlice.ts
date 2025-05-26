import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SessionState {
  sessionId: string | null;
}

const initialState: SessionState = {
  sessionId: null,
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setSessionId(state, action: PayloadAction<string | null>) {
      state.sessionId = action.payload;
    },
    clearSession(state) {
      state.sessionId = null;
    },
  },
});

export const { setSessionId, clearSession } = sessionSlice.actions;
export default sessionSlice.reducer;
