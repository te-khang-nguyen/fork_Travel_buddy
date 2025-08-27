import { createApiClient } from "@/libs/supabase/supabaseApi";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.headers.authorization?.split(' ')[1];
  const supabase = createApiClient(token!);

  const { email, refresh_token } = req.body;

  if (!email || !refresh_token) {
    return res.status(400).json({ error: "Email and refresh token are required!" });
  }

  const { data: { user: signedInUser } } = await supabase.auth.getUser(token);

  if (!signedInUser) {
    return res.status(400).json({ error: "Failed to authenticate user." });
  }

  console.log(signedInUser);

  const { data } = await supabase.auth.setSession({
    access_token: token as string,
    refresh_token: refresh_token
  })

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.updateUser({ email });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!user) {
      return res.status(400).json({ error: "Failed to authenticate user." });
    }

    console.log("Updated Email: ", user.email);

    const { data: profile } = await supabase
    .from("userprofiles")
    .update({ email })
    .eq("userid", user.id)
    .single();

    console.log("Updated Profile: ", profile);

    const { data: businessprofile } = await supabase
    .from("businessprofiles")
    .update({ email })
    .eq("businessid", user.id)
    .single();

    console.log("Updated Business Profile: ", businessprofile);

    return res
      .status(200)
      .json({ data: {
        access_token: data?.session?.access_token,
        expires_at: data?.session?.expires_at,
        refresh_token: data?.session?.refresh_token,
        user_id: user.id,
        email: user.email
      }});
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Login failed due to an unknown error." });
  }
}
