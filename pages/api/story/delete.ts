import { createApiClient } from "@/libs/supabase/supabaseApi";
import { NextApiRequest, NextApiResponse } from "next";

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
  if (!token) {
    return res.status(401).json({ error: "Authorization token is required" });
  }
  // Create Supabase client
  const supabase = createApiClient(token);

  const storyId = req.query?.["story-id"];

  if (!storyId) {
    return res.status(400).json({ error: "Story ID is required" });
  }


  try {
    // Validate token
    await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("stories")
      .update({ status: "ARCHIVED" })
      .eq("id", storyId)
      .select("id, status")
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ data });
  } catch (err: any) {
    if (err.message?.includes('Invalid token') || err.message?.includes('Auth')) {
      return res.status(401).json({ error: "Invalid or expired authorization token" });
    }

    return res.status(500).json({
      error: err.message || "An error occurred while updating the challenge"
    });
  }
}


// Workaround to enable Swagger on production 
export const swaggerStoryDel = {
  index: 23,
  text:
    `"/api/v1/story ": {
    "delete": {
      "tags": ["story"],
      "summary": "Delete a story",
      "description": "Move a story into ARCHIVED status. Requires valid authorization token from story creation.",
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
          "description": "Bad request (e.g., multiple rows matched)",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "error": {
                    "type": "string"
                  }
                }
              }
            }
          }
        },
        "401": {
          "description": "Unauthorized - Invalid or missing authorization token",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "error": {
                    "type": "string"
                  }
                }
              }
            }
          }
        },
        "404": {
          "description": "Story not found or unauthorized to delete",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "error": {
                    "type": "string"
                  }
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
                  "message": {
                    "type": "string"
                  }
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
                  "error": {
                    "type": "string"
                  }
                }
              }
            }
          }
        }
      }
    }
  }`
}