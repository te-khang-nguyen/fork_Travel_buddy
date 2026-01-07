import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const token = req.headers.authorization?.split(' ')[1];
    const supabase = createApiClient(token!);

    const companyId = req.query["company-id"];

    if (!companyId) {
        return res.status(400).json({ error: 'Company ID is required' });
    }

    try {
        const { 
            data: queryData, 
            error 
        } = await supabase
            .from("company_accounts")
            .select(`
                id,name,created_at,
                description,
                business_owner:businessprofiles!company_accounts_owned_by_fkey(businessid,username,created),
                banner:media_assets!company_accounts_banner_media_id_fkey(url),
                logo:media_assets!company_accounts_logo_id_fkey(url)
            `)
            .eq('id', companyId)
            .is('is_deleted', false)
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ data: queryData });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "An error has occurred while retrieving the company information.";
        return res.status(500).json({ error: errorMessage });
    }
}


//
// Workaround to enable Swagger on production
export const swaggerBussExpGetCompany = {
    index: 15,
    text: `"/api/v1/companies": {
      "get": {
        "tags": ["B2B-experience-client"],
        "summary": "Get a company by ID",
        "description": "Retrieve a single company by ID with business owner, banner, and logo information.",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "in": "query",
            "name": "company-id",
            "schema": {
              "type": "string"
            },
            "required": true,
            "description": "The ID of the company to retrieve"
          }
        ],
        "responses": {
          "200": {
            "description": "Company retrieved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "object",
                      "properties": {
                        "id": { "type": "string", "description": "Company ID" },
                        "name": { "type": "string", "description": "Company name" },
                        "created_at": { "type": "string", "format": "date-time", "description": "Creation timestamp" },
                        "description": { "type": "string", "description": "Company description" },
                        "business_owner": {
                          "type": "object",
                          "properties": {
                            "businessid": { "type": "string", "description": "Business profile ID" },
                            "username": { "type": "string", "description": "Owner username" },
                            "created": { "type": "string", "format": "date-time", "description": "Owner creation timestamp" }
                          }
                        },
                        "banner": {
                          "type": "object",
                          "properties": {
                            "url": { "type": "string", "description": "Banner image URL" }
                          }
                        },
                        "logo": {
                          "type": "object",
                          "properties": {
                            "url": { "type": "string", "description": "Logo image URL" }
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
                    "error": { "type": "string" }
                  }
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized",
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
    }
}`,
};