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
    const supabase = createApiClient(token!);

    const activity_id = req.query["activity-id"];
    const data = req.body;

    if (!activity_id) {
        return res.status(400).json({ error: "Activity ID is required" });
    }

    try {
        const {
            data: updateData, 
            error: updateError
        } = await supabase.from('activities')
                    .update({
                        ...data 
                    })
                    .eq('id', activity_id)
                    .select("*");

        if (updateError) {
            return res.status(400).json({ error: updateError });
        }
        if (!updateData || updateData.length === 0) {
          return res.status(403).json({ success: false, message: "Unauthorized or attraction not found" });
        }
        return res.status(200).json({ success: true, message: "Activity updated successfully", data: updateData });
    } catch (err: any) {
        return res.status(500).json({ 
            error: err.message || "An error occurred while updating the attraction" 
        });
    }
}

export const swaggerBusinessActivityUpdate = {
    index: 16,
    text:
`"/api/v1/activities/": {
    "put": {
      "tags": ["activity"],
      "summary": "Update information for an activity.",
      "description": "Update the details of a specific activity by its ID.",
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "parameters": [
        {
          "in": "query",
          "name": "activity-id",
          "schema": {
            "type": "string"
          },
          "required": true,
          "description": "The ID of the activity to update"
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
                "photos_id": {
                  "type": "array",
                  "items": { "type": "string" }
                },
                "hours": { "type": "string" },
                "description": { "type": "string" },
                "description_thumbnail": { "type": "string" },
                "order_of_appearance": { "type": "number" },
                "highlights": {
                  "type": "array",
                  "items": { "type": "string" }
                },
              }
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Activity updated successfully",
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
                    "example": "Activity updated successfully"
                  },
                  "data": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "string",
                        "description": "Unique identifier of the updated activity"
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
          "description": "Unauthorized or activity not found",
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