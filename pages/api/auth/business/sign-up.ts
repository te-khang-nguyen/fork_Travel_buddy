import { supabase } from "@/libs/supabase/supabase_client";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * @swagger
 * /api/auth/business/sign-up:
 *   post:
 *     tags:
 *       - auth/business
 *     summary: Sign up a new business user
 *     description: Create a new business user account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               businessName:
 *                 type: string
 *                 description: The name of the business
 *               email:
 *                 type: string
 *                 description: The email of the business user
 *               phone:
 *                 type: string
 *                 description: The phone number of the business user
 *               password:
 *                 type: string
 *                 description: The password for the business user account
 *     responses:
 *       200:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
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

  const { businessName, email, phone, description, password, parent } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required!" });
  }

  try {
    const { 
      data: { user },
      error: authError 
    } = await supabase.auth.signUp({ email, password });

    const userId = user?.id;

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // Create user profile
    // const businessname = ;
    const userProfile = {
      email,
      businessname: businessName,
      phone: phone || "",
      description: description || "",
    };

    const { error: profileError } = await supabase
      .from("businessprofiles")
      .insert(userProfile);

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    if (parent) {
      const { data: orgProfileData } = await supabase
        .from("businessprofiles")
        .select("*")
        .eq("businessname", parent)
        .single();

      const { error: orgProfileError }  = await supabase
        .from("businessprofiles")
        .update({
          editors : orgProfileData?.editors ? 
          [...orgProfileData.editors, userId] : [userId],
        })
        .eq("businessname", parent)
        .select("editors")
        .single();
      
      if (orgProfileError) {
        return res.status(400).json({ error: orgProfileError.message });
      }
    }

    await supabase.auth.signOut();
    return res.status(200).json({ message: "User created successfully!" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "An unknown error occurred." });
  }
}

// Workaround to enable Swagger on production 
export const swaggerBussSignup = {
  index:6, 
  text:
  `"/api/v1/auth/business/sign-up": {
    "post": {
      "tags": ["B2B-auth"],
      "summary": "Sign up a new business user",
      "description": "Create a new business user account.",
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "businessName": {
                  "type": "string",
                  "description": "The name of the business"
                },
                "email": {
                  "type": "string",
                  "description": "The email of the business user"
                },
                "phone": {
                  "type": "string",
                  "description": "The phone number of the business user"
                },
                "password": {
                  "type": "string",
                  "description": "The password for the business user account"
                },
                "parent": {
                  "type": "string",
                  "description": "The parent business name (optional)"
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
