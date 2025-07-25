import { createApiClient } from "@/libs/supabase/supabaseApi";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        res.status(405).send({ message: 'Only GET requests allowed' })
        return
    }

    // Extract authorization token
    const token = req.headers.authorization?.split(" ")[1];
    // Create Supabase client
    const supabase = createApiClient(token!);

    const businessId = req.query["business-id"];

    try {
        const { data, error: experienceQueryError } = await supabase
            .from("experiences")
            .select("*")
            .in("status", ["active", "inactive"])
            .eq("created_by", businessId)
            .order("created_at", { ascending: false });

        if (experienceQueryError) {
            return res.status(400).json({ error: experienceQueryError.message });
        }

        return res.status(200).json({ data });
    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while retrieving the challenge information."});
    }
}


// Workaround to enable Swagger on production 
export const swaggerBussExpGetAll = {
    index: 12,
    text:
        `"/api/v1/experiences/business/": {
      "get": {
        "tags": ["B2B-experience"],
        "summary": "Get all active experiences",
        "description": "Retrieve all active experiences.",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "in": "query",
            "name": "business-id",
            "schema": {
              "type": "string"
            },
            "required": true,
            "description": "The ID of the B2B account for which to retrieve the experiences"
          }
        ],
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