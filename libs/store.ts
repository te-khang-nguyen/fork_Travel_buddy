import { configureStore} from '@reduxjs/toolkit';
import { UsersApi } from './services/user'; // Your API slice
import { UserAuthApi } from './services/user/auth'; // Your API slice
import { BusinessAuthApi } from './services/business/auth'; // Your API slice
import { UserProfileApi } from './services/user/profile'; // Your API slice
import { BusinessProfileApi } from './services/business/profile'; // Your API slice


export const store = configureStore({
  reducer: {
    [UsersApi.reducerPath]: UsersApi.reducer, // Setting the reducer correctly
    [UserAuthApi.reducerPath]: UserAuthApi.reducer,
    [UserProfileApi.reducerPath]: UserProfileApi.reducer,
    [BusinessAuthApi.reducerPath]: BusinessAuthApi.reducer,
    [BusinessProfileApi.reducerPath]: BusinessProfileApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(UsersApi.middleware)
      .concat(UserAuthApi.middleware) 
      .concat(UserProfileApi.middleware)
      .concat(BusinessAuthApi.middleware)
      .concat(BusinessProfileApi.middleware), // Adding middleware for the API slice
});

