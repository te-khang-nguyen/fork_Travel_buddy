import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";

import { useGlobalContext } from "@/app/GlobalContextProvider";
import { useFetchUserAfterOAuthQuery } from "@/libs/services/user/auth";

export default function OAuthCallback() {
  const router = useRouter();
  const { setUserId, setRole } = useGlobalContext();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  // Extract access token on mount
  useEffect(() => {
    // if (typeof window !== "undefined" && window.location.hash) {
      const hash = router.asPath.split('#')[1] // window.location.hash.substring(1);
      const queryParams = new URLSearchParams(hash);
      const token = queryParams.get("access_token");
      const refresh = queryParams.get("refresh_token");

      console.log("Redirect URl embedded token:", token);

      if (token && token !== "") {
        localStorage.setItem("jwt", token); // Store access token
        localStorage.setItem("role", "user");
        setAccessToken(token);
      } else {
        console.error("Access token missing in OAuth response.");
        router.push("/?error=missing_token");
      }

      if (refresh) {
        localStorage.setItem("refresh_token", refresh); // Store refresh token (if needed)
        setRefreshToken(refresh);
      }
    // }
  }, [router.asPath]);


  // Use RTK Query to fetch user data after OAuth
  const { data, error, isLoading } = useFetchUserAfterOAuthQuery(
    { accessToken, refreshToken }, // Pass as an object for flexibility
    { skip: !accessToken } // Skip query if no access token is available
  );

  useEffect(() => {
    if (data) {
      // Set user data in the global context
      setUserId(data.user_id);
      setRole("user"); // Default role as "user"
      localStorage.setItem("role", "user");

      // Redirect to the dashboard
      router.push(`/dashboard/user`);
    }

    if (error) {
      console.error("Error fetching user data:", error);
      // router.push("/login?error=oauth_failed");
    }
  }, [data, error, router, setUserId, setRole]);

  return (
  <Box
    display='flex'
    alignItems="center"
    justifyContent="center"
    mt={20}
  >
    <Typography
      variant='h4'
    >
      {isLoading ? "Loading..." : "Redirecting..."}
    </Typography>
  </Box>);
}
