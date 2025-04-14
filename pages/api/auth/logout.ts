
import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.headers.authorization?.split(' ')[1];

  const supabase = createApiClient(token);

  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ message: "User is signed out successfully!" });

  } catch (err: any) {
    return res.status(500).json({ error: err.message || "An unknown error occurred during sign out." });
  }
}


// Workaround to enable Swagger on production 
export const swaggerUserLogout = {
  index:3, 
  text:
  `"/api/v1/auth/logout": {
    "get": {
      "tags": ["auth"],
      "summary": "User Login",
      "description": "Authenticate user with email and password",
      "responses": {
        "200": {
          "description": "Successful logout"
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