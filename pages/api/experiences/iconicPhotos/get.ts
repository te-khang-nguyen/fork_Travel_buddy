import { createApiClient } from "@/libs/supabase/supabaseApi";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.status(405).send({ message: 'Only GET requests allowed' })
    return
  }

  // Extract authorization token
  const token = req.headers.authorization?.split(" ")[1];
  // Create Supabase client
  const supabase = createApiClient(token!);

  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  const { data: userData, error: userError } = await supabase
    .from("businessprofiles")
    .select("type")
    .eq("businessid", user!.id)
    .single();


  try {
    const experience_id = req.query["experience-id"];
    const query = supabase
      .from('experience_details')
      .select('*, media_assets ( url )')
      .eq('experience_id', experience_id)
      .eq('type', 'iconic_photos')

    const { data, error } = await query;
    let transformedData;
    if (error) {
      console.error("Supabase Error:", error);
    } else {
      // Transform data to move 'url' out of 'media_assets'
      transformedData = data.map(({ media_assets, ...item }) => ({
        ...item,
        url: media_assets?.url || null, // Extract URL
      }));

      // console.log("Transformed Data:", transformedData);
    }

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json({ data: transformedData });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "An error has occurred while retrieving the challenge information." });
  }
}

// Workaround to enable Swagger on production 
export const swaggerExpIconicPhotosGet = {
  index: 17,
  text:
    `"/api/v1/experiences/iconicPhotos": {
      "get": {
        "tags": ["experience"],
        "summary": "Get iconic photos by destination ID",
        "description": "Retrieve iconic photos by destination ID.",
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
            "description": "The ID of the destination to retrieve iconic photos for"
          }
        ],
        "responses": {
          "200": {
            "description": "Iconic photos retrieved successfully",
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
                          "type": { "type": "string" },
                          "name": { "type": "string" },
                          "text": { "type": "string" },
                          "created_at": { "type": "string" },
                          "updated_at": { "type": "string" },
                          "media_id": { "type": "string" },
                          "url": { "type": "string" }
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