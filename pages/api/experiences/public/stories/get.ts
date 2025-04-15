import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/libs/supabase/supabase_client";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed!" });
    }

    const experienceId = req.query?.["experience-id"];
    
    try {
        const { 
            data: queryData, 
            error 
        } = await supabase
            .from("stories")
            .select(`*, 
              experiences(name), 
              media_assets(url),
              userprofiles(email, firstname, lastname, media_assets(url))`)
            .eq("experience_id", experienceId)
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
export const swaggerPublicExpStoryGet = {
    index:17, 
    text:
`"/api/v1/experiences/public/stories": {
    "get": {
      "tags": ["story"],
      "summary": "Retrieve a story by experience ID.",
      "description": "Retrieve a story by experience ID.",
      "parameters": [
        {
          "in": "query",
          "name": "experience-id",
          "schema": {
            "type": "string"
          },
          "required": true,
          "description": "The ID of the target experience"
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