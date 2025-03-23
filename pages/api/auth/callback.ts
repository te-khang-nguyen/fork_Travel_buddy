import { supabase } from "@/libs/supabase/supabase_client";

/**
 * @swagger
 * /api/auth/callback:
 *   get:
 *     tags:
 *       - auth
 *     summary: OAuth callback
 *     description: Handle the OAuth callback and set the Supabase session.
 *     parameters:
 *       - in: query
 *         name: access_token
 *         schema:
 *           type: string
 *         required: true
 *         description: The access token from the OAuth provider
 *       - in: query
 *         name: refresh_token
 *         schema:
 *           type: string
 *         required: true
 *         description: The refresh token from the OAuth provider
 *       - in: query
 *         name: error
 *         schema:
 *           type: string
 *         required: false
 *         description: Error message from the OAuth provider
 *     responses:
 *       200:
 *         description: Successfully authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                 user_id:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: Bad request
 *       405:
 *         description: Method not allowed
 *       500:
 *         description: Internal server error
 */

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Extract tokens and error from the query parameters
  const{ access_token, refresh_token, error } = req.query;
  
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

    // // Fetch user details
    const { 
      data: user, 
      error: userError 
    } = await supabase.auth.getUser(access_token);

    if (userError) {
      console.error("Error fetching user data:", userError.message);
      return res
        .status(500)
        .json({ error: "Failed to fetch user information." });
    }

    // Extract user ID and additional info if needed
    const userId = user?.user?.id;

    const { 
      data: profileData 
    } = await supabase.from("userprofiles")
                .select("*")
                .eq("userid", userId);

    if (!userId) {
      return res.status(500).json({ error: "User ID not found in response." });
    }

    // Return the access token and user ID
    return res.status(200).json({
      access_token,
      user_id: userId,
      profileData, // Include additional user info if needed
    });
  } catch (err) {
    console.error("Unexpected error during OAuth callback:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}


// Workaround to enable Swagger on production 
export const swaggerCallback = {
  index:5, 
  text:
  `"/api/v1/auth/callback": {
    "get": {
      "tags": ["auth"],
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
                      "firstname": { "type": "string" },
                      "lastname": { "type": "string" },
                      "preferences": { "type": "string" },
                      "facebook": { "type": "string" },
                      "instagram": { "type": "string" },
                      "x": { "type": "string" },
                      "phone": { "type": "string" },
                      "createdAt": { "type": "string" },
                      "avatar_id": { "type": "string" },
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