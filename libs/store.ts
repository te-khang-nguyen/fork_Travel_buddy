 // Your API slices
import { configureStore} from '@reduxjs/toolkit';
import { UsersApi } from './services/user';
import { UserAuthApi } from './services/user/auth';
import { BusinessAuthApi } from './services/business/auth';
import { UserProfileApi } from './services/user/profile';
import { StoryApi } from './services/user/story';
import { BusinessProfileApi } from './services/business/profile';
import { JoinChallengeApi } from './services/user/challenge';
import { ChallengeApi } from './services/business/challenge';
import { StorageApi } from './services/storage/upload';
import { LocationApi } from './services/business/location';




export const store = configureStore({
  reducer: {
    [UsersApi.reducerPath]: UsersApi.reducer, // Setting the reducer correctly
    [UserAuthApi.reducerPath]: UserAuthApi.reducer,
    [UserProfileApi.reducerPath]: UserProfileApi.reducer,
    [BusinessAuthApi.reducerPath]: BusinessAuthApi.reducer,
    [BusinessProfileApi.reducerPath]: BusinessProfileApi.reducer,
    [JoinChallengeApi.reducerPath]: JoinChallengeApi.reducer,
    [ChallengeApi.reducerPath]: ChallengeApi.reducer,
    [StorageApi.reducerPath]: StorageApi.reducer,
    [LocationApi.reducerPath]: LocationApi.reducer,
    [StoryApi.reducerPath]: StoryApi.reducer,
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
      .concat(ChallengeApi.middleware)
      .concat(StorageApi.middleware)
      .concat(LocationApi.middleware)
      .concat(StoryApi.middleware)
});

