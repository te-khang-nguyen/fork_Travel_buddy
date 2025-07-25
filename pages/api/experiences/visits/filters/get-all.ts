import { createApiClient } from "@/libs/supabase/supabaseApi";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed!" });
  }
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
      error
    } = await supabase
      .from("visits")
      .select("experience_id")
      .eq("user_id", user!.id);

    const {
      data: storiesData,
    } = await supabase
      .from("stories")
      .select("experience_id")
      .eq("user_id", user!.id);

    const withStoryFilter = queryData?.filter(
      (visit)=> storiesData?.find((e) => e.experience_id === visit.experience_id)
    );

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ data: withStoryFilter });
  } catch (err: any) {
    return res.status(500).json({
      error: err.message ||
        "An error has occurred while retrieving the challenge information."
    });
  }

};

// Workaround to enable Swagger on production 
export const swaggerExpCompletionGetAll = {
  index: 17,
  text:
`"/api/v1/experiences/visits/filters": {
    "get": {
      "tags": ["visits"],
      "summary": "Get visit information for a user by experience ID.",
      "description": "Retrieve visit information for a user by experience ID.",
      "security": [
        {
          "bearerAuth": []
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
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "experience_id": {
                          "type": "string",
                          "format": "uuid"
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
                "required": ["message"],
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
                "required": ["error"],
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