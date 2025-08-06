import { supabase } from "@/libs/supabase/supabase_client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { businessName, userName, email, phone, description, password, parent } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required!" });
  }

  let addedEditor = null;

  const { 
    data: { user, session },
    error: authError 
  } = await supabase.auth.signUp({ email, password });

  if (authError) {
    return res.status(400).json({ error: authError.message });
  }

  const userId = user?.id;  
  const accessToken = session?.access_token;
  const expiresIn = session?.expires_in;
  const refreshToken = session?.refresh_token;

  try {
    
    // Create user profile
    // const businessname = ;
    const userProfile = {
      email,
      username: userName,
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

    const { data: profileDataB2C } = await supabase
      .from("userprofiles")
      .select("*, media_assets(url)")
      .eq("userid", userId)
      .single();

    let B2CProfile = {};
    let channelId = '';
    if (!profileDataB2C) {
      const { data: newB2CProfileData } = await supabase
          .from("userprofiles")
          .insert({
            userid: userId,
            email: email,
            username: userName,
          })
          .select("*, media_assets(url)")
          .single();
      B2CProfile = newB2CProfileData;

      const { data } = await supabase.from("channels").insert([
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
      ]).select("id").single();

      channelId = data?.id;
    } else {
      B2CProfile = profileDataB2C
    }

    if (parent) {
      const { data: orgProfileData } = await supabase
        .from("businessprofiles")
        .select("*")
        .eq("businessname", parent)
        .single();
      
      if (!orgProfileData) {
        return res.status(400).json({ error: "Parent business not found!" });
      }

      const { data: editorsData, error: orgProfileError }  = await supabase
        .from("businessprofiles")
        .update({
          editors : orgProfileData?.editors ? 
          [...orgProfileData.editors, userId] : [userId],
        })
        .eq("businessname", parent)
        .select("editors")
        .single();
      
      if (orgProfileError) {
        return res.status(500).json({ error: "Fail to insert new editor!" + orgProfileError.message });
      } else {
        console.log("Editors updated:", editorsData);
        // Add the new editor to the list of editors
        addedEditor = editorsData?.editors.includes(userId);
      }
    }

    // await supabase.auth.signOut();
    return res.status(200).json({ 
      message: "User created successfully!", 
      editors: addedEditor,
      withB2cProfile: Object.keys(B2CProfile).length > 0,
      userId: userId,
      access_token: accessToken,
      expires_in: expiresIn,
      refresh_token: refreshToken,
      channelId: channelId
    });

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
                "userName": {
                  "type": "string",
                  "description": "The name of the user account"
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
                  },
                  "addedEditor": {
                    "type": "string"
                  },
                  "withB2cProfile": {
                    "type": "boolean"
                  },
                  "userId": {
                    "type": "string"
                  },
                  "channelId": {
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
