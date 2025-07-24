import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '4.5mb', // Increase the body size limit (e.g., 5MB)
        },
    },
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "PUT") {
        return res.status(405).json({ error: "Method not allowed!" });
    }

    const storyId = req.query?.["story-id"];
    const updatedData = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    const supabase = createApiClient(token!);

    const {
        data: { user },
    } = await supabase.auth.getUser();

    try {
        const {
            data: storyData,
            error: storyErr
        } = await supabase
            .from('stories')
            .update(updatedData)
            .eq("id", storyId)
            .select();
            // .single();

        if (storyErr) {
            return res.status(400).json({ error: storyErr.message });
        }

        return res.status(200).json({ data: storyData });

    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while updating location." });
    }

};


// Workaround to enable Swagger on production 
export const swaggerStoryUpdate = {
  index:22, 
  text:
`"/api/v1/story/": {
      "put": {
        "tags": ["story"],
        "summary": "Update a story",
        "description": "Update the details of an existing story.",
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
            "description": "The ID of the story to update"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "seo_title_tag": { 
                    "type": "string",
                    "description": "SEO title of the story" 
                  },
                  "status": { 
                    "type": "string",
                    "description": "Publishing status: DRAFT/PUBLISHED/ARCHIVED"  
                  },
                  "story_content": {
                    "type": "string",
                    "description": "AI-generated travel story based on users notes"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Story updated successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "object",
                      "properties": {
                        "id": { "type": "string" },
                        "status": { "type": "string" },
                        "created_at": { "type": "string" },
                        "user_id": { "type": "string" },
                        "experience_id": { "type": "string" },
                        "channel_id": { "type": "string" },
                        "notes": { "type": "string" },
                        "story_content": { "type": "string" },
                        "media_assets": {
                          "type": "array",
                          "items": {
                            "type": "object",
                            "properties": {
                              "url": { "type": "string" }
                            }
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
                        },
                        "experiences": {
                          "type": "object",
                          "properties": {
                            "name": { "type": "string" }
                          }
                        },
                        "channels": {
                          "type": "object",
                          "properties": {
                            "channel_type": { "type": "string" },
                            "name": { "type": "string" }
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
          "405": {
            "description": "Method not allowed",
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