import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const token = req.headers.authorization?.split(' ')[1];
    const supabase = createApiClient(token!);

    const { 'member-id': memberId } = req.query;
    const payload = req.body;

    if (!memberId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const { data, error } = await supabase
            .from('businessprofiles')
            .update(payload)
            .eq('businessid', memberId)
            .select('*')
            .single();

        if (error) {
          return res.status(500).json({ error: error.message });
        }

        return res.status(201).json({ data });

    } catch (error) {
        return res.status(500).json({ error: error });
    }
}


