import { configureStore } from '@reduxjs/toolkit';
import { UsersApi } from './services/user'; // Your API slice

export const store = configureStore({
  reducer: {
    [UsersApi.reducerPath]: UsersApi.reducer, // Setting the reducer correctly
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(UsersApi.middleware), // Adding middleware for the API slice
});
