import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";
import { Activity } from "@/libs/services/business/activity";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed!" });
    }

    const experience_id = req.query["experience-id"];

    if (!experience_id) {
        return res.status(400).json({ error: "Experience ID is required" });
    }

    // Extract authorization token
    const token = req.headers.authorization?.split(" ")[1];
    // Create Supabase client
    const supabase = createApiClient(token!);
    
    try {
        const { 
            data: queryData, 
            error 
        } = await supabase
            .from("activities")
            .select("*")
            .eq("experience_id", experience_id);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ data: queryData });
    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while retrieving the challenge information."});
    }

};

// Workaround to enable Swagger on production 
export const swaggerBusinessActivitiesByExperienceIdGet = {
    index: 16,
    text:
`"/api/v1/activities/experience": {
      "get": {
        "tags": ["activity"],
        "summary": "Get activities by experience ID for B2B user",
        "description": "Retrieve activities by experience ID for B2B user.",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "in": "query",
            "name": "experience-id",
            "schema": {
              "type": "string"
            },
            "required": true,
            "description": "The ID of the experience to retrieve activities for"
          }
        ],
        "responses": {
          "200": {
            "description": "Activities retrieved successfully",
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
                          "experience_id": { "type": "string" },
                          "title": { "type": "string" },
                          "primary_photo": { "type": "string" },
                          "photos": {
                            "type": "array",
                            "items": { "type": "string" }
                          },
                          "hours": { "type": "string" },
                          "status": { "type": "string" },
                          "attraction_info": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "description": { "type": "string" },
                                "description_thumbnail": { "type": "string" }
                              }
                            }
                          },
                          "description": { "type": "string" },
                          "description_thumbnail": { "type": "string" },
                          "url_slug": { "type": "string" },
                          "primary_keyword": { "type": "string" },
                          "address": { "type": "string" },
                          "order_of_appearance": { "type": "number" },
                          "primary_photo_id": { "type": "string" }
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