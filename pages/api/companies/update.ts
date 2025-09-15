import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const token = req.headers.authorization?.split(' ')[1];
    const supabase = createApiClient(token!);

    const company_id = req.query["company-id"];
    const { name, description, owner_id } = req.body;

    if (!company_id) {
        return res.status(400).json({ error: 'Company ID is required' });
    }

    if (!name) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const { data: companyData, error: companyError } = await supabase
            .from('company_accounts')
            .select('*')
            .eq('id', company_id)
            .single();

        if (companyError || !companyData) {
            return res.status(404).json({ error: 'Company not found' });
        }

        if(owner_id){
            const { data: ownerData, error: ownerError } = await supabase
                .from('businessprofiles')
                .select('*')
                .eq('id', owner_id)
                .single();

            if(ownerError || !ownerData){
                return res.status(404).json({ error: 'Owner not found' });
            }
        }

        const { data, error } = await supabase
            .from('company_accounts')
            .update({
                name,
                description,
                owned_by: owner_id
            })
            .select('*')
            .single();

        if(error){
            return res.status(500).json({ error: error });
        }

        return res.status(201).json({ data });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}


//
// Workaround to enable Swagger on production
export const swaggerBussExpCreateEditor = {
    index: 13,
    text: `"/api/v1/companies/": {
      "put": {
        "tags": ["B2B-experience-client"],
        "summary": "Update a company",
        "description": "Update a company.",
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
            "description": "The ID of the company to update"
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
                    "description": "The name of the company"
                  },
                  "description": {
                    "type": "string",
                    "description": "The description of the company"
                  },
                  "owner_id": {
                    "type": "string",
                    "description": "The ID of the owner"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Company created successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "object",
                      "properties": {
                        "id": { "type": "string" },
                        "created_by": { "type": "string" },
                        "name": { "type": "string" },
                        "description": { "type": "string" },
                        "created_at": { "type": "string" },
                        "updated_at": { "type": "string" },
                        "owned_by": { "type": "string" },
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

