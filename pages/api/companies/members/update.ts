import { createApiClient } from "@/libs/supabase/supabaseApi";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1];
  const supabase = createApiClient(token!);

  const { 'company-id': companyId, role, 'member-id': memberId } = req.body;

  if (!companyId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { data, error } = await supabase
      .from('company_members')
      .update({
        role
      })
      .eq('member_id', memberId)
      .eq('company_id', companyId)
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ data });

  } catch (error) {
    return res.status(500).json({ error: error });
  }
}


// Workaround to enable Swagger on production
export const swaggerBussExpCreateEditor = {
  index: 13,
  text: `"/api/v1/companies/members/": {
    "post": {
      "tags": ["B2B-experience-client-member"],
      "summary": "Create a new member for a company",
      "description": "Add a new member to a company account.",
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
                  "description": "The ID of the company to which the member will be added"
                },
                "emails": {
                  "type": "array",
                  "items": { "type": "string" },
                  "description": "The emails of the members to be added"
                }
              },
              "required": ["companyId", "emails"]
            }
          }
        }
      },
      "responses": {
        "201": {
          "description": "Member created successfully",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "data": {
                    "type": "array",
                    "items": {
                      "type": "object"
                      "properties": {
                        "id": { "type": "string" },
                        "member_id": { "type": "string" },
                        "role": { "type": "string" },
                        "created_at": { "type": "string" },
                        "updated_at": { "type": "string" },
                        "company_id": { "type": "string" },
                        "is_deleted": { "type": "boolean" }
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

