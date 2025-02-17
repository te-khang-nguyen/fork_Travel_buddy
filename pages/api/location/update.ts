import { NextApiRequest, NextApiResponse } from "next";
import { imageToStorage } from "../submission/create";
import { createApiClient } from "@/libs/supabase/supabaseApi";
import {
    base64toBinary,
} from "@/libs/services/utils";

/**
 * @swagger
 * /api/v1/location/update:
 *   post:
 *     tags:
 *       - location
 *     summary: Update location
 *     description: Update the details of a location.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: locationId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the location to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the location
 *               description:
 *                 type: string
 *                 description: The description of the location
 *     responses:
 *       200:
 *         description: Location updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
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

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '4.5mb', // Increase the body size limit (e.g., 5MB)
        },
    },
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed!" });
    }

    const { locationId } = req.query;
    const updatedData = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    const supabase = createApiClient(token);

    // const {
    //     data: { user },
    // } = await supabase.auth.getUser();

    try {
        const {
            data: locationData,
            error: locationErr
        } = await supabase
            .from('locations')
            .upsert({ id: locationId, ...updatedData })
            .select()
            .single();

        if (locationErr) {
            return res.status(400).json({ error: locationErr.message });
        }

        return res.status(200).json({ data: locationData });

    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while updating location." });
    }

};