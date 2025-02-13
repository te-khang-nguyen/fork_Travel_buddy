import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";
import {
    base64toBinary,
} from "@/libs/services/utils";
import crypto from "crypto";

/**
 * @swagger
 * /api/challenge/user/upload-user-submission:
 *   post:
 *     tags:
 *       - challenge/user
 *     summary: Upload user submission
 *     description: Upload a user's submission for a challenge.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               challengeId:
 *                 type: string
 *                 description: The ID of the challenge
 *               userLocationSubmission:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Submission uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request
 *       405:
 *         description: Method not allowed
 *       500:
 *         description: Internal server error
 */

export const imageToStorage = async (inputobj, supabase) => {
    const hash = crypto.randomBytes(16).toString("hex");
    const fileName = `${inputobj.title.replace(/\s+/g, "")}_${hash}.jpg`;
    const storageRef = `${inputobj.userId}/${inputobj.title}/${fileName}`;
  
    const uploadTask = await supabase.storage
      .from(inputobj.bucket)
      .upload(storageRef, inputobj.data, {
        cacheControl: "3600",
        upsert: true,
        contentType: "image/jpg",
      });
  
    if (uploadTask.error) {
      return { error: uploadTask.error };
    }
    const { data, error } = await supabase.storage
      .from(inputobj.bucket)
      .createSignedUrl(uploadTask.data.path, 60 * 60 * 24 * 365);
  
    return { data: data?.signedUrl };
  };

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb', // Increase the body size limit (e.g., 5MB)
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

    const { challengeId, userLocationSubmission } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    const supabase = createApiClient(token);

    const {
        data: { user },
    } = await supabase.auth.getUser();

    for (const [ii, items] of userLocationSubmission.entries()) {
        let imgUrls: (string | undefined)[] | null = [];

        if (items?.userMediaSubmission) {
            for (const [jj, item] of items.userMediaSubmission.entries()) {

                const bytesArray =
                    typeof item === "string" ? base64toBinary(item) : item;
                
                const toStorageUpload = {
                    userId: user!.id,
                    bucket: "challenge",
                    title: `${challengeId}id=${jj}`,
                    location: `userSubmit${jj}`,
                    data: bytesArray,
                };

                try {
                    const storageURL = await imageToStorage(toStorageUpload, supabase);
                    imgUrls.push(storageURL.data);
                } catch (error) {
                    console.error(
                        `Error uploading to storage for item ${jj}:`,
                        error
                    );
                    imgUrls.push(undefined); // Add undefined if upload fails
                }
            }
        } else {
            imgUrls = null;
        }

        // Update userMediaSubmission for the current item
        userLocationSubmission[ii].userMediaSubmission = imgUrls;
    }

    try {
        const { data: historyData, error: historyError } =
            await await supabase
                .from("challengeHistories")
                .select()
                .eq("challengeId", challengeId)
                .eq("userId", user!.id)
                .single();

        const oldSubmissions = historyData?.userChallengeSubmission || [];

        const mergedSubmissions = [
            ...userLocationSubmission,
            ...oldSubmissions.filter(
                (oldItem) =>
                    !userLocationSubmission.some(
                        (newItem) => newItem.locationId === oldItem.locationId
                    )
            ),
        ];

        const insertData = {
            challengeId: challengeId,
            userId: user!.id,
            userChallengeSubmission: mergedSubmissions,

            ...(historyData ? { id: historyData.id } : {}),
        };

        const { data: updateData, error: updateError } = await supabase
              .from("challengeHistories")
              .upsert(insertData)
              .select()
              .single();

        if (updateError) {
            return res.status(400).json({ error: updateError });
        } else {
            return res.status(200).json({ data: updateData });
        }

    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred when trying to write submission data to database." });
    }

};