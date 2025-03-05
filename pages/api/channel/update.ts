import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '4.5mb', // Increase the body size limit (e.g., 5MB)
        },
    },
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "PUT") {
        return res.status(405).json({ error: "Method not allowed!" });
    }

    const channel_id = req.query?.["channel-id"];
    const updatedData = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    const supabase = createApiClient(token);

    try {
        const {
            data: storyData,
            error: storyErr
        } = await supabase
            .from('channels')
            .update(updatedData)
            .eq("id", channel_id)
            .select()
            .single();

        if (storyErr) {
            return res.status(400).json({ error: storyErr.message });
        }

        return res.status(200).json({ data: storyData });

    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while updating location." });
    }

};


export const swaggerChannelUpdate = {
  index:10, 
  text:
`"/api/v1/channel  ": {
      "put": {
        "tags": ["channel"],
        "summary": "Update a channel",
        "description": "Update the details of an existing channel.",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "in": "query",
            "name": "channel-id",
            "schema": {
              "type": "string"
            },
            "required": true,
            "description": "The ID of the channel to update"
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
                    "description": "Name of the channel"
                  },
                  "channel_type": {
                    "type": "string",
                    "description": "Type of the channel"
                  },
                  "url": {
                    "type": "string",
                    "description": "URL of the channel"
                  },
                  "brand_voice": {
                    "type": "string",
                    "description": "Brand voice of the channel"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Channel updated successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "object",
                      "properties": {
                        "id": { "type": "string" },
                        "user_id": { "type": "string" },
                        "name": { "type": "string" },
                        "channel_type": { "type": "string" },
                        "url": { "type": "string" },
                        "brand_voice": { "type": "string" },
                        "created_at": { "type": "string" },
                        "updated_at": { "type": "string" }
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
                    "error": { "type": "string" }
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