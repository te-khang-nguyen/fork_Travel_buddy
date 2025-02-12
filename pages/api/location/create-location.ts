import { NextApiRequest, NextApiResponse } from "next";
import { imageToStorage } from "../challenge/user/upload-user-submission";
import { createApiClient } from "@/libs/supabase/supabaseApi";
import {
    base64toBinary,
} from "@/libs/services/utils";

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

    const { challengeId } = req.query;
    const { title, backgroundImages, sections } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    const supabase = createApiClient(token);

    const {
        data: { user },
    } = await supabase.auth.getUser();

    try {
        const { data, error } = await supabase.from("locations").insert([
            {
                challengeid: challengeId,
                title,
                imageurls: [
                    backgroundImages
                        ? (await imageToStorage({
                            userId: user!.id,
                            bucket: "challenge",
                            title: `${challengeId}loc=${title}`,
                            location: `bgFor${title}`,
                            data: typeof backgroundImages[0] === 'string'?
                                base64toBinary(backgroundImages[0])
                                :backgroundImages[0],
                        }, supabase))?.data
                        : null,
                ],
                location_info: await Promise.all(
                    sections.map(async (section) => ({
                        title: section.title,
                        instruction: section.instruction,
                        media: section.media
                            ? await Promise.all(
                                section.media.map(async (item, indexA) =>
                                    (await imageToStorage({
                                        userId: user!.id,
                                        bucket: "challenge",
                                        title: `${section.title}id=${indexA}`,
                                        data: typeof item === 'string'?
                                            base64toBinary(item)
                                            :item
                                    }, supabase))?.data
                                )) : null,
                    }))
                ),
            },
        ]).select('id').single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ data: data });
    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while creating a new location." });
    }
};