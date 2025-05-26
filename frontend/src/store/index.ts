import { configureStore } from '@reduxjs/toolkit';
import textReducer from './textSlice';
import suggestionsReducer from './suggestionsSlice';
import sessionReducer from './sessionSlice';

export const store = configureStore({
  reducer: {
    text: textReducer,
    suggestions: suggestionsReducer,
    session: sessionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 