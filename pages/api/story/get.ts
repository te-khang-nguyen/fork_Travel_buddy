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
    const supabase = createApiClient(token!);
    
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
              userprofiles(email, firstname, lastname, media_assets(url)),
              likes(count),
              shares(count),
              comments(count)`)
            .eq("id", storyId)
            .order("created_at", { ascending: false, referencedTable: "media_assets" })
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
                    "id": { "type": "string", "description": "Story ID" },
                    "status": { "type": "string", "description": "Story status" },
                    "title": { "type": "string", "description": "Story title" },
                    "created_at": { "type": "string", "format": "date-time", "description": "Creation timestamp" },
                    "user_id": { "type": "string", "description": "User ID" },
                    "experience_id": { "type": "string", "description": "Experience ID" },
                    "channel_id": { "type": "string", "description": "Channel ID" },
                    "notes": { "type": "string", "description": "Additional notes" },
                    "story_content": { "type": "string", "description": "Main content" },
                    "media_assets": {
                      "type": "array",
                      "description": "List of media assets",
                      "items": {
                        "type": "object",
                        "properties": {
                          "url": { "type": "string", "description": "Media URL" }
                        }
                      }
                    },
                    "seo_title_tag": { "type": "string", "description": "SEO title tag" },
                    "seo_meta_desc": { "type": "string", "description": "SEO meta description" },
                    "seo_excerpt": { "type": "string", "description": "SEO excerpt" },
                    "seo_slug": { "type": "string", "description": "SEO slug" },
                    "long_tail_keyword": { "type": "string", "description": "Long-tail keyword" },
                    "hashtags": {
                      "type": "array",
                      "description": "List of hashtags",
                      "items": { "type": "string" }
                    },
                    "experiences": {
                      "type": "object",
                      "description": "Experience details",
                      "properties": {
                        "name": { "type": "string", "description": "Experience name" }
                      }
                    },
                    "channels": {
                      "type": "object",
                      "description": "Channel details",
                      "properties": {
                        "channel_type": { "type": "string", "description": "Channel type" },
                        "name": { "type": "string", "description": "Channel name" }
                      }
                    },
                    "userprofiles": {
                      "type": "object",
                      "description": "User profile details",
                      "properties": {
                        "email": { "type": "string", "description": "User email" },
                        "firstname": { "type": "string", "description": "User first name" },
                        "lastname": { "type": "string", "description": "User last name" },
                        "media_assets": {
                          "type": "object",
                          "description": "User's media assets",
                          "properties": {
                            "url": { "type": "string", "description": "Profile media URL" }
                          }
                        }
                      }
                    },
                    "likes": {
                      "type": "object",
                      "description": "Likes info",
                      "properties": {
                        "count": { "type": "integer", "description": "Number of likes" }
                      }
                    },
                    "shares": {
                      "type": "object",
                      "description": "Shares info",
                      "properties": {
                        "count": { "type": "integer", "description": "Number of shares" }
                      }
                    },
                    "comments": {
                      "type": "object",
                      "description": "Comments info",
                      "properties": {
                        "count": { "type": "integer", "description": "Number of comments" }
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
                "error": { "type": "string", "description": "Error message" }
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
                "error": { "type": "string", "description": "Method not allowed message" }
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
                "error": { "type": "string", "description": "Internal server error message" }
              }
            }
          }
        }
      }
    }
  }
}`
}