import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";

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
        const supabase = createApiClient(token);

        const {
            data: { user },
        } = await supabase.auth.getUser(token);

        const { 
            experience_id,
            type,
            name,
            text,
            media,
            created_at,
            updated_at,
            media_id,
        } = req.body;

        const { data, error } = await supabase
        .from("experience_details")
        .insert([
            {
                experience_id,
                type,
                name,
                text,
                media,
                created_at,
                updated_at,
                media_id,
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

// Workaround to enable Swagger on production 
export const swaggerExpDetailsCreate = {
    index: 14,
    text:
` "/api/v1/experiences/details/": {
      "post": {
        "tags": ["experience"],
        "summary": "Create destination details",
        "description": "Create new details for a destination.",
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
                  "experience_id": { "type": "string" },
                  "type": { "type": "string" },
                  "name": { "type": "string" },
                  "text": { "type": "string" },
                  "media": {
                    "type": "array",
                    "items": { "type": "string" }
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Destination details created successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "object",
                      "properties": {
                        "id": { "type": "string" }
                      }
                    },
                    "success": { "type": "boolean" }
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
                    "success": { "type": "boolean" },
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
                    "success": { "type": "boolean" },
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