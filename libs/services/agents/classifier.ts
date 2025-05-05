import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/libs/supabase/baseQuery";

// Define TypeScript interfaces for the request and response data
interface ClassifierAgentReq {
    query: string;
}

export interface intentPrediction {
    intent: 'find_location' | 'get_travel_info' | 'book_reserve' | 'general_query',
    confidence: number,
    needsImage: boolean
}

interface ClassifierAgentRes {
  intents?: intentPrediction[];
  primaryIntent?: intentPrediction;
}

const ClassifierAgentApi = createApi({
  reducerPath: "classifierAgent",
  baseQuery,
  tagTypes: ['Agents'],
  keepUnusedDataFor: 1,
  endpoints: (builder) => ({
    // ------------------QUERY ClassifierAgent BY ID--------------------------
    callClassifierAgent: builder.mutation<ClassifierAgentRes, ClassifierAgentReq>({
        query: (payload) => ({
        url: `/agents/intent-classifier`,
        method: "POST",
        body: payload
      })
    }),
  }),
});

export const {
  useCallClassifierAgentMutation,
} = ClassifierAgentApi;
export { ClassifierAgentApi };


