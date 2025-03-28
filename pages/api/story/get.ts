import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";
import { StorySingleRes } from "@/libs/services/user/story";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed!" });
    }

    const storyId = req.query?.["story-id"];

    // Extract authorization token
    const token = req.headers.authorization?.split(" ")[1];
    // Create Supabase client
    const supabase = createApiClient(token);
    
    try {
        const { 
            data: queryData, 
            error 
        } = await supabase
            .from("stories")
            .select(`*, 
              experiences(name), 
              destinations(name), 
              media_assets(url), 
              channels(channel_type, name),
              userprofiles(email, firstname, lastname, media_assets(url))`)
            .eq("id", storyId)
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ data: queryData });
    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while retrieving the challenge information."});
    }

};


// Workaround to enable Swagger on production 
export const swaggerStoryGet = {
    index:21, 
    text:
`"/api/v1/story": {
      "get": {
        "tags": ["story"],
        "summary": "Retrieve a story by ID",
        "description": "Retrieve a story by its ID.",
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
            "description": "The ID of the story to retrieve"
          }
        ],
        "responses": {
          "200": {
            "description": "Story retrieved successfully",
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
                        "title": { "type": "string" },
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
                        },
                        "userprofiles": {
                          "type": "object",
                          "properties": {
                            "email": { "type": "string" },
                            "firstname": { "type": "string" },
                            "lastname": { "type": "string" },
                            "media_assets": {
                              "type": "object",
                              "properties": {
                                "url":"string"
                              }
                            }
                          }
                        }
                      }
                    },
                    "error": {
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
                  "properties": {
                    "error": {
                      "type": "string"
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
                      "type": "string"
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
                      "type": "string"
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