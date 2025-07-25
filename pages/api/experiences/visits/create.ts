import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(405).send({ message: 'Only POST requests allowed' })
    return
  }

  try {
    const token = req.headers.authorization?.split(' ')[1];
    const supabase = createApiClient(token!);

    const { data: { user } } = await supabase.auth.getUser(token);

    const [experience_id] = Object.values(req.body);

    const { data: visitData } = await supabase
      .from("visits")
      .select('*')
      .eq("user_id", user!.id)
      .eq("experience_id", experience_id)
      .single();

    if (!visitData) {
      const { data, error } = await supabase
        .from("visits")
        .insert({
          experience_id,
          user_id: user!.id,
          is_visited: true,
        })
        .select("*")
        .single();

        if (error) {
          return res.status(400).json({
            error: error.message
          });
        }
  
        return res.status(200).json({
          data: data
        });
    } else {
      const { data, error } = await supabase
        .from("visits")
        .update({
          is_visited: !visitData.is_visited,
        })
        .eq("id", visitData.id)
        .select("*")
        .single();

      if (error) {
        return res.status(400).json({
          error: error.message
        });
      }

      return res.status(200).json({
        data: data
      });
    }

  } catch (error: any) {
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}

// Workaround to enable Swagger on production 
export const swaggerExpVisitsCreate = {
  index: 17,
  text:
    `"/api/v1/experiences/visits/": {
    "post": {
      "tags": ["visits"],
      "summary": "Store user's visits to an experience.",
      "description": "Store user's visits to an experience.",
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
                "experience-id": {
                  "type": "string"
                }
              }
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Visit stored successfully",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "data": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "integer"
                      },
                      "user_id": {
                        "type": "string"
                      },
                      "experience_id": {
                        "type": "string"
                      },
                      "created_at": {
                        "type": "string"
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
        },
        "400": {
          "description": "Bad request",
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