import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed!" });
    }

    const token = req.headers.authorization?.split(' ')[1];
    const supabase = createApiClient(token);
    
    // const {
    //     data: { user },
    // } = await supabase.auth.getUser();

    try {

        const {
            data: locationData,
            error
        } = await supabase
            .from("locations")
            .select("*");

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ data: locationData });

    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while retrieving the locations information." });
    }
};