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

    try {
        const { data: companyData, error: companyError } = await supabase
            .from('company_accounts')
            .select('*, company_members(member_id,role,created_at,businessprofiles(username,email,businessname))')
            .is('is_deleted', false)
            .eq('company_members.role', 'admin')
            .order('created_at', { referencedTable: 'company_members', ascending: false })
            .order('role', { referencedTable: 'company_members', ascending: false })

        if (companyError || !companyData) {
            return res.status(404).json({ error: 'Company not found' });
        }

        const companyAdminPairs = companyData.map((company: any) => {
          const companyAdmins = company.company_members.map((member: any) => ({
            id: member.member_id,
            role: member.role,
            username: member.businessprofiles?.username,
            email: member.businessprofiles?.email,
            businessname: member.businessprofiles?.businessname,
            created_at: member.created_at
          }));
          return { ...company, admins: companyAdmins };
        });

        return res.status(201).json({ data: companyAdminPairs });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}


//
// Workaround to enable Swagger on production
export const swaggerBussExpCreateEditor = {
    index: 13,
    text: `"/api/v1/companies/editors/create": {
      "post": {
        "tags": ["B2B-experience"],
        "summary": "Create a new editor for a company",
        "description": "Add a new editor to a company account.",
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
                  "companyId": {
                    "type": "string",
                    "description": "The ID of the company to which the editor will be added"
                  },
                  "editorEmail": {
                    "type": "string",
                    "description": "The email of the editor to be added"
                  }
                },
                "required": ["companyId", "editorEmail"]
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Editor created successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "object",
                      "properties": {
                        "id": { "type": "string" },
                        "editors": {
                          "type": "array",
                          "items": { "type": "string" }
                        },
                        "created_by": { "type": "string" },
                        "name": { "type": "string" },
                        "primary_photo": { "type": "string" },
                        "photos": {
                          "type": "array",
                          "items": { "type": "string" }
                        },
                        "address": { "type": "string" },
                        "status": { "type": "string" },
                        "created_at": { "type": "string" },
                        "updated_at": { "type": "string" },
                        "primary_keyword": { "type": "string" },
                        "url_slug": { "type": "string" },
                        "description": { "type": "string" },
                        "thumbnail_description": { "type": "string" },
                        "primary_video": { "type": "string" },
                        "parent_destination": { "type": "string" }
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
          "404": {
            "description": "Company not found",
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
    }
}`,
}

