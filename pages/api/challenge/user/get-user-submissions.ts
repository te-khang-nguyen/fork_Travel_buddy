import { supabase } from "@/libs/supabase/supabase_client";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * @swagger
 * /api/challenge/user/get-user-submissions:
 *   get:
 *     tags:
 *       - challenge/user
 *     summary: Retrieve user submissions
 *     description: Retrieve the submissions of a user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of user submissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Bad request
 *       405:
 *         description: Method not allowed
 *       500:
 *         description: Internal server error
 */

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed!" });
    }
    const token = req.headers.authorization?.split(' ')[1];

    const {
        data: { user },
    } = await supabase.auth.getUser(token);

    try {
        const {
            data: queryData,
            error
        } = await supabase
            .from("challengeHistories")
            .select("*")
            .eq("userId", user!.id);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ data: queryData });

    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while retrieving the user's submissions." });
    }

};