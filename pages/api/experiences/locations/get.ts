import { createApiClient } from "@/libs/supabase/supabaseApi";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed!" });
  }

  const experience_id = req.query["experience-id"];
  // Extract authorization token
  const token = req.headers.authorization?.split(" ")[1];
  // Create Supabase client
  const supabase = createApiClient(token);

  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  const { data: userData, error: userError } = await supabase
    .from("businessprofiles")
    .select("type")
    .eq("businessid", user!.id)
    .single();

  try {
    const {
      data: queryData,
      error
    } = await supabase
      .from("locations")
      .select("*")
      .eq("experience_id", experience_id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ data: queryData });
  } catch (err: any) {
    return res.status(500).json({
      error: err.message ||
        "An error has occurred while retrieving the challenge information."
    });
  }

};

// Workaround to enable Swagger on production 
export const swaggerLocationGet = {
  index: 16,
  text:
    `"/api/v1/experiences/locations": {
      "get": {
        "tags": ["experience"],
        "summary": "Get a location by destination ID",
        "description": "Retrieve a location by destination ID.",
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
            "description": "The ID of the destination to retrieve attractions for"
          }
        ],
        "responses": {
          "200": {
            "description": "Attractions retrieved successfully",
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
                          "id": { "type": "string" },
                          "experience_id": { "type": "string" },
                          "title": { "type": "string" },
                          "primary_photo": { "type": "string" },
                          "photos": {
                            "type": "array",
                            "items": { "type": "string" }
                          },
                          "hours": { "type": "string" },
                          "status": { "type": "string" },
                          "attraction_info": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "description": { "type": "string" },
                                "description_thumbnail": { "type": "string" }
                              }
                            }
                          },
                          "description": { "type": "string" },
                          "description_thumbnail": { "type": "string" },
                          "url_slug": { "type": "string" },
                          "primary_keyword": { "type": "string" },
                          "address": { "type": "string" },
                          "order_of_appearance": { "type": "number" },
                          "primary_photo_id": { "type": "string" }
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
                    "error": { "type": "string" }
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
                    "message": { "type": "string" }
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
                    "error": { "type": "string" }
                  }
                }
              }
            }
          }
        }
      }
    }`
}