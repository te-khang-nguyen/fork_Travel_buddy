import { configureStore } from '@reduxjs/toolkit';
import { UsersApi } from './services/user'; // Your API slice
import { AuthApi } from './services/auth'; // Your API slice
import { UserProfileApi } from './services/user/profile'; // Your API slice
import { BusinessProfileApi } from './services/business/profile'; // Your API slice

export const store = configureStore({
  reducer: {
    [UsersApi.reducerPath]: UsersApi.reducer, // Setting the reducer correctly
    [AuthApi.reducerPath]: AuthApi.reducer,
    [UserProfileApi.reducerPath]: UserProfileApi.reducer,
    [BusinessProfileApi.reducerPath]: BusinessProfileApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(UsersApi.middleware)
      .concat(AuthApi.middleware) 
      .concat(UserProfileApi.middleware)
      .concat(BusinessProfileApi.middleware), // Adding middleware for the API slice
});

