import { supabase } from "@/libs/supabase/supabase_client";
import { NextApiRequest, NextApiResponse } from "next";


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
