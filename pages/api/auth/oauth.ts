import { NextApiRequest, NextApiResponse } from "next";
import { Provider } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";

//add type of variable later
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  
  const { provider, redirectLink } = req.body as { provider: Provider; redirectLink: string };

  if (!provider) {
    return res.status(400).json({ error: "Provider is required!" });
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { 
        redirectTo: redirectLink ?? `https://travelbuddy8.com/auth/callbackv1`
      },
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
                },
                "redirectLink": {
                  "type": "string",
                  "description": "The callback link to redirect user to after OAuth"
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