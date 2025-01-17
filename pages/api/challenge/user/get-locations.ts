import { supabase } from "@/libs/supabase/supabase_client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed!" });
    }

    const { challengeId } = req.query;

    try {

        const {
            data: locationData,
            error
        } = await supabase
            .from("locations")
            .select("*")
            .eq("challengeid", challengeId);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ data: locationData });

    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while retrieving the locations information." });
    }

};