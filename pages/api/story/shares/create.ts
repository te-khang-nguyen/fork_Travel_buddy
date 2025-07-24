import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Validate request method
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed!" });
    }

    // Extract parameters
    const payload = req.body

    // Extract authorization token
    const token = req.headers.authorization?.split(' ')[1];

    // Create Supabase client
    const supabase = createApiClient(token!);
    // Get authenticated user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    try {
        const { data, error } = await supabase
            .from("shares")
            .insert({
                ...payload,
                user_id: user?.id,
            })
            .select("id")
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // Successful response
        return res.status(201).json({
            data: {
                message: `Post is shared to ${payload.platform}`,
                ...data
            }
        });

    } catch (catchError) {
        console.error("Unexpected error:", catchError);
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Workaround to enable Swagger on production 
export const swaggerStorySharesCreate = {
  index: 24,
  text:
`"/api/v1/story/shares": {
  "post": {
    "tags": ["story"],
    "summary": "Create a story share",
    "description": "Create a new share record for a story on a specific platform",
    "security": [
      {
        "bearerAuth": []
      }
    ],
    "requestBody": {
      "required": true,
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "required": ["story_id", "platform"],
            "properties": {
              "story_id": {
                "type": "string",
                "description": "ID of the story being shared"
              },
              "platform": {
                "type": "string",
                "description": "Social media platform where the story is shared",
                "enum": ["facebook", "twitter", "instagram"]
              }
            }
          }
        }
      }
    },
    "responses": {
      "201": {
        "description": "Share created successfully",
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "data": {
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string",
                      "example": "Post is shared to facebook"
                    },
                    "id": {
                      "type": "string",
                      "description": "ID of the created share record"
                    }
                  }
                }
              }
            }
          }
        }
      },
      "400": {
        "description": "Bad request - validation error",
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "error": {
                  "type": "string",
                  "example": "Invalid platform specified"
                }
              }
            }
          }
        }
      },
      "401": {
        "description": "Unauthorized - missing or invalid bearer token",
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "error": {
                  "type": "string",
                  "example": "Invalid token"
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
              "properties": {
                "error": {
                  "type": "string",
                  "example": "Method not allowed!"
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
              "properties": {
                "error": {
                  "type": "string",
                  "example": "Internal server error"
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