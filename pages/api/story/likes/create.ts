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
    const { story_id } = req.body

    // Extract authorization token
    const token = req.headers.authorization?.split(' ')[1];

    // Create Supabase client
    const supabase = createApiClient(token!);
    // Get authenticated user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    try {
        const { data: existingLike } = await supabase
            .from("likes")
            .select("id")
            .eq("story_id", story_id)
            .eq("user_id", user?.id)
            .single();

        if (existingLike) {
            const { data, error } = await supabase
                .from("likes")
                .delete()
                .eq("id", existingLike.id);

            if (error) {
                return res.status(400).json({ error: error.message });
            }

            // Successful response
            return res.status(200).json({
                data: {
                    message: "Unliked",
                    status: false,
                    like_id: existingLike.id
                }
            });
        } else {
            const { data: newLike, error } = await supabase
                .from("likes")
                .insert({
                    story_id: story_id,
                    user_id: user?.id,
                })
                .select("id")
                .single();

            if (error) {
                return res.status(400).json({ error: error.message });
            }

            // Successful response
            return res.status(200).json({
                data: {
                    message: "Liked",
                    status: true,
                    like_id: newLike.id
                }
            });
        }

    } catch (catchError) {
        console.error("Unexpected error:", catchError);
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Workaround to enable Swagger on production 
export const swaggerStoryLikesCreate = {
  index: 24,
  text:
`"/api/v1/story/likes/": {
  "post": {
    "tags": ["story"],
    "summary": "Toggle like status for a story",
    "description": "Creates or removes a like for a story based on current state",
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
            "required": ["story_id"],
            "properties": {
              "story_id": {
                "type": "string",
                "description": "ID of the story to like/unlike"
              }
            }
          }
        }
      }
    },
    "responses": {
      "201": {
        "description": "Like status toggled successfully",
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "data": {
                  "type": "object",
                  "required": ["message", "status", "like_id"],
                  "properties": {
                    "message": {
                      "type": "string",
                      "enum": ["Liked", "Unliked"],
                      "description": "Action performed"
                    },
                    "status": {
                      "type": "boolean",
                      "description": "Current like status (true if liked, false if unliked)"
                    },
                    "like_id": {
                      "type": "string",
                      "description": "ID of the like record"
                    }
                  }
                }
              }
            },
            "examples": {
              "like": {
                "value": {
                  "data": {
                    "message": "Liked",
                    "status": true,
                    "like_id": "123e4567-e89b-12d3-a456-426614174000"
                  }
                }
              },
              "unlike": {
                "value": {
                  "data": {
                    "message": "Unliked",
                    "status": false,
                    "like_id": "123e4567-e89b-12d3-a456-426614174000"
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