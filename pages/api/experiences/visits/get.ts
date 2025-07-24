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
  const supabase = createApiClient(token!);

  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  try {
    const {
      data: queryData,
    } = await supabase
      .from("visits")
      .select("is_visited")
      .eq("user_id", user!.id)
      .eq("experience_id", experienceId)
      .single();

    return res.status(200).json({ 
      data: { 
        is_visited: queryData || queryData!.is_visited 
                    ? true : false,
      }
    });
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
      "description": "Retrieve visit information for a user by experience ID. Can return null if user data has not been found, return true if user has selected visit button, return false if user has deselected visit button",
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
            "type": "string"
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
                "properties": {
                  "data": {
                    "type": "object",
                    "properties": {
                      "is_visited": {
                        "type": "boolean"
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

