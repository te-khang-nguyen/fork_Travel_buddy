import { supabase } from "@/libs/supabase/supabase_client";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * @swagger
 * /api/auth/business/login:
 *   post:
 *     tags:
 *       - auth/business
 *     summary: Business login
 *     description: Authenticate a business user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the business user
 *               password:
 *                 type: string
 *                 description: The password for the business user account
 *     responses:
 *       200:
 *         description: Successfully authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                 userId:
 *                   type: string
 *       400:
 *         description: Bad request
 *       405:
 *         description: Method not allowed
 *       500:
 *         description: Internal server error
 */

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
            data: { user, session },
            error,
        } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        if (!session) {
            return res.status(400).json({ error: "Failed to authenticate user!" });
        }

        const { data: profileData, error: profileError } = await supabase
            .from("profile")
            .select("*")
            .eq("business_id", user!.id);

        if (profileError) {
            return res.status(400).json({ error: "No access!" });
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


export const swaggerBussLogin = 
    `"/api/v1/auth/business/login": {
      "post": {
        "tags": ["auth/business"],
        "summary": "Business login",
        "description": "Authenticate a business user.",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "email": {
                    "type": "string",
                    "description": "The email of the business user"
                  },
                  "password": {
                    "type": "string",
                    "description": "The password for the business user account"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successfully authenticated",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "access_token": {
                      "type": "string"
                    },
                    "userId": {
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