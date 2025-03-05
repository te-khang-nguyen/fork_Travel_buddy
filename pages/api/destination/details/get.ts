import { createApiClient } from "@/libs/supabase/supabaseApi";
import { NextApiRequest, NextApiResponse } from "next";


// This function returns all destination_details except for iconic_photos (which requires further data transformation)
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        res.status(405).send({ message: 'Only GET requests allowed' })
        return
    }

    // Extract authorization token
    const token = req.headers.authorization?.split(" ")[1];
    // Create Supabase client
    const supabase = createApiClient(token);

    try {
        const { destination_id, type } = req.query;
        const query = type 
            ? supabase.from('destination_details').select('*').eq('destination_id', destination_id).eq('type', type)
            : supabase.from('destination_details').select('*').eq('destination_id', destination_id).neq('type', 'iconic_photos');            
        
        const { data, error } = await query;

        if (error) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(200).json({ data });
    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while retrieving the challenge information."});
    }
}