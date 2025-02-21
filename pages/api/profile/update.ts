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
    const payload = req.body;

    const token = req.headers.authorization?.split(' ')[1];

    const {
        data: { user },
    } = await supabase.auth.getUser(token);

    try {
        const {
            data: updateData, 
            error: updateError
        } = await supabase.from(`${role}profiles`)
                    .update({
                        ...payload
                    })
                    .eq(`${role}id`, user!.id)
                    .select();

        if (updateError) {
            return res.status(400).json({ error: updateError });
        }

        return res.status(200).json({ data: updateData });
    } catch (err: any) {
        return res.status(500).json({ 
            error: err.message || "An error occurred while updating user profile"
        });
    }
}

export const swaggerProfileUpdate = {
    index:9, 
    text:
`"/api/v1/profile ": {
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
                "name": {
                  "type": "string",
                  "description": "The name of the user"
                },
                "email": {
                  "type": "string",
                  "description": "The email of the user"
                },
                "phone": {
                  "type": "string",
                  "description": "The phone number of the user"
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
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "string"
                      },
                      "name": {
                        "type": "string"
                      },
                      "email": {
                        "type": "string"
                      },
                      "phone": {
                        "type": "string"
                      },
                      "role": {
                        "type": "string"
                      },
                      "updated_at": {
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