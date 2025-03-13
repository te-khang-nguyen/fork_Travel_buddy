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
        const token = req.headers.authorization?.split(' ')[1];
        const supabase = createApiClient(token);

        const {
            data: { user },
        } = await supabase.auth.getUser(token);

        const { data : userData, error : userError } = await supabase
        .from("businessprofiles")
        .select("type")
            .eq("businessid", user?.id)
        .single();

        if (userError || !userData) {
            console.error('Error fetching user type:', userError);
            return [];
        }
        const userType = userData.type;

        let query;
        if (userType === "SUPER_ADMIN") {
            query = supabase.from("businessprofiles").select("*");
        } else {
            query = supabase.from("businessprofiles")
                            .select("*")
                            .or(`businessid.eq.${user?.id},editors.cs.{${user?.id}}`);
        }

        const { data, error } = await query;

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        return res.status(200).json({
            data,
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
export const swaggerBusinessProfileGetAll = {
    index: 9,
    text:
`"/api/v1/profile/business/get-all": {
    "get": {
      "tags": ["profile"],
      "summary": "Get all business profiles",
      "description": "Retrieve all business profiles.",
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "responses": {
        "200": {
          "description": "Business profiles retrieved successfully",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": true
                  },
                  "data": {
                    "type": "array",
                    "items": {
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
          }
        },
        "400": {
          "description": "Bad request",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": { "type": "boolean" },
                  "error": { "type": "string" }
                }
              }
            }
          }
        },
        "401": {
          "description": "Unauthorized - Invalid or missing authentication token",
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
                  "success": { "type": "boolean" },
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