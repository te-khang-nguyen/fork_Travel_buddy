import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/libs/supabase/supabase_client";


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'PUT') {
        res.status(405).send({ message: 'Only PUT requests allowed' });
        return;
    }

    const { role } = req.query;
    const avatar = req.body?.["avatar-url"];

    const token = req.headers.authorization?.split(' ')[1];

    const {
        data: { user },
    } = await supabase.auth.getUser(token);

    try {
      const toMediaAssets = {
        user_id: user!.id,
        url: avatar,
        usage: "avatar",
        mime_type: "image/jpeg"
      }

      const {
        data: mediaData,
        error: mediaErr
      } = await supabase.from("media_assets")
        .insert(toMediaAssets)
        .select()
        .single();
      
      if (mediaErr) {
        return res.status(400).json({ error: mediaErr.message });
      }

      const {
          data: updateData, 
          error: updateError
      } = await supabase.from(`${role}profiles`)
                    .update({
                      avatar_id: mediaData?.id
                    })
                    .eq(`${role}id`, user!.id)
                    .select()
                    .single();

        if (updateError) {
            return res.status(400).json({ error: updateError });
        }

        return res.status(200).json({ data: updateData.avatar_id });
    } catch (err: any) {
        return res.status(500).json({ 
            error: err.message || "An error occurred while updating user profile"
        });
    }
}

// Workaround to enable Swagger on production 
export const swaggerProfileAvatarUpdate = {
    index:9, 
    text:
`"/api/v1/profile/avatar": {
    "put": {
      "tags": ["profile"],
      "summary": "Update user profile",
      "description": "Update the profile of a user based on their role.",
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "parameters": [
        {
          "in": "query",
          "name": "role",
          "schema": {
            "type": "string"
          },
          "required": true,
          "description": "The role of the user (e.g., 'business', 'user')"
        }
      ],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "avatar-url": {
                  "type": "string",
                  "description": "The URL of the new avatar image"
                }
              }
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "User profile updated successfully",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "data": {
                    "type": "string",
                    "description": "The ID of the updated avatar"
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