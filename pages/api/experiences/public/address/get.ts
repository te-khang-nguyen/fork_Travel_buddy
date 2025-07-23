import { supabase } from "@/libs/supabase/supabase_client";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * API endpoint to get experiences grouped by address with owned_by filtering
 * 
 * Query parameters:
 * - company_id: Filter by company/owner ID (optional)
 * - address: Filter by specific address (optional)
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        res.status(405).send({ message: 'Only GET requests allowed' })
        return
    }

    try {
        const { company_id } = req.query;

        // Call the PostgreSQL function via Supabase RPC
        const { data, error } = await supabase
            .rpc('get_experiences_by_address_and_owner', { 
                owner_filter: company_id && company_id !== '' ? company_id : null
            });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ data });
    } catch (err: any) {
        return res.status(500).json({ 
            error: err.message || "An error has occurred while retrieving the experience information."
        });
    }
}

// Swagger documentation
export const swaggerExpGetByOwner = {
    index: 13,
    text: ``
};