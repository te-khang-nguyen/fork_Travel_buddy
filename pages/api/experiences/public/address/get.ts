import { supabase } from "@/libs/supabase/supabase_client";
import { NextApiRequest, NextApiResponse } from "next";
import experienceTranslation from "./translation";

/**
 * API endpoint to get experiences grouped by address with owned_by filtering
 * 
 * Query parameters:
 * - company_id: Filter by company/owner ID (optional)
 * - address: Filter by specific address (optional)
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
        const { companies, language } = req.query;

        // Call the PostgreSQL function via Supabase RPC
        const { data, error } = await supabase
            .rpc('get_experiences_by_address_and_owners', { 
                owner_filters: companies && companies.length > 0 ? (companies as string).split(',') : null
            });

        if(language && language !== "en") {

            const { data: translatedData, error: translatedDataError } = await supabase
                .rpc('get_translated_experiences_by_address_and_owners', { 
                    owner_filters: companies && companies.length > 0 ? (companies as string).split(',') : null,
                    language_code: language as string
                });

            const allExperiences = data.map((experience: any) => experience.experience_data).flat();
            const allTranslatedExperiences = translatedData.map((experience: any) => experience.experience_data).flat();

            if (translatedDataError || !translatedData) {
                return res.status(400).json({ error: translatedDataError?.message || "Translation not found" });
            }

            if(allTranslatedExperiences.length === allExperiences.length) {
                return res.status(200).json({ data: translatedData });
            }

            if(allTranslatedExperiences.length < allExperiences.length) {
                const missingExperiences = allExperiences.filter(
                    (experience: any) => !allTranslatedExperiences.find(
                        (translatedExperience: any) => translatedExperience.id === experience.id
                    )
                );

                console.log("Missing experiences: ", missingExperiences)
                const translatedExperiences = await Promise.all(missingExperiences.map(
                    (experience: any) => experienceTranslation(
                        {
                            id: experience.id,
                            name: experience.name,
                            description: experience.description,
                            thumbnail_description: experience.thumbnail_description,
                            address: experience.address,
                            default_questions: experience.default_questions,
                        },
                        language as string
                    )
                ));

                // console.log("Translated experiences: ", translatedExperiences);

                const { data: translationUpload, error: translationUploadError } = await supabase
                    .from("experiences_activities_localizations")
                    .insert(translatedExperiences.map((experience: any) => {
                        const { id, ...rest } = experience;
                        return {
                            experience_id: id,
                            language: language as string,
                            ...rest
                        }
                    }))
                    .select("*")

                if (translationUploadError || !translationUpload) {
                    console.log("Translation upload failed: \n", translationUploadError);
                    return res.status(400).json({ error: "Translation upload failed"});
                }

                const { data: newlyTranslatedData, error: newlyTranslatedDataError } = await supabase
                .rpc('get_translated_experiences_by_address_and_owners', { 
                    owner_filters: companies && companies.length > 0 ? (companies as string).split(',') : null,
                    language_code: language as string
                });

                if (newlyTranslatedDataError || !newlyTranslatedData) {
                    console.log("Translation retrieval failed: \n", newlyTranslatedDataError);
                    return res.status(400).json({ error: "Translation retrieval failed"});
                }

                return res.status(200).json({ data: newlyTranslatedData });
            }
        }

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ data });
    } catch (err: any) {
        return res.status(500).json({ 
            error: err.message || "An error has occurred while retrieving the experience information."
        });
    }
}

// Swagger documentation
export const swaggerExpGetByOwner = {
    index: 13,
    text: ``
};