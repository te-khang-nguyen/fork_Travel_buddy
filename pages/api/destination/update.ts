import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'PUT') {
        res.status(405).send({ message: 'Only PUT requests allowed' });
        return;
    }

    const token = req.headers.authorization?.split(' ')[1];
    const supabase = createApiClient(token);

    const { destination_id } = req.query;
    const data = req.body;

    if (!destination_id) {
        return res.status(400).json({ error: "Destination ID is required" });
    }

    try {
        const {
            data: updateData, 
            error: updateError
        } = await supabase.from('destinations')
                    .update({
                        ...data 
                    })
                    .eq('id', destination_id)
                    .select("id");

        if (updateError) {
            return res.status(400).json({ error: updateError });
        }
        if (!updateData || updateData.length === 0) {
          return res.status(403).json({ success: false, message: "Unauthorized or destination not found" });
        }
        return res.status(200).json({ success: true, message: "Destination updated successfully", data: updateData });
    } catch (err: any) {
        return res.status(500).json({ 
            error: err.message || "An error occurred while updating the destination" 
        });
    }
}
