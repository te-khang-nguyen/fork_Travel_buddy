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
  const story_id = req.query['story-id'] as string;
  if (!story_id) {
    return res.status(400).json({ error: "Missing story ID" });
  }

  // Extract authorization token
  const token = req.headers.authorization?.split(' ')[1];

  // Create Supabase client
  const supabase = createApiClient(token);
  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    // Insert story into database
    const { data } = await supabase
            .from("likes")
            .select('*')
            .eq('story_id', story_id)
            .eq('user_id', user?.id)
            .single();

    // Successful response
    // If no data is found, return a response indicating no like exists
    if (!data) {
      return res.status(200).json({ 
        status: false ,
        like_id: null
      });
    }

    // If data is found, return the like ID
    // and a status indicating the like exists
    return res.status(200).json({
        status: true,
        like_id: data.id
    });

  } catch (catchError) {
    console.error("Unexpected error:", catchError);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Workaround to enable Swagger on production 
export const swaggerStoryLikesGet = {
  index: 24,
  text:
`"/api/v1/story/likes": {
  "post": {
    "tags": ["story"],
    "summary": "Check if the current user has liked a story",
    "description": "Returns the like status and like ID (if exists) for the authenticated user and a given story.",
    "security": [
      {
        "bearerAuth": []
      }
    ],
    "parameters": [
      {
        "in": "query",
        "name": "story-id",
        "schema": {
          "type": "string"
        },
        "required": true,
        "description": "ID of the story to check like status for"
      }
    ],
    "responses": {
      "200": {
        "description": "Like status retrieved successfully",
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "status": {
                  "type": "boolean",
                  "description": "True if the user has liked the story, false otherwise"
                },
                "like_id": {
                  "type": ["string", "null"],
                  "description": "ID of the like record if exists, otherwise null"
                }
              }
            },
            "examples": {
              "liked": {
                "value": {
                  "status": true,
                  "like_id": "123e4567-e89b-12d3-a456-426614174000"
                }
              },
              "not_liked": {
                "value": {
                  "status": false,
                  "like_id": null
                }
              }
            }
          }
        }
      },
      "400": {
        "description": "Bad request - missing or invalid story ID",
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "error": {
                  "type": "string",
                  "example": "Missing story ID"
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