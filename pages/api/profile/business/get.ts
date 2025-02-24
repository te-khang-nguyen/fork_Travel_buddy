import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        res.status(405).send({ message: 'Only GET requests allowed' })
        return
    }

    try {
        const { user_id } = req.query;

        const token = req.headers.authorization?.split(' ')[1];
        const supabase = createApiClient(token);

        // const {
        //     data: { user },
        // } = await supabase.auth.getUser(token);

        // const userId = user?.id;

        const { data : userData, error : userError } = await supabase
        .from("businessprofiles")
        .select("*")
        .eq("businessid", user_id)
        .single();

        if (userError) {
            return res.status(400).json({
                success: false,
                error: userError.message
            });
        }

        return res.status(200).json({
            data: userData,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}