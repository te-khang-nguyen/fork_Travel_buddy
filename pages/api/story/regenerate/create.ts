import { NextApiRequest, NextApiResponse } from "next";
import { generateLocationStories } from "@/libs/services/storyGen";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Validate request method
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed!" });
    }

    // Extract body
    const { attractions, notes, brand_voice, story_length, channel_type } = req.body;

    // Extract authorization token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: "Authorization token is required" });
    }

    try {
        // Insert story into database
        const { data: storyData, error } = await generateLocationStories(
                attractions, 
                notes,
                brand_voice,
                story_length,
                channel_type 
        );

        if (error) {
            console.error("Story insertion error:", error);
            return res.status(400).json({ error: error.message });
        }

        // Successful response
        return res.status(201).json({ 
            data: storyData
        });

    } catch (catchError) {
        console.error("Unexpected error:", catchError);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const swaggerStoryGenerate = {
    index:25, 
    text:
`"/api/v1/story/generate": {
    "post": {
      "tags": ["story"],
      "summary": "Generate a new story",
      "description": "Generate a new story based on the provided schedule, attractions, notes, and story length.",
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
                "schedule": {
                  "type": "string",
                  "description": "The schedule for the story"
                },
                "attractions": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "description": "The attractions for the story"
                },
                "notes": {
                  "type": "string",
                  "description": "Additional notes for the story"
                },
                "story_length": {
                  "type": "number",
                  "description": "The length of the story"
                }
              }
            }
          }
        }
      },
      "responses": {
        "201": {
          "description": "Story generated successfully",
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
                      "schedule": {
                        "type": "string"
                      },
                      "attractions": {
                        "type": "array",
                        "items": {
                          "type": "string"
                        }
                      },
                      "notes": {
                        "type": "string"
                      },
                      "story_length": {
                        "type": "number"
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
        "401": {
          "description": "Unauthorized - Authorization token is required"
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