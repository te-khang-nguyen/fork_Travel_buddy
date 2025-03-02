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
    const { destinationId } = req.query;
    const { userNotes, storyFull, mediaSubmitted } = req.body;

    // Extract authorization token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: "Authorization token is required" });
    }

    // Create Supabase client
    const supabase = createApiClient(token);
    // Get authenticated user
    const { 
        data: { user },
    } = await supabase.auth.getUser();

    // Validate required parameters
    if (!destinationId) {
        return res.status(400).json({ error: "Desination ID is required" });
    }

    try {
        // Insert story into database
        const { data, error } = await supabase.from("story").insert([
            {
                status: "ACTIVE",
                userId: user?.id,
                destinationId: destinationId,
                userNotes: userNotes,
                storyFull: storyFull,
                mediaSubmitted: mediaSubmitted,
            }
        ]).select('id').single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        const toMediaAssets =  mediaSubmitted.map((mediaItem)=>({
          uploader_id: user!.id,
          url: mediaItem,
          usage: "story",
          mime_type: "image/jpeg"
        }))

        const {
          data: mediaData, 
          error: mediaErr
        } = await supabase.from("media_assets")
                          .insert(toMediaAssets)
                          .select();

        // Successful response
        return res.status(201).json({ data: {
            message: "Story created successfully", 
            id: data?.id 
          }});

    } catch (catchError) {
        console.error("Unexpected error:", catchError);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export const swaggerStoryCreate = {
    index:26, 
    text:
`"/api/v1/story": {
    "post": {
      "tags": ["story"],
      "summary": "Create a new story",
      "description": "Create a new story for a challenge.",
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "parameters": [
        {
          "in": "query",
          "name": "destinationId",
          "schema": {
            "type": "string"
          },
          "required": true,
          "description": "The ID of the challenge"
        },
        {
          "in": "query",
          "name": "challengeHistoryId",
          "schema": {
            "type": "string"
          },
          "required": false,
          "description": "The ID of the challenge history"
        }
      ],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "user_notes": {
                  "type": "string",
                  "description": "User notes for the story"
                },
                "story": {
                  "type": "string",
                  "description": "The full story"
                },
                "media_submitted": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "description": "Media submitted for the story"
                }
              }
            }
          }
        }
      },
      "responses": {
        "201": {
          "description": "Story created successfully",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "message": {
                    "type": "string",
                    "example": "Story created successfully"
                  },
                  "storyId": {
                    "type": "string"
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