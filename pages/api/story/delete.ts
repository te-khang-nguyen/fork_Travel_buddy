import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'DELETE') {
        res.status(405).send({ message: 'Only DELETE requests allowed' });
        return;
    }

    // Extract authorization token
    const token = req.headers.authorization?.split(" ")[1];
    // Create Supabase client
    const supabase = createApiClient(token);

    const storyId = req.query?.["story-id"];

    if (!storyId) {
        return res.status(400).json({ error: "Story ID is required" });
    }


    try {
        const { data, error } = await supabase
            .from("stories")
            .update({status : "ARCHIVED"})
            .eq("id", storyId)
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


export const swaggerStoryDel = {
  index:30, 
  text:
  `"/api/story/    ": {
    "delete": {
      "tags": ["story"],
      "summary": "Delete a story",
      "description": "Move a story into ARCHIVED status.",
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "parameters": [
        {
          "in": "query",
          "name": "story-id",
          "schema": {
            "type": "string"
          },
          "required": true,
          "description": "The ID of the story to delete"
        }
      ],
      "responses": {
        "200": {
          "description": "Story deleted successfully",
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
}