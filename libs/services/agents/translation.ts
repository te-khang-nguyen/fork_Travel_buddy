import { TranslationServiceClient } from '@google-cloud/translate';

const translationClient = new TranslationServiceClient({
    credentials: {
      client_email: process.env.GCP_PROJECT_CLIENT_EMAIL,
      private_key: process.env.GCP_PROJECT_PRIVATE_KEY,
    },
});

export default async function googleTranslateMultipleTexts(
    textObject: string[] | { [key: string]: string },
    language: string,
) {
    const isStringArray = Array.isArray(textObject);
    console.log("Translation started with: \n", language);
    const array = isStringArray ? textObject : Object.values(textObject).filter((value) => value !== null && value !== "");
    if(array.length === 0) {
        return textObject;
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
        return !isStringArray ? [
            Object.keys(textObject)[index],
            translation?.translatedText?.replaceAll("&#39;", "'") || ""
        ] : [
            translation?.translatedText?.replaceAll("&#39;", "'") || ""
        ]
    })

    if (!isStringArray) {
        const translationsObject = Object.fromEntries(translationsKeyValue || []);
        return {
            ...textObject,
            ...translationsObject
        }
    }

    return translationsKeyValue || [];
}
    
