import { supabase } from "@/libs/supabase/supabase_client";
import { NextApiRequest, NextApiResponse } from "next";

// NEED TO CALL THIS API, BUT DON'T KNOW HOW TO YET
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        res.status(405).send({ message: 'Only GET requests allowed' })
        return
    }

    try {
        const { data, error } = await supabase
            .from("experiences")
            .select("*")
            .eq("status", "active")
            .order("created_at", { ascending: false });
        
        // const { visits, stories, ...rest } = data as any;

        if (error) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(200).json({ data });
    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while retrieving the challenge information."});
    }
}

// Workaround to enable Swagger on production 
export const swaggerPublicExpGetAll = {
    index:12, 
    text:
  `"/api/v1/experiences/public/": {
      "get": {
        "tags": ["experience"],
        "summary": "Get all active destinations for a non-authenticated user",
        "description": "Retrieve all active destinations for a non-authenticated user.",
        "responses": {
          "200": {
            "description": "A list of active destinations",
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
                          "created_by": { "type": "string" },
                          "name": { "type": "string" },
                          "primary_photo": { "type": "string" },
                          "photos": {
                            "type": "array",
                            "items": { "type": "string" }
                          },
                          "address": { "type": "string" },
                          "status": { "type": "string" },
                          "created_at": { "type": "string" },
                          "updated_at": { "type": "string" },
                          "primary_keyword": { "type": "string" },
                          "url_slug": { "type": "string" },
                          "description": { "type": "string" },
                          "thumbnail_description": { "type": "string" },
                          "primary_video": { "type": "string" },
                          "parent_destination": { "type": "string" }
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