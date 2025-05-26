import { configureStore } from '@reduxjs/toolkit';
import textReducer from './textSlice';
import suggestionsReducer from './suggestionsSlice';
import sessionReducer from './sessionSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    text: textReducer,
    suggestions: suggestionsReducer,
    session: sessionReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 