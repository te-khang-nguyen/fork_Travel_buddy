import { TranslationServiceClient } from '@google-cloud/translate';

const translationClient = new TranslationServiceClient({
    credentials: {
      client_email: process.env.GCP_PROJECT_CLIENT_EMAIL,
      private_key: process.env.GCP_PROJECT_PRIVATE_KEY,
    },
});

export default async function activitiesTranslation(
    activity: {
        name: string,
        description: string,
        thumbnail_description: string,
        address: string,
        highlights: string[],
    },
    language: string,
) {
    console.log("Translation started with: \n", language);
    const {highlights, ...rest} = activity;
    const array = Object.values(rest).filter((value) => value !== null && value !== "");
    if(array.length === 0) {
        return activity;
    }
    const projectId = process.env.GCP_PROJECT_CLIENT_ID?.split("-")[0];
    const [translationResponse] = await translationClient.translateText({
        parent: `projects/${projectId}/locations/us-central1`,
        targetLanguageCode: language as string,
        contents: array
    });

    if (!translationResponse) {
        return { error: "Translation failed" };
    }

    const { translations } = translationResponse;

    const translationsKeyValue = translations?.map((translation, index) => {
        return [
            Object.keys(rest)[index],
            translation?.translatedText || ""
        ]
    })

    const translationsObject = Object.fromEntries(translationsKeyValue || []);

    let highlightsTranslationsResult: string[] = [];
    if(highlights && highlights.length > 0) {
        const [highlightsTranslation] = await translationClient.translateText({
            parent: `projects/${projectId}/locations/us-central1`,
            targetLanguageCode: language as string,
            contents: highlights
        });

        if (!highlightsTranslation) {
            console.log("Highlights translation failed");
            return { error: "Translation failed" };
        }

        const { translations } = highlightsTranslation;
        highlightsTranslationsResult = translations?.map((translation) => translation?.translatedText || "")
            ?.filter((translation) => translation !== "") || [];
    }

    return {
        ...activity,
        ...translationsObject,
        highlights: highlightsTranslationsResult
    }
}
    
