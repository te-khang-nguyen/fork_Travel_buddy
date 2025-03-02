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

    const channel_id = req.query?.["channel-id"];
    const updatedData = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    const supabase = createApiClient(token);

    try {
        const {
            data: storyData,
            error: storyErr
        } = await supabase
            .from('story')
            .update(updatedData)
            .eq("id", channel_id)
            .select()
            .single();

        if (storyErr) {
            return res.status(400).json({ error: storyErr.message });
        }

        return res.status(200).json({ data: storyData });

    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while updating location." });
    }

};


export const swaggerStoryUpdate = {
  index:29, 
  text:
``
}