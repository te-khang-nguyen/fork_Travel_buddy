import { NextApiRequest, NextApiResponse } from "next";
import { Provider } from "@supabase/supabase-js";
import { baseUrl } from "@/app/constant";
import { supabase } from "@/libs/supabase/supabase_client";

/**
 * @swagger
 * /api/auth/oauth:
 *   post:
 *     tags:
 *       - auth
 *     summary: Sign in with OAuth
 *     description: Sign in a user using OAuth provider.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               provider:
 *                 type: string
 *                 description: The OAuth provider
 *     responses:
 *       200:
 *         description: Successfully signed in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                    provider: 
 *                     type: string
 *                     description: The OAuth provider
 *                    url:
 *                     type: string
 *                     description: The URL to redirect to
 *       400:
 *         description: Bad request
 *       405:
 *         description: Method not allowed
 *       500:
 *         description: Internal server error
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { provider } = req.body as { provider: Provider };

  if (!provider) {
    return res.status(400).json({ error: "Provider is required!" });
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      // options: { redirectTo: `https://fork-tbp-fe-hosting.vercel.app/auth/callbackv1` },
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    return res.status(200).json({ data: authData });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "An unknown error occurred." });
  }
}

// Workaround to enable Swagger on production 
export const swaggerOAuth = {
  index:4, 
  text:
  `"/api/v1/auth/oauth": {
    "post": {
      "tags": ["auth"],
      "summary": "Sign in with OAuth",
      "description": "Sign in a user using OAuth provider.",
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "provider": {
                  "type": "string",
                  "description": "The OAuth provider"
                }
              }
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Successfully signed in",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "data": {
                    "type": "object",
                    "properties": {
                      "provider": {
                        "type": "string",
                        "description": "The OAuth provider"
                      },
                      "url": {
                        "type": "string",
                        "description": "The URL to redirect to"
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