import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";
import { StoryProps } from "@/libs/services/user/story";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Validate request method
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed!" });
  }

  // Extract parameters
  const { media, ...rest } = req.body;

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
            .from("stories")
            .insert([{
                status: "DRAFT",
                user_id: user?.id,
                ...rest
            }])
            .select('id')
            .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const toMediaAssets = media.map((mediaItem) => ({
      user_id: user!.id,
      url: mediaItem,
      usage: "story",
      mime_type: "image/jpeg"
    }))

    const {
      data: mediaData,
      error: mediaErr
    } = await supabase.from("media_assets")
      .insert(toMediaAssets)
      .select();

    if (mediaErr) {
      return res.status(400).json({ error: mediaErr.message });
    }

    const {
      error: storyMediaErr
    } = await supabase.from("story_media")
      .insert(mediaData.map((item)=>({
        story_id: data?.id,
        media_id: item.id
      })))
      .select();

    if (storyMediaErr) {
      return res.status(400).json({ error: storyMediaErr.message });
    }

    // Successful response
    return res.status(201).json({
      data: {
        message: "Story created successfully",
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
export const swaggerStoryCreate = {
  index: 19,
  text:
`"/api/v1/story/ ": {
    "post": {
      "tags": ["story"],
      "summary": "Create a new story",
      "description": "Create a new story for a challenge.",
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
              "properties": {
                "destination_id": { "type": "string" },
                "channel_id": { "type": "string" },
                "notes": { "type": "string" },
                "story_content": { "type": "string" },
                "media": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                "seo_title_tag": { "type": "string" },
                "seo_meta_desc": { "type": "string" },
                "seo_excerpt": { "type": "string" },
                "seo_slug": { "type": "string" },
                "long_tail_keyword": { "type": "string" },
                "hashtags": {
                  "type": "array",
                  "items": { "type": "string" }
                }
              }
            }
          }
        }
      },
      "responses": {
        "201": {
          "description": "Story created successfully",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "message": {
                    "type": "string",
                    "example": "Story created successfully"
                  },
                  "id": {
                    "type": "string"
                  },
                  "media": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    },
                    "description": "list of IDs for uploaded media in the media_assets entity"
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
                "properties": {
                  "error": { "type": "string" }
                }
              }
            }
          }
        },
        "401": {
          "description": "Unauthorized - Authorization token is required",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "message": { "type": "string" }
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
                  "message": { "type": "string" }
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
                  "error": { "type": "string" }
                }
              }
            }
          }
        }
      }
    }
  }`
}