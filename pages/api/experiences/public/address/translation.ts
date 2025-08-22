import googleTranslateMultipleTexts from "@/libs/services/agents/translation";

export default async function experienceTranslation(
    experience: {
        id: string,
        name: string,
        description: string,
        thumbnail_description: string,
        address: string,
        default_questions: string[],
        owned_by: string | null,
    },
    language: string,
) {
    console.log("Translation started with: \n", language);
    const { default_questions, id, owned_by, ...rest } = experience;
    const translationResponse = await googleTranslateMultipleTexts(rest, language as string);
    const defaultQuestionsTranslation = default_questions && default_questions.length > 0 ? 
        await googleTranslateMultipleTexts(default_questions, language as string) : [];
    
    return {
        ...experience,
        ...translationResponse,
        default_questions: defaultQuestionsTranslation,
        id,
        owned_by
    }
}

    
    
