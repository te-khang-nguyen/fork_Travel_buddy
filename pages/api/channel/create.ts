import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Validate request method
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed!" });
    }

    // Extract parameters
    const payload = req.body;

    // Extract authorization token
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Authorization token is required" });
    }

    // Create Supabase client
    const supabase = createApiClient(token);
    // Get authenticated user
    const { 
        data: { user },
    } = await supabase.auth.getUser();

    try {
        // Insert story into database
        const { data, error } = await supabase.from("channels").insert([
            {
                user_id: user?.id,
                ...payload
            }
        ]).select("id").single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // Successful response
        return res.status(201).json({ data: {
            message: "Channel created successfully", 
            ...data 
          }});

    } catch (catchError) {
        console.error("Unexpected error:", catchError);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export const swaggerChannelCreate = {
    index:26, 
    text:
``
}