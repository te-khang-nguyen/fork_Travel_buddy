import { supabase } from "@/libs/supabase/supabase_client";
import { NextApiRequest, NextApiResponse } from "next";
import { Profile } from "@/libs/services/user/profile";


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed!" });
    }

    const { role } = req.query;
    const finalRole = role === "user" || !role ? "user" : "business";

    const token = req.headers.authorization?.split(' ')[1];

    const {
        data: { user },
    } = await supabase.auth.getUser(token);

    const userId = user?.id;
    const avatar = user?.user_metadata?.avatar_url;
    const email = user?.email;
    const userName = user?.user_metadata?.name;
    const firstName = user?.user_metadata?.full_name.split(" ")[0];
    const lastName = user?.user_metadata?.full_name.split(" ")[1];
    const lastSignInAt = new Date(user?.last_sign_in_at ?? "");
    const lastSignInAtString = lastSignInAt.toISOString().split(".")[0];
    const createdAt = new Date(user?.created_at ?? "");
    const createdAtString = createdAt.toISOString().split(".")[0];
    const firstTime = (createdAtString === lastSignInAtString) 
      || (lastSignInAt.valueOf() - createdAt.valueOf() < 5000);

    try {
        const { data: profileData, error } = await supabase
            .from(`${finalRole}profiles`)
            .select('*, media_assets(url)')
            .eq(`${finalRole}id`, user!.id)
            .single();

        if (error || !profileData) {
          const toMediaAssets = {
            user_id: userId,
            url: avatar,
            usage: "avatar",
            mime_type: "image/jpeg"
          }
      
          const {
            data: mediaData,
            error: mediaErr
          } = await supabase.from("media_assets")
            .insert(toMediaAssets)
            .select("*")
            .single();
      
          if(mediaErr){
            res.status(500).json({ error: mediaErr.message });
          }
      
          const { 
            data: newProfileData 
          } = await supabase.from("userprofiles")
                      .insert({
                        userid: userId,
                        email: email,
                        username: userName,
                        firstname: firstName,
                        lastname: lastName,
                        avatar_id: mediaData!.id
                      })
                      .select("*, media_assets(url)")
                      .single();
      
          if (!newProfileData) {
            return res.status(500).json({ error: "Fail to create new profile for OAuth user." });
          } else {
            return res.status(200).json({
              data: { ...newProfileData, first_time: firstTime }
            });
          }
        } else if(!error || profileData) {
          return res.status(200).json({ 
            data: { ...profileData, first_time: firstTime } 
          });
        }

    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while retrieving the user profile." });
    }

};

// Workaround to enable Swagger on production 
export const swaggerProfileGet = {
  index:8, 
  text:
`"/api/v1/profile": {
    "get": {
      "tags": ["profile"],
      "summary": "Retrieve user profile",
      "description": "Retrieve the profile of a user based on their role.",
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "parameters": [
        {
          "in": "query",
          "name": "role",
          "schema": {
            "type": "string"
          },
          "required": false,
          "description": "The role of the user ('business' for B2B profiles, 'user'/empty for Traveler profiles)"
        }
      ],
      "responses": {
        "200": {
          "description": "User profile retrieved successfully",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "data": {
                    "type": "object",
                    "properties": {
                      "userid": { "type": "string" },
                      "username": { "type": "string" },
                      "email": { "type": "string" },
                      "firstname": { "type": "string" },
                      "lastname": { "type": "string" },
                      "preferences": { "type": "string" },
                      "facebook": { "type": "string" },
                      "instagram": { "type": "string" },
                      "x": { "type": "string" },
                      "phone": { "type": "string" },
                      "createdAt": { "type": "string" },
                      "avatar_id": { "type": "string" },
                      "media_assets": {
                        "type": "object",
                        "properties": {
                          "url" : {
                            "type": "string"
                          }
                        }
                      },
                      "first_time": { "type": "boolean" }
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