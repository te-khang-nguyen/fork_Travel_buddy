import { supabase } from "@/libs/supabase/supabase_client";
import { NextApiRequest, NextApiResponse } from "next";

// SQL for the view
// CREATE OR REPLACE VIEW active_experiences_by_address AS
// SELECT
//   address,
//   json_agg(
//     jsonb_build_object(
//       'id', id,
//       'name', name,
//       'primary_photo', primary_photo,
//       'description', description,
//       'thumbnail_description', thumbnail_description
//     ) ORDER BY name
//   ) AS experience_data
// FROM experiences
// WHERE status = 'active'
// GROUP BY address;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        res.status(405).send({ message: 'Only GET requests allowed' })
        return
    }

    try {
        const { data, error } = await supabase
            .from("active_experiences_by_address")
            .select("*")
        
        // const { visits, stories, ...rest } = data as any;

        if (error) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(200).json({ data });
    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while retrieving the challenge information."});
    }
}

