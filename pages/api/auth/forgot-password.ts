import { supabase } from "@/libs/supabase/supabase_client";
import { NextApiRequest, NextApiResponse } from "next";

const baseUrl = process.env.NODE_ENV === 'production' ? 
process.env.NEXT_PUBLIC_BASE_URL
: 'http://localhost:3000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, redirect_url } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required!" });
  }

  try {
    const { 
      error: authError 
    } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirect_url ?? `${baseUrl}/auth/reset-password`,
    });
    
    if (authError) {
      console.log(authError);
      return res.status(400).json({ error: authError?.message || "An unknown error occurred." });
    }

    return res.status(200).json({ 
      message: "Email sent successfully!",
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "An unknown error occurred." });
  }
}


// Workaround to enable Swagger on production 
export const swaggerUserResetPassword = {
  index:1, 
  text:
  `"/api/v1/auth/reset-password": {
    "post": {
      "tags": ["auth (for Web App)"],
      "summary": "Sign up a new user",
      "description": "Create a new user account.",
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "firstName": {
                  "type": "string",
                  "description": "The first name of the user"
                },
                "lastName": {
                  "type": "string",
                  "description": "The last name of the user"
                },
                "email": {
                  "type": "string",
                  "description": "The email of the user"
                },
                "phone": {
                  "type": "string",
                  "description": "The phone number of the user"
                },
                "password": {
                  "type": "string",
                  "description": "The password for the user account"
                }
              }
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "User created successfully",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "message": {
                    "type": "string"
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
