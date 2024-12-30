import { configureStore} from '@reduxjs/toolkit';
import { UsersApi } from './services/user'; // Your API slice
import { UserAuthApi } from './services/user/auth'; // Your API slice
import { BusinessAuthApi } from './services/business/auth'; // Your API slice
import { UserProfileApi } from './services/user/profile'; // Your API slice
import { BusinessProfileApi } from './services/business/profile'; // Your API slice
import { JoinChallengeApi } from './services/user/challenge';
//import { ManageChallengeApi } from './services/business/challenge'; 
//import { BusinessDashboardApi } from './services/business/dashboard';



export const store = configureStore({
  reducer: {
    [UsersApi.reducerPath]: UsersApi.reducer, // Setting the reducer correctly
    [UserAuthApi.reducerPath]: UserAuthApi.reducer,
    [UserProfileApi.reducerPath]: UserProfileApi.reducer,
    [BusinessAuthApi.reducerPath]: BusinessAuthApi.reducer,
    [BusinessProfileApi.reducerPath]: BusinessProfileApi.reducer,
    [JoinChallengeApi.reducerPath]: JoinChallengeApi.reducer,
    //[ManageChallengeApi.reducerPath]: ManageChallengeApi.reducer,
    //[BusinessDashboardApi.reducerPath]: BusinessDashboardApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(UsersApi.middleware)
      .concat(UserAuthApi.middleware) 
      .concat(UserProfileApi.middleware)
      .concat(BusinessAuthApi.middleware)
      .concat(BusinessProfileApi.middleware)
      .concat(BusinessProfileApi.middleware)
      .concat(JoinChallengeApi.middleware)
      //.concat(ManageChallengeApi.middleware)
      //.concat(BusinessDashboardApi.middleware), // Adding middleware for the API slice
});

