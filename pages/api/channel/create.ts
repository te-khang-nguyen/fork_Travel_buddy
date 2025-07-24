import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Validate request method
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed!" });
    }

    // Extract parameters
    const payload = req.body;

    // Extract authorization token
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Authorization token is required" });
    }

    // Create Supabase client
    const supabase = createApiClient(token!);
    // Get authenticated user
    const { 
        data: { user },
    } = await supabase.auth.getUser();

    try {
        // Insert story into database
        const { data, error } = await supabase.from("channels").insert([
            {
                user_id: user?.id,
                ...payload
            }
        ]).select("id").single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // Successful response
        return res.status(201).json({ data: {
            message: "Channel created successfully", 
            ...data 
          }});

    } catch (catchError) {
        console.error("Unexpected error:", catchError);
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Workaround to enable Swagger on production 
export const swaggerChannelCreate = {
    index:8, 
    text:
`"/api/v1/channel/ ": {
      "post": {
        "tags": ["channel"],
        "summary": "Create a new channel",
        "description": "Create a new channel with the provided details.",
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
                    "description": "Name of the channel"
                  },
                  "channel_type": {
                    "type": "string",
                    "description": "Type of the channel"
                  },
                  "url": {
                    "type": "string",
                    "description": "URL of the channel"
                  },
                  "brand_voice": {
                    "type": "string",
                    "description": "Brand voice of the channel"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Channel created successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "object",
                      "properties": {
                        "id": { "type": "string" },
                        "user_id": { "type": "string" },
                        "name": { "type": "string" },
                        "channel_type": { "type": "string" },
                        "url": { "type": "string" },
                        "brand_voice": { "type": "string" },
                        "created_at": { "type": "string" },
                        "updated_at": { "type": "string" }
                      }
                    },
                    "message": { "type": "string" }
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
            "description": "Unauthorized",
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
                    "error": { "type": "string" }
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