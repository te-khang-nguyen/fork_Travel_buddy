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
        const supabase = createApiClient(token!);

        const {
            data: { user },
        } = await supabase.auth.getUser(token);

        const { 
            name,
            primary_photo,
            primary_photo_id,
            photos,
            photos_id,
            address,
            primary_keyword,
            url_slug,
            description,
            thumbnail_description,
            primary_video,
            primary_video_id,
            parent_destination,
        } = req.body;

        const userId = user?.id;

        const { data, error } = await supabase
        .from("destinations")
        .insert([
            {
                created_by: userId,
                name,
                primary_photo,
                primary_photo_id,
                photos,
                photos_id,
                address,
                primary_keyword,
                url_slug,
                description,
                thumbnail_description,
                primary_video,
                primary_video_id,
                parent_destination,
                status: "inactive",
            },
        ])
        .select('id, photos_id')
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
export const swaggerDestCreate = {
    index:11, 
    text:
  `"/api/v1/destination/ ": {
      "post": {
        "tags": ["destination"],
        "summary": "Create a new destination",
        "description": "Create a new destination with the provided details.",
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
                  "name": {
                    "type": "string",
                    "description": "Name of the destination"
                  },
                  "primary_photo": {
                    "type": "string",
                    "description": "Primary photo URL of the destination"
                  },
                  "photos": {
                    "type": "array",
                    "items": {
                      "type": "string",
                      "description": "Additional photos URLs of the destination"
                    }
                  },
                  "address": {
                    "type": "string",
                    "description": "Address of the destination"
                  },
                  "primary_keyword": {
                    "type": "string",
                    "description": "Primary keyword for the destination"
                  },
                  "url_slug": {
                    "type": "string",
                    "description": "URL slug for the destination"
                  },
                  "description": {
                    "type": "string",
                    "description": "Description of the destination"
                  },
                  "thumbnail_description": {
                    "type": "string",
                    "description": "Thumbnail description of the destination"
                  },
                  "primary_video": {
                    "type": "string",
                    "description": "Primary video URL of the destination"
                  },
                  "parent_destination": {
                    "type": "string",
                    "description": "Parent destination ID"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Destination created successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
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
