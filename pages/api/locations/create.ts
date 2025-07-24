import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";
import { Location } from "@/libs/services/business/location";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        res.status(405).send({ message: 'Only POST requests allowed' })
        return
    }

    try {
        const token = req.headers.authorization?.split(' ')[1];
        const supabase = createApiClient(token!);

        const {
            data: { user },
        } = await supabase.auth.getUser(token);

        const { 
            experience_id,
            title,
            primary_photo,
            primary_photo_id,
            photos,
            hours,
            description,
            description_thumbnail,
            order_of_appearance
        } = req.body;

        const { data, error } = await supabase
        .from("locations")
        .insert([
            {
                experience_id,
                created_by: user!.id,
                title,
                primary_photo,
                primary_photo_id,
                photos,
                hours,
                status : 'inactive',
                description,
                description_thumbnail,
                order_of_appearance
            },
        ])
        .select("id")
        .single();

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        return res.status(200).json({
            data: { id: data.id },
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

export const swaggerBusinessLocationCreate = {
    index: 16,
    text:
`"/api/v1/locations/ ": {
    "post": {
      "tags": ["location"],
      "summary": "Create a new location",
      "description": "Create a new location for an experience.",
      "security": [
        {
          "bearerAuth": []
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
          "description": "Location created successfully",
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
                      "id": {
                        "type": "string",
                        "description": "Unique identifier of the created location"
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "400": {
          "description": "Bad request or validation error",
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
