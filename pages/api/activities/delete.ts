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

    const activity_id = req.query["activity-id"];

    // Extract authorization token
    const token = req.headers.authorization?.split(" ")[1];
    // Create Supabase client
    const supabase = createApiClient(token!);

    const { data, error } = await supabase
        .from("activities")
        .delete()
        .eq("id", activity_id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ data });
}