import { createApiClient } from "@/libs/supabase/supabaseApi";
import { NextApiRequest, NextApiResponse } from "next";


// This function returns all destination_details except for iconic_photos (which requires further data transformation)
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        res.status(405).send({ message: 'Only GET requests allowed' })
        return
    }

    // Extract authorization token
    const token = req.headers.authorization?.split(" ")[1];
    // Create Supabase client
    const supabase = createApiClient(token);

    try {
        const { destination_id, type } = req.query;
        const query = type 
            ? supabase.from('destination_details').select('*').eq('destination_id', destination_id).eq('type', type)
            : supabase.from('destination_details').select('*').eq('destination_id', destination_id).neq('type', 'iconic_photos');            
        
        const { data, error } = await query;

        if (error) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(200).json({ data });
    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while retrieving the challenge information."});
    }
};

export const swaggerDesDetailsGet = {
    index:14, 
    text:
`"/api/v1/destination/details": {
      "get": {
        "tags": ["destination"],
        "summary": "Get destination details",
        "description": "Retrieve destination details by destination ID and optional type.",
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
            "description": "The ID of the destination to retrieve details for"
          },
          {
            "in": "query",
            "name": "type",
            "schema": {
              "type": "string"
            },
            "required": false,
            "description": "The type of details to retrieve"
          }
        ],
        "responses": {
          "200": {
            "description": "Destination details retrieved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "id": { "type": "string" },
                          "destination_id": { "type": "string" },
                          "type": { "type": "string" },
                          "name": { "type": "string" },
                          "text": { "type": "string" },
                          "media": {
                            "type": "array",
                            "items": { "type": "string" }
                          },
                          "created_at": { "type": "string" },
                          "updated_at": { "type": "string" }
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