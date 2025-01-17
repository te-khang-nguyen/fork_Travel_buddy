import { NextApiRequest, NextApiResponse } from "next";

import { Provider } from "@supabase/supabase-js";
import { baseUrl } from "@/app/constant";
import { supabase } from "@/libs/supabase/supabase_client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { provider } = req.body as { provider: Provider };

  if (!provider) {
    return res.status(400).json({ error: "Provider is required!" });
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${baseUrl}/auth/callbackv1` },
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    return res.status(200).json({ data: authData });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "An unknown error occurred." });
  }
}
