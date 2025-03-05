import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '4.5mb', // Increase the body size limit (e.g., 5MB)
        },
    },
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "PUT") {
        return res.status(405).json({ error: "Method not allowed!" });
    }

    const storyId = req.query?.["story-id"];
    const updatedData = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    const supabase = createApiClient(token);

    const {
        data: { user },
    } = await supabase.auth.getUser();

    try {
        const {
            data: storyData,
            error: storyErr
        } = await supabase
            .from('stories')
            .update(updatedData)
            .eq("id", storyId)
            .select();
            // .single();

        if (storyErr) {
            return res.status(400).json({ error: storyErr.message });
        }

        return res.status(200).json({ data: storyData });

    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while updating location." });
    }

};


export const swaggerStoryUpdate = {
  index:29, 
  text:
`"/api/v1/story   ": {
    "put": {
      "tags": ["story"],
      "summary": "Update a story",
      "description": "Update the details of an existing story.",
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "parameters": [
        {
          "in": "path",
          "name": "story-id",
          "schema": {
            "type": "string"
          },
          "required": true,
          "description": "The ID of the story to update"
        }
      ],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "notes": {
                  "type": "string",
                  "description": "User travel notes"
                },
                "story_content": {
                  "type": "string",
                  "description": "AI-generated travel story based on users notes"
                },
                "media": {
                  "type": "array",
                  "items": {
                    "type": "string",
                    "description": "URL of the user submitted media"
                  }
                }
              }
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Story updated successfully",
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