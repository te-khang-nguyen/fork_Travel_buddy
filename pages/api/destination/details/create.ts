import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        res.status(405).send({ message: 'Only POST requests allowed' })
        return
    }

    try {
        const token = req.headers.authorization?.split(' ')[1];
        const supabase = createApiClient(token);

        const {
            data: { user },
        } = await supabase.auth.getUser(token);

        const { 
            destination_id,
            type,
            name,
            text,
            media,
            created_at,
            updated_at,
            media_id,
        } = req.body;

        const { data, error } = await supabase
        .from("destination_details")
        .insert([
            {
                destination_id,
                type,
                name,
                text,
                media,
                created_at,
                updated_at,
                media_id,
            },
        ])
        .select("id")
        .single();

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        return res.status(200).json({
            data: { id: data.id },
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}