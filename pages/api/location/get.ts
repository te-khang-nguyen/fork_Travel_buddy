import { supabase } from "@/libs/supabase/supabase_client";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * @swagger
 * /api/v1/location/get:
 *   get:
 *     tags:
 *       - location
 *     summary: Retrieve locations by challenge ID
 *     description: Retrieve locations associated with a specific challenge ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: challengeId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the challenge to retrieve locations for
 *     responses:
 *       200:
 *         description: A list of locations
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
 *                       challengeId:
 *                         type: string
 *                       title:
 *                         type: string
 *                       location_info:
 *                         type: array
 *                         items:
 *                          type: object
 *                          properties:
 *                           title:
 *                             type: string
 *                           instruction:
 *                             type: string
 *                           media:
 *                             type: array
 *                             items:
 *                               type: string
 *                       imageUrls:
 *                         type: array
 *                         items:
 *                           type: string
 *                       created:
 *                         type: string
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

    const challengeId = req.query?.challenge_id;

    try {

        const {
            data: locationData,
            error
        } = await supabase
            .from("locations")
            .select("*")
            .eq("challengeid", challengeId);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ data: locationData });

    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while retrieving the locations information." });
    }

};