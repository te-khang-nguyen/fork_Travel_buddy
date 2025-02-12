import { supabase } from "@/libs/supabase/supabase_client";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * @swagger
 * /api/challenge/business/get-all-challenges:
 *   get:
 *     summary: Retrieve All Challenges for a business user
 *     description: Fetches a list of all challenges for a business user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved challenges
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Unique identifier of the challenge
 *                         example: "chg_123456"
 *                       title:
 *                         type: string
 *                         description: Title of the challenge
 *                         example: "Mountain Hiking Adventure"
 *                       description:
 *                         type: string
 *                         description: Detailed description of the challenge
 *                         example: "Explore breathtaking mountain trails and scenic landscapes"
 *                       businessid:
 *                         type: string
 *                         description: ID of the business that created the challenge
 *                       thumbnailUrl:
 *                         type: string
 *                         description: URL of the challenge thumbnail image
 *                         example: "www.example.com/thumbnail.jpg"
 *                       backgroundUrl:
 *                         type: string
 *                         description: URL of the challenge background image
 *                         example: "www.example.com/background.jpg"
 *                       tourSchedule:
 *                         type: string
 *                         description: Schedule or timing of the tour
 *                         example: "8:00 Start \n 9:00 Eat \n 10:00 End"
 *       400:
 *         description: Bad request or database query error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message describing the issue
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Detailed error message
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
        const { data, error } = await supabase
            .from("challenges")
            .select("*");

        if (error) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(200).json({ data });
    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while retrieving the challenge information."});
    }
}