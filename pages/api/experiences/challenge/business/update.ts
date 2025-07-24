import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'PUT') {
        res.status(405).send({ message: 'Only PUT requests allowed' });
        return;
    }

    const token = req.headers.authorization?.split(' ')[1];
    const supabase = createApiClient(token!);

    const { challenge_id } = req.query;
    const data = req.body;

    if (!challenge_id) {
        return res.status(400).json({ error: "Challenge ID is required" });
    }

    try {
        const {
            data: updateData, 
            error: updateError
        } = await supabase.from('challenges')
                    .update({
                        ...data 
                    })
                    .eq('id', challenge_id)
                    .select("id");

        if (updateError) {
            return res.status(400).json({ error: updateError });
        }
        if (!updateData || updateData.length === 0) {
          return res.status(403).json({ success: false, message: "Unauthorized or challenge not found" });
        }
        return res.status(200).json({ success: true, message: "Challenge updated successfully", data: updateData });
    } catch (err: any) {
        return res.status(500).json({ 
            error: err.message || "An error occurred while updating the challenge" 
        });
    }
}

// Workaround to enable Swagger on production 
// Workaround to enable Swagger on production 
export const swaggerBussChallengeUpdate = {
  index:46, 
  text:
`"/api/v1/challenge/business/": {
      "put": {
        "tags": ["challenge/business (mock interface)"],
        "summary": "Update a challenge",
        "description": "Update the details of an existing challenge.",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "in": "query",
            "name": "challenge-id",
            "schema": {
              "type": "string"
            },
            "required": true,
            "description": "The ID of the challenge to update"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "name": {
                    "type": "string",
                    "description": "Name of the challenge",
                    "example": "Mountain Hiking Adventure"
                  },
                  "description": {
                    "type": "string",
                    "description": "Detailed description of the challenge",
                    "example": "Explore breathtaking mountain trails and scenic landscapes"
                  },
                  "reward_description": {
                    "type": "string"
                  },
                  "max_rewards": {
                    "type": "string"
                  },
                  "media": {
                    "type": "string",
                    "description": "URL of the challenge thumbnail image",
                    "example": "https://example.com/mountain-challenge-thumb.jpg"
                  },
                  "created_at": {
                    "type": "string"
                  },
                  "start_date": {
                    "type": "string"
                  },
                  "end_date": {
                    "type": "string"
                  },
                  "status": {
                    "type": "string"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Challenge updated successfully",
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
                        "business_id": {
                          "type": "string"
                        },
                        "description": {
                          "type": "string"
                        },
                        "thumbnailUrl": {
                          "type": "string"
                        },
                        "backgroundUrl": {
                          "type": "string"
                        },
                        "created": {
                          "type": "string"
                        },
                        "title": {
                          "type": "string"
                        },
                        "tourSchedule": {
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