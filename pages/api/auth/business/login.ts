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
            .from("businessprofiles")
            .select("businessid, username")
            .eq("businessid", user!.id)
            .single();
        
        if (!profileData) {
            return res.status(400).json({ error: "This user has no access!" });
        }

        if (profileError) {
            return res.status(400).json({ error: "No access!" });
        }

        const { data: profileDataB2C } = await supabase
          .from("userprofiles")
          .select("userid")
          .eq("userid", user!.id)
          .single();
  
        let b2cId;
        if (!profileDataB2C) {
          const { data: newB2CProfileData } = await supabase
            .from("userprofiles")
            .insert({
              userid: user!.id,
              email: email,
              username: profileData.username,
            })
            .select("userid")
            .single();
            b2cId = newB2CProfileData?.userid;
        } else {
          b2cId = profileDataB2C?.userid
        }

        const { 
          data: queryData, 
        } = await supabase
          .from("channels")
          .select("id")
          .eq("user_id", user?.id);

        let channels;
        if (queryData && queryData.length === 0) {
          const { data: newChannelData } = await supabase.from("channels").insert([
            {
                user_id: user?.id,
                name: 'A casual traveler',
                channel_type: ' Travel Buddy',
                url: 'https://fork-tbp-fe-hosting.vercel.app',
                brand_voice: `
                  I am a casual traveler who loves to explore new places. 
                  I always want to learn more about culture and daily activities from the locals.
                  At the end of a trip, I often share my honest thoughts about the journey in a polite way and also expresses gratitude for the everything encountered during the trip.
                `.trim(),
            }
          ]).select("id");

          channels = newChannelData ?? []
        } else if (queryData && queryData.length > 0){
          channels = queryData
        }

        console.log(channels);

        return res
            .status(200)
            .json({ 
              access_token: session.access_token, 
              expires_in: session.expires_in,
              refresh_token: session.refresh_token,
              userId: profileData.businessid, 
              b2cId: b2cId,
            });
    } catch (err) {
        return res
            .status(500)
            .json({ error: "Login failed due to an unknown error." });
    }
}


// Workaround to enable Swagger on production 
export const swaggerBussLogin = {
  index:7, 
  text:
    `"/api/v1/auth/business/login": {
      "post": {
        "tags": ["B2B-auth"],
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
                    },
                    "b2cId": {
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