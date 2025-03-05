 // Your API slices
import { configureStore} from '@reduxjs/toolkit';
import { UserAuthApi } from './services/user/auth';
import { BusinessAuthApi } from './services/business/auth';
import { UserProfileApi } from './services/user/profile';
import { StoryApi } from './services/user/story';
import { BusinessProfileApi } from './services/business/profile';
import { JoinChallengeApi } from './services/user/challenge';
import { ChallengeApi } from './services/business/challenge';
import { StorageApi } from './services/storage/upload';
import { LocationApi } from './services/business/location';
import { DestinationApi } from './services/user/destination';
import { ChannelApi } from './services/user/channel';
import { DestinationBusinessApi } from './services/business/destination';




export const store = configureStore({
  reducer: {
    [UserAuthApi.reducerPath]: UserAuthApi.reducer,
    [UserProfileApi.reducerPath]: UserProfileApi.reducer,
    [BusinessAuthApi.reducerPath]: BusinessAuthApi.reducer,
    [BusinessProfileApi.reducerPath]: BusinessProfileApi.reducer,
    [JoinChallengeApi.reducerPath]: JoinChallengeApi.reducer,
    [ChallengeApi.reducerPath]: ChallengeApi.reducer,
    [StorageApi.reducerPath]: StorageApi.reducer,
    [LocationApi.reducerPath]: LocationApi.reducer,
    [StoryApi.reducerPath]: StoryApi.reducer,
    [DestinationApi.reducerPath]: DestinationApi.reducer,
    [ChannelApi.reducerPath]: ChannelApi.reducer,
    [DestinationBusinessApi.reducerPath]: DestinationBusinessApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
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
      .concat(DestinationApi.middleware)
      .concat(ChannelApi.middleware)
      .concat(DestinationBusinessApi.middleware)
});

