import { supabase } from "@/libs/supabase/supabase_client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        res.status(405).send({ message: 'Only GET requests allowed' })
        return
    }

    try {
        const query = supabase
            .from('experience_details')
            .select('*, media_assets ( url )')
            .eq('type', 'iconic_photos')
        
        const { data, error } = await query;
        let transformedData;
        if (error) {
            console.error("Supabase Error:", error);
        } else {
            // Transform data to move 'url' out of 'media_assets'
            transformedData = data.map(({ media_assets, ...item }) => ({
                ...item,
                url: media_assets?.url || null, // Extract URL
            }));
        
            // console.log("Transformed Data:", transformedData);
        }        

        if (error) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(200).json({ data: transformedData });
    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while retrieving the challenge information."});
    }
}

// Workaround to enable Swagger on production 
export const swaggerPublicExpIconicPhotosGetAll = {
    index:17, 
    text:
`"/api/v1/experiences/public/iconicPhotos ": {
  "get": {
    "tags": ["experience"],
    "summary": "Get all iconic photos for a non-authenticated user",
    "description": "Retrieve all iconic photos for a non-authenticated user.",
    "responses": {
      "200": {
        "description": "Iconic photos retrieved successfully",
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
                      "type": { "type": "string" },
                      "name": { "type": "string" },
                      "text": { "type": "string" },
                      "created_at": { 
                        "type": "string",
                        "format": "date-time"
                      },
                      "updated_at": { 
                        "type": "string",
                        "format": "date-time"
                      },
                      "media_id": { "type": "string" },
                      "tips": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "required": ["text", "type"],
                          "properties": {
                            "text": {
                              "type": "string",
                              "description": "Tips for the iconic photo"
                            },
                            "type": {
                              "type": "string",
                              "enum": ["dos", "don'ts", "best_time"],
                              "description": "Type of tip: dos, don'ts, or best_time"
                            }
                          }
                        }
                      },
                      "url": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "id",
                      "experience_id", 
                      "type",
                      "name",
                      "created_at",
                      "updated_at"
                    ]
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