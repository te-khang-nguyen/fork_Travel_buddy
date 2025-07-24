import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";
import { Location } from "@/libs/services/business/location";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'PUT') {
        res.status(405).send({ message: 'Only PUT requests allowed' });
        return;
    }

    const token = req.headers.authorization?.split(' ')[1];
    const supabase = createApiClient(token!);

    const location_id = req.query["location-id"];
    const data = req.body;

    if (!location_id) {
        return res.status(400).json({ error: "Location ID is required" });
    }

    try {
        const {
            data: updateData, 
            error: updateError
        } = await supabase.from('locations')
                    .update({
                        ...data 
                    })
                    .eq('id', location_id)
                    .select("*");

        if (updateError) {
            return res.status(400).json({ error: updateError });
        }
        if (!updateData || updateData.length === 0) {
          return res.status(403).json({ success: false, message: "Unauthorized or attraction not found" });
        }
        return res.status(200).json({ success: true, message: "Location updated successfully", data: updateData });
    } catch (err: any) {
        return res.status(500).json({ 
            error: err.message || "An error occurred while updating the attraction" 
        });
    }
}

export const swaggerBusinessLocationUpdate = {
    index: 16,
    text:
`"/api/v1/locations/": {
    "put": {
      "tags": ["location"],
      "summary": "Update location details",
      "description": "Update the details of a specific location by its ID.",
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
          "description": "The ID of the location to update"
        }
      ],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
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
                "order_of_appearance": { "type": "number" }
              }
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Location updated successfully",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": true
                  },
                  "message": {
                    "type": "string",
                    "example": "Location updated successfully"
                  },
                  "data": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "string",
                        "description": "Unique identifier of the updated location"
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
        "403": {
          "description": "Unauthorized or location not found",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": { "type": "boolean" },
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