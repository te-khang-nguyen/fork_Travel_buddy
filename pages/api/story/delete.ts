import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/libs/supabase/supabase_client";


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'DELETE') {
        res.status(405).send({ message: 'Only DELETE requests allowed' });
        return;
    }

    const {story_id, challengeHistoryId} = req.query;

    if (!story_id && !challengeHistoryId ) {
        return res.status(400).json({ error: "Story ID is required" });
    }

    try {
        const { data, error } = await supabase
            .from("story")
            .update({status : "ARCHIVED"})
            .eq(story_id? "id": "challengeHistoryId", story_id ?? challengeHistoryId)
            .select("id, status");

        if (error) {
            return res.status(400).json({ error });
        }

        return res.status(200).json({ data });
    } catch (err: any) {
        return res.status(500).json({ 
            error: err.message || "An error occurred while updating the challenge" 
        });
    }
}


export const swaggerBussDel = 
  `"/api/v1/story    ": {
      "delete": {
        "tags": ["story"],
        "summary": "Delete a story",
        "description": "Move a story into ARCHIVED",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "in": "path",
            "name": "challenge_id",
            "schema": {
              "type": "string"
            },
            "required": true,
            "description": "The ID of the challenge to update"
          }
        ],
        "responses": {
          "200": {
            "description": "Challenge deleted successfully",
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
                        "status": {
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