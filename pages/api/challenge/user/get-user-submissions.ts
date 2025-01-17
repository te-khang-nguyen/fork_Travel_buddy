import { supabase } from "@/libs/supabase/supabase_client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed!" });
    }
    const token = req.headers.authorization?.split(' ')[1];

    const {
        data: { user },
    } = await supabase.auth.getUser(token);

    try {
        const {
            data: queryData,
            error
        } = await supabase
            .from("challengeHistories")
            .select("*")
            .eq("userId", user!.id);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ data: queryData });

    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while retrieving the user's submissions." });
    }

};