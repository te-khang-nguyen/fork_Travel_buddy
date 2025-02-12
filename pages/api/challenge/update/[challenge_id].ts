import { NextApiRequest, NextApiResponse } from "next";
import { upsertNewRow } from "@/libs/services/utils";

/**
 * @swagger
 * /api/challenge/update/{challenge_id}:
 *   put:
 *     summary: Update an Existing Challenge
 *     description: Update details of a specific challenge by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: challenge_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the challenge to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Updated title of the challenge
 *                 example: "Mountain Hiking Adventure 2024"
 *               description:
 *                 type: string
 *                 description: Updated description of the challenge
 *                 example: "Explore the most scenic mountain trails this summer"
 *               thumbnailUrl:
 *                 type: string
 *                 description: Updated URL of the challenge thumbnail image
 *                 example: "https://example.com/new-mountain-challenge-thumb.jpg"
 *               backgroundUrl:
 *                 type: string
 *                 description: Updated URL of the challenge background image
 *                 example: "https://example.com/new-mountain-challenge-bg.jpg"
 *               tourSchedule:
 *                 type: string
 *                 description: Updated schedule or timing of the tour
 *                 example: "Every weekend, 7 AM - 6 PM"
 *     responses:
 *       200:
 *         description: Challenge successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   description: Updated challenge details
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Unique identifier of the updated challenge
 *                       example: "chg_123456"
 *                     title:
 *                       type: string
 *                       description: Updated challenge title
 *                     description:
 *                       type: string
 *                       description: Updated challenge description
 *       400:
 *         description: Bad request - Invalid challenge ID or update data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Detailed error message
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       404:
 *         description: Challenge not found
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
    if (req.method !== 'PUT') {
        res.status(405).send({ message: 'Only PUT requests allowed' });
        return;
    }

    const { challenge_id } = req.query;
    const data = req.body;

    if (!challenge_id) {
        return res.status(400).json({ error: "Challenge ID is required" });
    }

    try {
        const result = await upsertNewRow({ 
            entity: "challenges", 
            id: challenge_id as string, 
            ...data 
        });

        if (result.error) {
            return res.status(400).json({ error: result.error });
        }

        return res.status(200).json({ data: result.data });
    } catch (err: any) {
        return res.status(500).json({ 
            error: err.message || "An error occurred while updating the challenge" 
        });
    }
}