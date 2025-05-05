import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";

interface CommentsRequestBody {
    media?: Array<{
        url: string;
        path?: string;
    }>;
    [key: string]: any;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Validate request method
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed!" });
  }

  const comment_id = req.query['comment-id'] as string;

  // Extract parameters
  const {media, ...rest} = req.body as CommentsRequestBody;

  // Extract authorization token
  const token = req.headers.authorization?.split(' ')[1];

  // Create Supabase client
  const supabase = createApiClient(token);

  try {
    // Insert story into database
    const { data, error } = await supabase
            .from("comments")
            .update([{
                ...rest
            }])
            .eq('id', comment_id)
            .select('id')
            .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Successful response
    return res.status(200).json({
      data: {
        message: "Comment updated successfully",
        id: data?.id,
      }
    });

  } catch (catchError) {
    console.error("Unexpected error:", catchError);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Workaround to enable Swagger on production 
export const swaggerStoryCommentsUpdate = {
  index: 24,
  text:
`"/api/v1/story/comments/": {
  "put": {
    "tags": ["story"],
    "summary": "Update a comment",
    "description": "Update an existing comment on a story",
    "security": [
      {
        "bearerAuth": []
      }
    ],
    "parameters": [
      {
        "in": "query",
        "name": "comment-id",
        "schema": {
          "type": "string"
        },
        "required": true,
        "description": "ID of the comment to update"
      }
    ],
    "requestBody": {
      "required": true,
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "properties": {
              "content": {
                "type": "string",
                "description": "Updated comment text"
              },
              "media": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "url": {
                      "type": "string",
                      "format": "uri",
                      "description": "URL of the media asset"
                    },
                    "path": {
                      "type": "string",
                      "description": "Storage path of the media asset"
                    }
                  },
                  "required": ["url"]
                },
                "description": "Array of media items attached to the comment"
              }
            }
          },
          "example": {
            "content": "Updated comment text",
            "media": [
              {
                "url": "https://example.com/media/123.jpg",
                "path": "comments/123.jpg"
              }
            ]
          }
        }
      }
    },
    "responses": {
      "200": {
        "description": "Comment updated successfully",
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
                      "example": "Comment updated successfully"
                    },
                    "id": {
                      "type": "string",
                      "description": "ID of the updated comment"
                    }
                  }
                }
              }
            }
          }
        }
      },
      "400": {
        "description": "Bad request - invalid input",
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "error": {
                  "type": "string",
                  "example": "Invalid comment data"
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