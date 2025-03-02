import { supabase } from "@/libs/supabase/supabase_client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        res.status(405).send({ message: 'Only GET requests allowed' })
        return
    }
    try {
        const { destination_id } = req.query;
        const query = supabase
            .from('destination_details')
            .select('*, media_assets ( url )')
            .eq('destination_id', destination_id)
            .eq('type', 'iconic_photos')            
        
        const { data, error } = await query;
        let transformedData;
        if (error) {
            console.error("Supabase Error:", error);
        } else {
            // Transform data to move 'url' out of 'media_assets'
            transformedData = data.map(({ media_assets, ...item }) => ({
                ...item,
                url: media_assets?.url || null, // Extract URL
            }));
        
            // console.log("Transformed Data:", transformedData);
        }        

        if (error) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(200).json({ data: transformedData });
    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while retrieving the challenge information."});
    }
}