import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/libs/supabase/supabase_client";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed!" });
    }
    
    try {
        const { 
            data: queryData, 
            error 
        } = await supabase
            .from("stories")
            .select("*, media_assets(url), channels(channel_type)")
            .eq("status", "PUBLISHED")
            .eq("channels.channel_type", "Travel Buddy");

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ data: queryData });
    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while retrieving the challenge information."});
    }

};


// Workaround to enable Swagger on production 
export const swaggerPublicStoryGetAll = {
    index:24, 
    text:
`"/api/v1/story/public/": {
    "get": {
      "tags": ["story"],
      "summary": "Retrieve all published stories",
      "description": "Retrieve all stories that are published and belong to the 'Travel Buddy' channel.",
      "responses": {
        "200": {
          "description": "A list of published stories",
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
                          "type": "string"
                        },
                        "destination_id": {
                          "type": "string"
                        },
                        "channel_id": {
                          "type": "string"
                        },
                        "title": {
                          "type": "string"
                        },
                        "story": {
                          "type": "string"
                        },
                        "created_at": {
                          "type": "string"
                        },
                        "media_assets": {
                          "type": "array",
                          "items": {
                            "type": "object",
                            "properties": {
                              "url": {
                                "type": "string"
                              }
                            }
                          }
                        },
                        "channels": {
                          "type": "array",
                          "items": {
                            "type": "object",
                            "properties": {
                              "channel_type": {
                                "type": "string"
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
          }
        },
        "400": {
          "description": "Bad request"
        },
        "405": {
          "description": "Method not allowed"
        },
        "500": {
          "description": "Internal server error"
        }
      }
    }
  }`
}