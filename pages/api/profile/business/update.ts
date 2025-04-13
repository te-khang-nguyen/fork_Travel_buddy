import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";
import { BusinessProfile } from "@/libs/services/business/profile";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'PUT') {
        res.status(405).send({ message: 'Only PUT requests allowed' });
        return;
    }

    const token = req.headers.authorization?.split(' ')[1];
    const supabase = createApiClient(token);
    const {
        data: { user },
    } = await supabase.auth.getUser(token);

    const data = req.body;

    if (!user?.id) {
        return res.status(400).json({ error: "User ID is required" });
    }

    try {
        const {
            data: updateData, 
            error: updateError
        } = await supabase.from('businessprofiles')
                    .update({
                        ...data 
                    })
                .eq('businessid', user?.id)
                    .select("id");

        if (updateError) {
            return res.status(400).json({ error: updateError });
        }
        if (!updateData || updateData.length === 0) {
          return res.status(403).json({ success: false, message: "Unauthorized or challenge not found" });
        }
        return res.status(200).json({ success: true, message: "User updated successfully", data: updateData });
    } catch (err: any) {
        return res.status(500).json({ 
            error: err.message || "An error occurred while updating the challenge" 
        });
    }
}


// Workaround to enable Swagger on production 
export const swaggerBusinessProfileUpdate = {
    index:9, 
    text:
`"/api/v1/profile/business/": {
    "put": {
      "tags": ["profile"],
      "summary": "Update a B2B profile",
      "description": "Update the profile of a B2B user.",
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
      },
      "responses": {
        "200": {
          "description": "B2B profile updated successfully",
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