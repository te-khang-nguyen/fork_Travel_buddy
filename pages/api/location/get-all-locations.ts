import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";

/**
 * @swagger
 * /api/location/get-all-locations:
 *   get:
 *     tags:
 *       - location
 *     summary: Get all locations
 *     description: Retrieve all locations.
 *     security:
 *       - bearerAuth: []
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

    const token = req.headers.authorization?.split(' ')[1];
    const supabase = createApiClient(token);
    
    // const {
    //     data: { user },
    // } = await supabase.auth.getUser();

    try {

        const {
            data: locationData,
            error
        } = await supabase
            .from("locations")
            .select("*");

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ data: locationData });

    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while retrieving the locations information." });
    }
};