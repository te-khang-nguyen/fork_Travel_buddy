import { createApiClient } from "@/libs/supabase/supabaseApi";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'DELETE') {
        res.status(405).send({ message: 'Only DELETE requests allowed' })
        return
    }

    const experience_id = req.query["experience-id"];

    // Extract authorization token
    const token = req.headers.authorization?.split(" ")[1];
    // Create Supabase client
    const supabase = createApiClient(token!);

    const { data, error } = await supabase
        .from("experiences")
        .delete()
        .eq("id", experience_id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ data });
}
