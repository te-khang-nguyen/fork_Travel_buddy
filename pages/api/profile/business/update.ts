import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'PUT') {
        res.status(405).send({ message: 'Only PUT requests allowed' });
        return;
    }

    const token = req.headers.authorization?.split(' ')[1];
    const supabase = createApiClient(token);
    const {
        data: { user },
    } = await supabase.auth.getUser(token);

    const userId = user?.id;
    const data = req.body;

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    try {
        const {
            data: updateData, 
            error: updateError
        } = await supabase.from('businessprofiles')
                    .update({
                        ...data 
                    })
                    .eq('businessid', userId)
                    .select("id");

        if (updateError) {
            return res.status(400).json({ error: updateError });
        }
        if (!updateData || updateData.length === 0) {
          return res.status(403).json({ success: false, message: "Unauthorized or challenge not found" });
        }
        return res.status(200).json({ success: true, message: "User updated successfully", data: updateData });
    } catch (err: any) {
        return res.status(500).json({ 
            error: err.message || "An error occurred while updating the challenge" 
        });
    }
}