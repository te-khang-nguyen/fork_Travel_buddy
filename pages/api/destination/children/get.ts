import { supabase } from "@/libs/supabase/supabase_client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed!" });
    }

    const { parent_destination_id } = req.query;

    
    
    try {
        const { 
            data: queryData, 
            error 
        } = await supabase
            .from("destinations")
            .select("*")
            .eq("parent_destination", parent_destination_id);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ data: queryData });
    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while retrieving the challenge information."});
    }

};

export const swaggerDesChildrenGet = {
    index:15, 
    text:
`"/api/v1/destination/children": {
      "get": {
        "tags": ["destination"],
        "summary": "Get child destinations",
        "description": "Retrieve child destinations by parent destination ID.",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "in": "query",
            "name": "parent_destination_id",
            "schema": {
              "type": "string"
            },
            "required": true,
            "description": "The ID of the parent destination to retrieve child destinations for"
          }
        ],
        "responses": {
          "200": {
            "description": "Child destinations retrieved successfully",
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