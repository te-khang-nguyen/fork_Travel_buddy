import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/libs/supabase/supabase_client";


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        res.status(405).send({ message: 'Method not allowed' });
        return;
    }

    const { role } = req.query;
    const payload = req.body;

    const token = req.headers.authorization?.split(' ')[1];

    const {
        data: { user },
    } = await supabase.auth.getUser(token);

    const lastSignInAt = new Date(user?.last_sign_in_at ?? "");
    const lastSignInAtString = lastSignInAt.toISOString().split(".")[0];
    const createdAt = new Date(user?.created_at ?? "");
    const createdAtString = createdAt.toISOString().split(".")[0];
    const firstTime = (createdAtString === lastSignInAtString) 
      || (lastSignInAt.valueOf() - createdAt.valueOf() < 5000);

    try {
        if ("email" in Object.keys(payload)) {
          const { data, error: authUpdateError } = await supabase.auth.updateUser({
            email: payload?.email
          })

          if (authUpdateError){
            return res.status(400).json({ error: authUpdateError });
          }
        }

        const finalRole = role === "user" || !role ? "user" : "business";

        const {
            data: updateData, 
            error: updateError
        } = await supabase.from(`${finalRole}profiles`)
                    .insert({
                        [`${finalRole}id`]: user!.id,
                        email: payload?.email ?? user?.email,
                        ...payload
                    })
                    .select()
                    .single();

        if (updateError) {
            return res.status(400).json({ error: updateError });
        }

        return res.status(200).json({ data: {...updateData, first_time: firstTime} });
    } catch (err: any) {
        return res.status(500).json({ 
            error: err.message || "An error occurred while updating user profile"
        });
    }
}

// Workaround to enable Swagger on production 
export const swaggerProfileCreate = {
    index:8, 
    text:
`"/api/v1/profile/ ": {
    "post": {
      "tags": ["profile"],
      "summary": "Create a user profile",
      "description": "Create a new profile of a auth user.",
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
          "description": "The role of the user ('business' for B2B profiles, 'user'/empty for Traveler profiles)"
        }
      ],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "username": { "type": "string" },
                "email": { "type": "string" },
                "firstname": { "type": "string" },
                "lastname": { "type": "string" },
                "preferences": { "type": "string" },
                "facebook": { "type": "string" },
                "instagram": { "type": "string" },
                "x": { "type": "string" },
                "phone": { "type": "string" }
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
                      },
                      "first_time": {
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