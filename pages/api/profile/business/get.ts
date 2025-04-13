import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";
import { BusinessProfile } from "@/libs/services/business/profile";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        res.status(405).send({ message: 'Only GET requests allowed' })
        return
    }

    try {
        const { user_id } = req.query;

        const token = req.headers.authorization?.split(' ')[1];
        const supabase = createApiClient(token);

        const {
             data: { user },
        } = await supabase.auth.getUser(token);

        const { 
            data : userData, 
            error : userError 
        } = await supabase
        .from("businessprofiles")
        .select("*")
        .eq("businessid", user?.id)
        .single();

        if (userError) {
            return res.status(400).json({
                success: false,
                error: userError.message
            });
        }

        return res.status(200).json({
            data: userData,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

// Workaround to enable Swagger on production 
export const swaggerBusinessProfileGet = {
  index:9, 
  text:
`"/api/v1/profile/business": {
    "get": {
      "tags": ["profile"],
      "summary": "Retrieve a business profile by ID",
      "description": "Retrieve the profile of a B2B user.",
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "responses": {
        "200": {
          "description": "Business profile retrieved successfully",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "data": {
                    "type": "object",
                    "properties": {
                        "businessid": { "type": "string" },
                        "businessname": { "type": "string" },
                        "email": { "type": "string" },
                        "phone": { "type": "string" },
                        "address": { "type": "string" },
                        "website": { "type": "string" },
                        "type": { "type": "string" },
                        "created_at": { "type": "string" },
                        "updated_at": { "type": "string" },
                        "status": { "type": "string" },
                        "logo_id": { "type": "string" },
                        "editors": {
                          "type": "array",
                          "items": { "type": "string" }
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