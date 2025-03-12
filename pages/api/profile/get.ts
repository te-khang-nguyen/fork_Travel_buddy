import { supabase } from "@/libs/supabase/supabase_client";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed!" });
    }

    const { role } = req.query;

    const token = req.headers.authorization?.split(' ')[1];

    const {
        data: { user },
    } = await supabase.auth.getUser(token);

    try {
        const { data: profileData, error } = await supabase
            .from(`${role}profiles`)
            .select('*, media_assets(url)')
            .eq(`${role}id`, user!.id)
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ data: profileData });
    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while retrieving the user profile." });
    }

};

// Workaround to enable Swagger on production 
export const swaggerProfileGetAll = {
  index:8, 
  text:
`"/api/v1/profile": {
    "get": {
      "tags": ["profile"],
      "summary": "Retrieve user profile",
      "description": "Retrieve the profile of a user based on their role.",
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
      "responses": {
        "200": {
          "description": "User profile retrieved successfully",
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
                      "role": {
                        "type": "string"
                      },
                      "created_at": {
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