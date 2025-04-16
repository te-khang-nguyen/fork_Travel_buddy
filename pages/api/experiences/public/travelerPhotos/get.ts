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
            .select(`
              id,
              status,
              created_at,
              seo_title_tag, 
              hashtags,
              experiences(name), 
              media_assets(url),
              userprofiles(email, firstname, lastname, media_assets(url))
            `.trim())
            .eq("experience_id", experienceId)
            .eq("status", "PUBLISHED");

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
`"/api/v1/experiences/public/travelerPhotos": {
    "get": {
        "tags": ["experience"],
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
                          "id": { "type": "string" },
                          "status": { "type": "string" },
                          "created_at": { "type": "string" },
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