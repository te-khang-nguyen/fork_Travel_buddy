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
        const token = req.headers.authorization?.split(' ')[1];
        const supabase = createApiClient(token);

        const {
            data: { user },
        } = await supabase.auth.getUser(token);

        const userId = user?.id;

        const { data : userData, error : userError } = await supabase
        .from("businessprofiles")
        .select("type")
        .eq("businessid", userId)
        .single();

        if (userError || !userData) {
            console.error('Error fetching user type:', userError);
            return [];
        }
        const userType = userData.type;

        let query;
        if (userType === "SUPER_ADMIN") {
            query = supabase.from("businessprofiles").select("*")
        } else {
            query = supabase.from("businessprofiles").select("*").or(`businessid.eq.${userId},editors.cs.{${userId}}`)
        }

        const { data, error } = await query;

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        return res.status(200).json({
            data,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}