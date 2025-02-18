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
    const { challengeId, challengeHistoryId } = req.query;
    const { user_notes, story, media_submitted } = req.body;

    // Extract authorization token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: "Authorization token is required" });
    }

    // Create Supabase client
    const supabase = createApiClient(token);
    // Get authenticated user
    const { 
        data: { user },
    } = await supabase.auth.getUser();

    // Validate required parameters
    if (!challengeId) {
        return res.status(400).json({ error: "Challenge ID is required" });
    }

    try {
        // Insert story into database
        const { data, error } = await supabase.from("story").insert([
            {
                status: "ACTIVE",
                userId: user?.id,
                challengeHistoryId: challengeHistoryId,
                challengeId: challengeId,
                userNotes: user_notes,
                storyFull: story,
                mediaSubmitted: media_submitted,
            }
        ]).select('id').single();

        if (error) {
            console.error("Story insertion error:", error);
            return res.status(400).json({ error: error.message });
        }

        // Successful response
        return res.status(201).json({ 
            message: "Story created successfully", 
            storyId: data?.id 
        });

    } catch (catchError) {
        console.error("Unexpected error:", catchError);
        return res.status(500).json({ error: "Internal server error" });
    }
}