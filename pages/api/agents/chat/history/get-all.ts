import { supabase } from "@/libs/supabase/supabase_client";
import { createApiClient } from "@/libs/supabase/supabaseApi";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        res.status(405).send({ message: 'Only GET requests allowed' })
        return
    }

    const token = req.headers.authorization?.split(" ")[1];
    const supabase = createApiClient(token!);

    const { data: { user } } = await supabase.auth.getUser(token);
    const user_id = user?.id;

    try {
        const { data, error } = await supabase
            .from("chat_threads")
            .select("*,chat_messages(*)")
            .eq("user_id", user_id)
            .order("created_at", { ascending: false })
            .order("created_at", { ascending: false, referencedTable: "chat_messages" })
            .limit(20);
        
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(200).json({ data });
    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while retrieving the challenge information."});
    }
}

