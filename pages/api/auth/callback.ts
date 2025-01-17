import { supabase } from "@/libs/supabase/supabase_client";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Extract tokens and error from the query parameters
  const { access_token, refresh_token, error } = req.query;

  if (error) {
    console.error("OAuth error:", error);
    return res.status(400).json({ error: "OAuth authentication failed." });
  }

  if (!access_token) {
    return res
      .status(400)
      .json({ error: "Missing access token in OAuth response." });
  }

  try {
    // Set the access token for Supabase session
    const { data: session, error: sessionError } =
      await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

    if (sessionError) {
      console.error("Error setting Supabase session:", sessionError.message);
      return res.status(500).json({ error: "Failed to set session." });
    }

    // Fetch user details
    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error("Error fetching user data:", userError.message);
      return res
        .status(500)
        .json({ error: "Failed to fetch user information." });
    }

    // Extract user ID and additional info if needed
    const userId = user?.user?.id;

    if (!userId) {
      return res.status(500).json({ error: "User ID not found in response." });
    }

    // Return the access token and user ID
    return res.status(200).json({
      access_token,
      user_id: userId,
      user, // Include additional user info if needed
    });
  } catch (err) {
    console.error("Unexpected error during OAuth callback:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
