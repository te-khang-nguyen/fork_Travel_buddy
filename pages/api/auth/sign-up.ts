import { supabase } from "@/libs/supabase/supabase_client";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * @swagger
 * /api/auth/sign-up:
 *   post:
 *     tags:
 *       - auth
 *     summary: Sign up a new user
 *     description: Create a new user account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: The first name of the user
 *               lastName:
 *                 type: string
 *                 description: The last name of the user
 *               email:
 *                 type: string
 *                 description: The email of the user
 *               phone:
 *                 type: string
 *                 description: The phone number of the user
 *               password:
 *                 type: string
 *                 description: The password for the user account
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

  const { firstName, lastName, email, phone, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required!" });
  }

  try {
    const { error: authError } = await supabase.auth.signUp({ email, password });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const userProfile =
      firstName !== lastName
        ? {
            email,
            username: `${firstName}${lastName}`,
            firstname: firstName,
            lastname: lastName,
            phone,
          }
        : {
            email,
            businessname: firstName || lastName || "",
            phone: phone || "",
          };

    const { error: profileError } = await supabase
      .from("userprofiles")
      .insert(userProfile);

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    await supabase.auth.signOut();
    return res.status(200).json({ message: "User created successfully!" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "An unknown error occurred." });
  }
}


export const swaggerUserSignUp = {
  index:1, 
  text:
  `"/api/v1/auth/sign-up": {
    "post": {
      "tags": ["auth"],
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
