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

  const experience_id = req.query?.["experience-id"];

  // Extract authorization token
  const token = req.headers.authorization?.split(" ")[1];
  // Create Supabase client
  const supabase = createApiClient(token);

  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  const { data: userData, error: userError } = await supabase
    .from("businessprofiles")
    .select("type")
    .eq("businessid", user!.id)
    .single();

  try {
    const { data, error } = await supabase
      .from("experiences")
      .select("*")
      .eq("id", experience_id)
      .eq("created_by", user!.id)
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json({ data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "An error has occurred while retrieving the challenge information." });
  }
}

// Workaround to enable Swagger on production 
export const swaggerExpGet = {
  index: 13,
  text:
    `"/api/v1/experiences": {
      "get": {
        "tags": ["experience"],
        "summary": "Get a destination by ID",
        "description": "Retrieve a destination by its ID.",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "in": "query",
            "name": "experience-id",
            "schema": {
              "type": "string"
            },
            "required": true,
            "description": "The ID of the destination to retrieve"
          }
        ],
        "responses": {
          "200": {
            "description": "Destination retrieved successfully",
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