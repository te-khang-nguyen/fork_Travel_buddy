import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/libs/supabase/supabase_client";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed!" });
    }

    const story_id = req.query?.["story-id"];
    
    try {
        const { 
            data: queryData, 
            error 
        } = await supabase
            .from("story")
            .select("*")
            .eq("id", story_id)
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ data: queryData });
    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while retrieving the challenge information."});
    }

};


export const swaggerStoryGet = {
    index:27, 
    text:
`"/api/v1/story  ": {
    "get": {
      "tags": ["story"],
      "summary": "Retrieve a story by ID",
      "description": "Retrieve a story by its ID.",
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "parameters": [
        {
          "in": "query",
          "name": "story_id",
          "schema": {
            "type": "string"
          },
          "required": true,
          "description": "The ID of the story to retrieve"
        }
      ],
      "responses": {
        "200": {
          "description": "Story retrieved successfully",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "data": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "string"
                      },
                      "challengeId": {
                        "type": "string"
                      },
                      "title": {
                        "type": "string"
                      },
                      "story": {
                        "type": "string"
                      },
                      "created_at": {
                        "type": "string"
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "400": {
          "description": "Bad request"
        },
        "405": {
          "description": "Method not allowed"
        },
        "500": {
          "description": "Internal server error"
        }
      }
    }
  }`
}