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

        const { data: { user } } = await supabase.auth.getUser(token);

        const { experience_id } = req.body;
 
        const { data, error } = await supabase
        .from("visits")
        .insert([{
                experience_id,
                user_id: user!.id
        },])
        .select("created_at")
        .single();

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        return res.status(200).json({
            data: data,
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
export const swaggerDestVisitsCreate = {
    index:17, 
    text:
`"/api/v1/experiences/visits/ ": {
    "post": {
      "tags": ["visits"],
      "summary": "Store user's visits to an experience.",
      "description": "Store user's visits to an experience."",
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
                "experience-id": {
                  "type": "string"
                }
              }
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Visit stored successfully",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "data": {
                    "type": "object",
                    "properties": {
                      "created_at": { "type": "string" }
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