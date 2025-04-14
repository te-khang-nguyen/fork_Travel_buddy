import { supabase } from "@/libs/supabase/supabase_client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required!" });
  }

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!session) {
      return res.status(400).json({ error: "Failed to authenticate user." });
    }

    return res
      .status(200)
      .json({ access_token: session.access_token, userId: session.user.id });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Login failed due to an unknown error." });
  }
}


// Workaround to enable Swagger on production 
export const swaggerUserLogin ={
  index:2, 
  text:
  `"/api/v1/auth/login": {
    "post": {
      "tags": ["auth (for Web App)"],
      "summary": "User Login",
      "description": "Authenticate user with email and password",
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "email": {
                  "type": "string"
                },
                "password": {
                  "type": "string"
                }
              }
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Successful login"
        },
        "400": {
          "description": "Invalid credentials"
        },
        "500": {
          "description": "Server error"
        }
      }
    }
  }`
}
