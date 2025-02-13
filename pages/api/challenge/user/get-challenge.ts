import { supabase } from "@/libs/supabase/supabase_client";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * @swagger
 * /api/challenge/user/get-challenge:
 *   get:
 *     tags:
 *       - challenge/user
 *     summary: Retrieve a challenge by ID
 *     description: Retrieve a challenge by its ID. If no ID is provided, it retrieves challenges with price 0.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: challengeId
 *         schema:
 *           type: string
 *         required: false
 *         description: The ID of the challenge to retrieve
 *     responses:
 *       200:
 *         description: A list of challenges
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
 *                      id:
 *                          type: string
 *                      businessId:
 *                          type: string
 *                      description:
 *                          type: string
 *                      thumbnailUrl:
 *                          type: string
 *                      backgroundUrl:
 *                          type: string
 *                      created:
 *                          type: string
 *                      title:
 *                          type: string
 *                      tourSchedule:
 *                          type: string
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

    const { challengeId } = req.query;
    
    try {
        const { 
            data: queryData, 
            error 
        } = await supabase
            .from("challenges")
            .select("*")
            .eq(!challengeId ? "price" : "id", !challengeId ? 0 : challengeId);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ data: queryData });
    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while retrieving the challenge information."});
    }

};