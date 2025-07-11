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
        const { 'user-id': user_id, 'company': company } = req.query;

        const token = req.headers.authorization?.split(' ')[1];
        const supabase = createApiClient(token);

        const {
             data: { user },
        } = await supabase.auth.getUser(token);

        const { 
            data: userData, 
            error: userError 
        } = await supabase
          .from("businessprofiles")
          .select(`
            *,
            company_members(role,company_accounts(id,name))
          `)
          .eq("businessid", user_id || user?.id)
          .is('company_members.is_deleted', false)
          .single();

        if (userError) {
            return res.status(400).json({
                success: false,
                error: userError.message
            });
        }

        const isPartOf = userData?.company_members?.map((item) => (
          {
            ...item.company_accounts, role: item.role
          }
        )).filter(item => item !== undefined && item.name === company);

        const {company_members, ...userProfile} = userData;

        console.log(company_members);

        return res.status(200).json({
            data: {...userProfile, companies: isPartOf},
            success: true,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error: ' + error
        });
    }
}

// Workaround to enable Swagger on production 
export const swaggerBusinessProfileGet = {
  index:9, 
  text:
`"/api/v1/profile/business": {
    "get": {
      "tags": ["B2B-profile"],
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