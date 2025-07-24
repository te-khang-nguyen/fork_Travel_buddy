import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";

interface DestinationDetails {
    id: string;
    // Add other fields here
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'PUT') {
        res.status(405).send({ message: 'Only PUT requests allowed' });
        return;
    }

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: "Unauthorized: Token is missing" });
    }

    const supabase = createApiClient(token!);

    const { dd_id } = req.query;
    const data: Partial<DestinationDetails> = req.body;

    if (!dd_id) {
        return res.status(400).json({ error: "Destination details ID is required" });
    }

    if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({ error: "Request body is empty or invalid" });
    }

    try {
        const { data: updateData, error: updateError } = await supabase
            .from('experience_details')
            .update({ ...data })
            .eq('id', dd_id)
            .select('id');

        if (updateError) {
            console.error("Update Error:", updateError);
            return res.status(400).json({ 
                error: updateError.message, 
                details: updateError.details 
            });
        }

        if (!updateData || updateData.length === 0) {
            return res.status(403).json({ 
                success: false, 
                message: "Unauthorized or destination not found" 
            });
        }

        return res.status(200).json({ 
            success: true, 
            message: "Destination updated successfully", 
            data: updateData 
        });
    } catch (err: any) {
        return res.status(500).json({ 
            error: err.message || "An error occurred while updating the destination" 
        });
    }
}
