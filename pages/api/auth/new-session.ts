import { supabase } from "@/libs/supabase/supabase_client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const [refresh_token] = Object.values(req.query);

  if (!refresh_token) {
    return res.status(400).json({ error: "Refresh token is required!" });
  }

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.refreshSession({ refresh_token: refresh_token as string });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!session) {
      return res.status(400).json({ error: "Failed to authenticate user." });
    }

    return res
      .status(200)
      .json({ 
        access_token: session.access_token, 
        expires_in: session.expires_in,
        refresh_token: session.refresh_token,
        userId: session.user.id,
       });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Login failed due to an unknown error." });
  }
}


// Workaround to enable Swagger on production 

export const swaggerUserAuthNewSession = {
  index: 2,
  text:
  `"/api/v1/auth/new-session": {
    "get": {
      "tags": ["auth"],
      "summary": "Refresh user session",
      "description": "Create a new session using a refresh token",
      "parameters": [
        {
          "in": "query",
          "name": "refresh_token",
          "schema": {
            "type": "string"
          },
          "required": true,
          "description": "The refresh token to create a new session"
        }
      ],
      "responses": {
        "200": {
          "description": "Session refreshed successfully",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["access_token", "expires_in", "refresh_token", "userId"],
                "properties": {
                  "access_token": {
                    "type": "string"
                  },
                  "expires_in": {
                    "type": "integer"
                  },
                  "refresh_token": {
                    "type": "string"
                  },
                  "userId": {
                    "type": "string"
                  }
                }
              }
            }
          }
        },
        "400": {
          "description": "Bad request",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["error"],
                "properties": {
                  "error": {
                    "type": "string",
                    "example": "Refresh token is required!"
                  }
                }
              }
            }
          }
        },
        "405": {
          "description": "Method not allowed",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["error"],
                "properties": {
                  "error": {
                    "type": "string",
                    "example": "Method not allowed"
                  }
                }
              }
            }
          }
        },
        "500": {
          "description": "Internal server error",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["error"],
                "properties": {
                  "error": {
                    "type": "string",
                    "example": "Login failed due to an unknown error."
                  }
                }
              }
            }
          }
        }
      }
    }
  }`
}
