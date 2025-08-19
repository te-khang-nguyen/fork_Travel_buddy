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
        const { companies, language } = req.query;

        // Call the PostgreSQL function via Supabase RPC
        const { data, error } = await supabase
            .rpc('get_experiences_by_address_and_owners', { 
                owner_filters: companies && companies.length > 0 ? (companies as string).split(',') : null
            });
        
        if(language && language !== "en") {

            const { data: translatedData, error: translatedDataError } = await supabase
                .rpc('get_translated_experiences_by_address_and_owners', { 
                    owner_filters: companies && companies.length > 0 ? (companies as string).split(',') : null,
                    language_code: language as string
                });

            if (translatedDataError || !translatedData) {
                return res.status(400).json({ error: translatedDataError?.message || "Translation not found" });
            }

            return res.status(200).json({ data: translatedData });
        }

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