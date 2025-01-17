
import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
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
