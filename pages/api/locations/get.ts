import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";
import { Location } from "@/libs/services/business/location";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed!" });
    }

    const location_id = req.query["location-id"];

    if (!location_id) {
        return res.status(400).json({ error: "Location ID is required" });
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
            .from("locations")
            .select("*")
            .eq("id", location_id);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ data: queryData });
    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while retrieving the challenge information."});
    }

};

export const swaggerBusinessLocationGet = {
    index: 16,
    text:
`"/api/v1/locations": {
    "get": {
      "tags": ["location"],
      "summary": "Get location details",
      "description": "Retrieve details of a specific location by its ID.",
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "parameters": [
        {
          "in": "query",
          "name": "location-id",
          "schema": {
            "type": "string"
          },
          "required": true,
          "description": "The ID of the attraction to retrieve"
        }
      ],
      "responses": {
        "200": {
          "description": "Location details retrieved successfully",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": true
                  },
                  "data": {
                    "type": "object",
                    "properties": {
                      "id": { "type": "string" },
                      "created_by": { "type": "string" },
                      "title": { "type": "string" },
                      "primary_photo": { "type": "string" },
                      "primary_photo_id": { "type": "string" },
                      "photos": {
                        "type": "array",
                        "items": { "type": "string" }
                      },
                      "hours": { "type": "string" },
                      "description": { "type": "string" },
                      "description_thumbnail": { "type": "string" },
                      "order_of_appearance": { "type": "number" },
                      "created_at": { "type": "string" },
                      "updated_at": { "type": "string" }
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
        "401": {
          "description": "Unauthorized - Invalid or missing authentication token",
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