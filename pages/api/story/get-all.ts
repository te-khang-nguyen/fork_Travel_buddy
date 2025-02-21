import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/libs/supabase/supabase_client";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed!" });
    }

    try {
        const { 
            data: queryData, 
            error 
        } = await supabase
            .from("story")
            .select(`*, challenges (title)`);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ data: queryData });
    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while retrieving the challenge information."});
    }

};

export const swaggerStoryGetAll = {
    index:28, 
    text:
`"/api/v1/story ": {
    "get": {
      "tags": ["story"],
      "summary": "Get all stories",
      "description": "Retrieve all stories along with their associated challenges.",
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "responses": {
        "200": {
          "description": "A list of stories",
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
                        },
                        "challenges": {
                          "type": "object",
                          "properties": {
                            "title": {
                              "type": "string"
                            }
                          }
                        }
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