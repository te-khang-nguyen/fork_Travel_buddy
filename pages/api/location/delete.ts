import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";


export const config = {
    api: {
        bodyParser: {
            sizeLimit: '4.5mb', // Increase the body size limit (e.g., 5MB)
        },
    },
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "PUT") {
        return res.status(405).json({ error: "Method not allowed!" });
    }

    const { locationId } = req.query;
    const token = req.headers.authorization?.split(' ')[1];
    const supabase = createApiClient(token);

    // const {
    //     data: { user },
    // } = await supabase.auth.getUser();

    try {
        const {
            data: locationData,
            error: locationErr
        } = await supabase
            .from('locations')
            .upsert({ id: locationId, status: "ARCHIVED" })
            .select()
            .single();

        if (locationErr) {
            return res.status(400).json({ error: locationErr.message });
        }

        return res.status(200).json({ data: locationData });

    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while updating location." });
    }

};