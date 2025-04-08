import { createApiClient } from "@/libs/supabase/supabaseApi";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed!" });
  }

  const experienceId = req.query["experience-id"];
  // Extract authorization token
  const token = req.headers.authorization?.split(" ")[1];
  // Create Supabase client
  const supabase = createApiClient(token);

  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  try {
    const {
      data: queryData,
      error
    } = await supabase
      .from("visits")
      .select("created_at, exprience_id")
      .eq("user_id", user!.id)
      .eq("experience_id", experienceId)
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const {
      data: storiesData
    } = await supabase
      .from("stories")
      .select("id, created_at")
      .eq("user_id", user!.id)
      .eq("experience_id", experienceId);

    return res.status(200).json({ data: { ...queryData, stories: storiesData } });
  } catch (err: any) {
    return res.status(500).json({
      error: err.message ||
        "An error has occurred while retrieving the challenge information."
    });
  }

};

// Workaround to enable Swagger on production 
export const swaggerExpVisitsGet = {
  index: 17,
  text:
`"/api/v1/experiences/visits": {
    "get": {
      "tags": ["visits"],
      "summary": "Get visit information for a user by experience ID.",
      "description": "Retrieve visit information for a user by experience ID.",
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "parameters": [
        {
          "in": "query",
          "name": "experience-id",
          "schema": {
            "type": "string",
          },
          "required": true,
          "description": "The ID of the experience to retrieve the visit"
        }
      ],
      "responses": {
        "200": {
          "description": "Visit information retrieved successfully",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["data"],
                "properties": {
                  "data": {
                    "type": "object",
                    "required": ["created_at", "experience_id"],
                    "properties": {
                      "created_at": {
                        "type": "string",
                        "format": "date-time",
                        "example": "2024-04-08T10:00:00Z"
                      },
                      "experience_id": {
                        "type": "string",
                        "example": "123e4567-e89b-12d3-a456-426614174000"
                      },
                      "stories": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "required": ["id", "created_at"],
                          "properties": {
                            "id": {
                              "type": "string",
                            },
                            "created_at": {
                              "type": "string",
                              "format": "date-time",
                              "example": "2024-04-08T10:00:00Z"
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
          "description": "Bad request",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["error"],
                "properties": {
                  "error": {
                    "type": "string",
                    "example": "Invalid experience ID"
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
                "required": ["error"],
                "properties": {
                  "error": {
                    "type": "string",
                    "example": "Method not allowed!"
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
                "required": ["error"],
                "properties": {
                  "error": {
                    "type": "string",
                    "example": "An error has occurred while retrieving the challenge information."
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

