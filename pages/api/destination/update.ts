import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'PUT') {
        res.status(405).send({ message: 'Only PUT requests allowed' });
        return;
    }

    const token = req.headers.authorization?.split(' ')[1];
    const supabase = createApiClient(token);

    const { destination_id } = req.query;
    const data = req.body;

    if (!destination_id) {
        return res.status(400).json({ error: "Destination ID is required" });
    }

    try {
        const {
            data: updateData, 
            error: updateError
        } = await supabase.from('destinations')
                    .update({
                        ...data 
                    })
                    .eq('id', destination_id)
                    .select("id");

        if (updateError) {
            return res.status(400).json({ error: updateError });
        }
        if (!updateData || updateData.length === 0) {
          return res.status(403).json({ success: false, message: "Unauthorized or destination not found" });
        }
        return res.status(200).json({ success: true, message: "Destination updated successfully", data: updateData });
    } catch (err: any) {
        return res.status(500).json({ 
            error: err.message || "An error occurred while updating the destination" 
        });
    }
}

// Workaround to enable Swagger on production 
export const swaggerDestUpdate = {
    index:11, 
    text:
`"/api/v1/destination/": {
      "put": {
        "tags": ["destination"],
        "summary": "Update a destination",
        "description": "Update the details of an existing destination.",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "in": "query",
            "name": "destination_id",
            "schema": {
              "type": "string"
            },
            "required": true,
            "description": "The ID of the destination to update"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "name": { "type": "string" },
                  "primary_photo": { "type": "string" },
                  "photos": {
                    "type": "array",
                    "items": { "type": "string" }
                  },
                  "address": { "type": "string" },
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
        },
        "responses": {
          "200": {
            "description": "Destination updated successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean" },
                    "message": { "type": "string" },
                    "data": {
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
            "description": "Unauthorized or destination not found",
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