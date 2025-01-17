import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";


export const baseQuery = fetchBaseQuery({
  baseUrl: "/api", // Base URL for all API routes
  prepareHeaders: (headers) => {
    // Add custom headers if needed, like Authorization
    const token = localStorage?.getItem("jwt") || "";
    headers.set("Content-Type", "application/json");
    headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});
