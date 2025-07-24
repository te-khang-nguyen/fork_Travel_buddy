import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";
import { StoryReq, StoryRes } from "@/libs/services/user/story";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<StoryRes>
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed!" });
    }

    // Extract authorization token
    const token = req.headers.authorization?.split(" ")[1];
    // Create Supabase client
    const supabase = createApiClient(token!);
    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    try {
        const { 
            data: queryData, 
            error 
        } = await supabase
            .from("stories")
            .select(`*, 
              media_assets(url),
              channels(channel_type, name),
              userprofiles(email, firstname, lastname, media_assets(url)),
              likes(count),
              shares(count),
              comments(count)`)
            .eq("user_id", user!.id);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ data: queryData });
    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while retrieving the challenge information."});
    }

};

// Workaround to enable Swagger on production 
export const swaggerStoryGetAll = {
    index:20, 
    text:
`"/api/v1/story/  ": {
  "get": {
    "tags": ["story"],
    "summary": "Get all stories",
    "description": "Retrieve all stories with their media assets",
    "security": [
      {
        "bearerAuth": []
      }
    ],
    "responses": {
      "200": {
        "description": "A list of stories",
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
                        "description": "Unique identifier for the story"
                      },
                      "status": { 
                        "type": "string",
                        "description": "Current status of the story"
                      },
                      "title": { 
                        "type": "string",
                        "description": "Title of the story"
                      },
                      "created_at": { 
                        "type": "string",
                        "format": "date-time",
                        "description": "Creation timestamp"
                      },
                      "user_id": { 
                        "type": "string",
                        "description": "ID of the story creator"
                      },
                      "experience_id": { 
                        "type": "string",
                        "description": "ID of the associated experience"
                      },
                      "notes": { 
                        "type": "string",
                        "description": "Additional notes for the story"
                      },
                      "story_content": { 
                        "type": "string",
                        "description": "Main content of the story"
                      },
                      "media_assets": {
                        "type": "array",
                        "description": "List of media assets associated with the story",
                        "items": {
                          "type": "object",
                          "properties": {
                            "url": { 
                              "type": "string",
                              "description": "URL of the media asset"
                            }
                          }
                        }
                      },
                      "seo_title_tag": { 
                        "type": "string",
                        "description": "SEO title tag"
                      },
                      "seo_meta_desc": { 
                        "type": "string",
                        "description": "SEO meta description"
                      },
                      "seo_excerpt": { 
                        "type": "string",
                        "description": "SEO excerpt"
                      },
                      "seo_slug": { 
                        "type": "string",
                        "description": "URL slug for SEO"
                      },
                      "long_tail_keyword": { 
                        "type": "string",
                        "description": "Long-tail keyword for SEO"
                      },
                      "hashtags": {
                        "type": "array",
                        "description": "List of hashtags",
                        "items": { 
                          "type": "string"
                        }
                      },
                      "experiences": {
                        "type": "object",
                        "description": "Experience details",
                        "properties": {
                          "name": { 
                            "type": "string",
                            "description": "Name of the experience"
                          }
                        }
                      },
                      "channels": {
                        "type": "object",
                        "description": "Channel details",
                        "properties": {
                          "channel_type": { 
                            "type": "string",
                            "description": "Type of the channel"
                          },
                          "name": { 
                            "type": "string",
                            "description": "Name of the channel"
                          }
                        }
                      },
                      "userprofiles": {
                        "type": "object",
                        "description": "User profile details",
                        "properties": {
                          "email": { 
                            "type": "string",
                            "description": "User's email"
                          },
                          "firstname": { 
                            "type": "string",
                            "description": "User's first name"
                          },
                          "lastname": { 
                            "type": "string",
                            "description": "User's last name"
                          },
                          "media_assets": { 
                            "type": "object",
                            "description": "User's media assets",
                            "properties": {
                              "url": {
                                "type": "string",
                                "description": "URL of user's profile media"
                              }
                            }
                          }
                        }
                      },
                      "likes": {
                        "type": "object",
                        "description": "Story likes information",
                        "properties": {
                          "count": { 
                            "type": "integer",
                            "description": "Number of likes"
                          }
                        }
                      },
                      "shares": {
                        "type": "object",
                        "description": "Story shares information",
                        "properties": {
                          "count": { 
                            "type": "integer",
                            "description": "Number of shares"
                          }
                        }
                      },
                      "comments": {
                        "type": "object",
                        "description": "Story comments information",
                        "properties": {
                          "count": { 
                            "type": "integer",
                            "description": "Number of comments"
                          }
                        }
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
                "error": { 
                  "type": "string",
                  "description": "Error message"
                }
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
                "error": { 
                  "type": "string",
                  "description": "Authentication error message"
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
                  "description": "Method not allowed message"
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
                  "description": "Internal server error message"
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