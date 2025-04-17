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
  const supabase = createApiClient(token);

  const [filter] = Object.values(req.query);

  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  try {
    const {
      data: queryData,
      error
    } = await supabase
      .from("visits")
      .select("created_at, experience_id, is_visited")
      .eq("user_id", user!.id);

    const {
      data: storiesData,
    } = await supabase
      .from("stories")
      .select("experience_id")
      .eq("user_id", user!.id);

    const nonStoryFilter = queryData?.filter(
      (visit)=> !storiesData?.find((e) => e.experience_id === visit.experience_id)
    );

    const withStoryFilter = queryData?.filter(
      (visit)=> storiesData?.find((e) => e.experience_id === visit.experience_id)
    );

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ data: filter==="with-story"? withStoryFilter : nonStoryFilter  });
  } catch (err: any) {
    return res.status(500).json({
      error: err.message ||
        "An error has occurred while retrieving the challenge information."
    });
  }

};

// Workaround to enable Swagger on production 
export const swaggerExpVisitsFilterGet = {
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
      "parameters": [
        {
          "in": "query",
          "name": "filter",
          "schema": {
            "type": "string",
            "example": "without-story",
            "enum": ["with-story", "without-story"]
          },
          "required": true,
          "description": "The filter condition. Can only be 'with-story' or 'without-story'"
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
                        "created_at": {
                          "type": "string",
                          "format": "date-time"
                        },
                        "experience_id": {
                          "type": "string",
                          "format": "uuid"
                        },
                        "is_visited": {
                          "type": "boolean"
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