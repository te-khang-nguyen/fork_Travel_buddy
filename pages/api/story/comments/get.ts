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
  const { story_id } = req.body;

  // Extract authorization token
  const token = req.headers.authorization?.split(' ')[1];

  // Create Supabase client
  const supabase = createApiClient(token);
  // Get authenticated user

  try {
    // Insert story into database
    const { data, error } = await supabase
            .from("comments")
            .select('*,media_assets(url)')
            .eq('story_id', story_id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Successful response
    return res.status(201).json({
      data: {
        message: "Story created successfully",
        ...data
      }
    });

  } catch (catchError) {
    console.error("Unexpected error:", catchError);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Workaround to enable Swagger on production 
export const swaggerStoryCommentsGet = {
  index: 24,
  text:
`"/api/v1/story/comments": {
  "get": {
    "tags": ["story"],
    "summary": "Get comments for a story",
    "description": "Retrieves all comments associated with a specific story",
    "security": [
      {
        "bearerAuth": []
      }
    ],
    "parameters": [
      {
        "in": "query",
        "name": "story_id",
        "schema": {
          "type": "string"
        },
        "required": true,
        "description": "ID of the story to fetch comments for"
      }
    ],
    "responses": {
      "200": {
        "description": "Comments retrieved successfully",
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "data": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "string",
                        "description": "Comment ID"
                      },
                      "story_id": {
                        "type": "string",
                        "description": "ID of the story the comment belongs to"
                      },
                      "user_id": {
                        "type": "string",
                        "description": "ID of the user who made the comment"
                      },
                      "content": {
                        "type": "string",
                        "description": "Comment text content"
                      },
                      "created_at": {
                        "type": "string",
                        "format": "date-time",
                        "description": "Timestamp when the comment was created"
                      },
                      "media_assets": {
                        "type": "object",
                        "properties": {
                          "url": {
                            "type": "string",
                            "format": "uri",
                            "description": "URL of any media attached to the comment"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "example": {
              "data": [
                {
                  "id": "123e4567-e89b-12d3-a456-426614174000",
                  "story_id": "123e4567-e89b-12d3-a456-426614174001",
                  "user_id": "123e4567-e89b-12d3-a456-426614174002",
                  "content": "Great story!",
                  "created_at": "2024-05-05T10:30:00Z",
                  "media_assets": {
                    "url": "https://example.com/media/123.jpg"
                  }
                }
              ]
            }
          }
        }
      },
      "400": {
        "description": "Bad request - invalid story_id",
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "error": {
                  "type": "string",
                  "example": "Invalid story_id"
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