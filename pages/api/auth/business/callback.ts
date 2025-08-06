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
    const { data: { user, session }, error: sessionError } =
      await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

    if (sessionError) {
      console.error("Error setting Supabase session:", sessionError.message);
      return res.status(500).json({ error: "Failed to set session." });
    }

    // Fetch user details
    // const {
    //   data: { user },
    //   error: userError
    // } = await supabase.auth.getUser(access_token);

    // if (userError) {
    //   console.error("Error fetching user data:", userError.message);
    //   return res
    //     .status(500)
    //     .json({ error: "Failed to fetch user information." });
    // }

    // Extract user ID and additional info if needed
    const userId = user?.id;
    const expires_at = session?.expires_at;

    const { data: profileData } = await supabase
      .from("businessprofiles")
      .select("*")
      .single();

    if (profileData && profileData !== null) {
      console.log("Existing profile:", profileData);
      // Return the access token and user ID
      return res.status(200).json({
        access_token,
        refresh_token,
        expires_at,
        user_id: userId,
        user: profileData, // Include additional user info if needed
      });
    } else {
      const avatar = user?.user_metadata?.avatar_url;
      const email = user?.email;
      const userName = user?.user_metadata?.name;
      const businessName = "Travel Buddy B2B";

      const toMediaAssets = {
        user_id: userId,
        url: avatar,
        usage: "avatar",
        mime_type: "image/jpeg",
      };

      const { data: mediaData, error: mediaErr } = await supabase
        .from("media_assets")
        .insert(toMediaAssets)
        .select("*")
        .single();

      if (mediaErr) {
        res.status(500).json({ error: mediaErr.message });
      }

      const { data: newProfileData } = await supabase
        .from("businessprofiles")
        .insert({
          businessid: userId,
          email: email,
          username: userName,
          businessname: businessName,
          avatar_id: mediaData!.id,
        })
        .select("*, media_assets(url)")
        .single();
      console.log("New profile:", newProfileData);
      // Return the access token and user ID
      return res.status(200).json({
        access_token,
        refresh_token,
        expires_at,
        user_id: userId,
        user: newProfileData, // Include additional user info if needed
      });
    }
  } catch (err) {
    console.error("Unexpected error during OAuth callback:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}


// Workaround to enable Swagger on production 
export const swaggerCallback = {
  index: 5,
  text:
    `"/api/v1/auth/business/callback": {
    "get": {
      "tags": ["B2B-auth"],
      "summary": "OAuth callback",
      "description": "Handle the OAuth callback and set the Supabase session.",
      "parameters": [
        {
          "in": "query",
          "name": "access_token",
          "schema": {
            "type": "string"
          },
          "required": true,
          "description": "The access token from the OAuth provider"
        },
        {
          "in": "query",
          "name": "refresh_token",
          "schema": {
            "type": "string"
          },
          "required": true,
          "description": "The refresh token from the OAuth provider"
        },
        {
          "in": "query",
          "name": "error",
          "schema": {
            "type": "string"
          },
          "required": false,
          "description": "Error message from the OAuth provider"
        }
      ],
      "responses": {
        "200": {
          "description": "Successfully authenticated",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "access_token": {
                    "type": "string"
                  },
                  "user_id": {
                    "type": "string"
                  },
                  "user": {
                    "type": "object",
                    "properties": {
                      "userid": { "type": "string" },
                      "username": { "type": "string" },
                      "email": { "type": "string" },
                      "businessname": { "type": "string" },
                      "facebook": { "type": "string" },
                      "instagram": { "type": "string" },
                      "x": { "type": "string" },
                      "phone": { "type": "string" },
                      "created": { "type": "string" },
                      "logo_id": { "type": "string" },
                      "media_assets": {
                        "type": "object",
                        "properties": {
                          "url" : {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "400": {
          "description": "Bad request"
        },
        "405": {
          "description": "Method not allowed"
        },
        "500": {
          "description": "Internal server error"
        }
      }
    }
  }`
}