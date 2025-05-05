import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";

interface CommentsRequestBody {
    story_id: string;
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
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed!" });
  }
  let mediaData;

  // Extract parameters
  const { media, ...rest } = req.body as CommentsRequestBody;

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
    const { data, error } = await supabase
            .from("comments")
            .insert([{
                user_id: user?.id,
                ...rest
            }])
            .select('id')
            .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (media && media.length > 0) {
      const toMediaAssets = media.map((mediaItem) => ({
        user_id: user!.id,
        url: mediaItem.url ?? mediaItem,
        usage: "comment",
        mime_type: "image/jpeg",
        storage_path: mediaItem.path ?? null,
      }))
  
      const {
        data: mediaResp,
        error: mediaErr
      } = await supabase.from("media_assets")
        .insert(toMediaAssets)
        .select();
  
      if (mediaErr) {
        return res.status(400).json({ error: mediaErr.message });
      }

      mediaData = mediaResp;
  
      const {
        error: storyMediaErr
      } = await supabase.from("comment_media")
        .insert(mediaData.map((item)=>({
          comment_id: data?.id,
          media_id: item.id
        })))
        .select();
  
      if (storyMediaErr) {
        return res.status(400).json({ error: storyMediaErr.message });
      }
    }

    // Successful response
    return res.status(200).json({
      data: {
        message: "Comment created successfully",
        id: data?.id,
        media: mediaData?.map((item) => item.id)
      }
    });

  } catch (catchError) {
    console.error("Unexpected error:", catchError);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Workaround to enable Swagger on production 
export const swaggerStoryCommentsCreate = {
  index: 24,
  text:
`"/api/v1/story/comments/ ": {
  "post": {
    "tags": ["story"],
    "summary": "Create a new comment",
    "description": "Create a new comment on a story with optional media attachments",
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
            "required": ["story_id", "content"],
            "properties": {
              "story_id": {
                "type": "string",
                "description": "ID of the story to comment on"
              },
              "content": {
                "type": "string",
                "description": "Comment text content"
              },
              "media": {
                "type": "array",
                "items": {
                  "oneOf": [
                    {
                      "type": "string",
                      "description": "Direct URL of the media item"
                    },
                    {
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
                    }
                  ]
                },
                "description": "Array of media items that can be either URLs or objects with url and path"
              }
            }
          },
          "example": {
            "story_id": "123e4567-e89b-12d3-a456-426614174000",
            "content": "Great photo!",
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
        "description": "Comment created successfully",
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
                      "example": "Comment created successfully"
                    },
                    "id": {
                      "type": "string",
                      "description": "ID of the created comment"
                    },
                    "media": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "description": "Array of created media asset IDs"
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