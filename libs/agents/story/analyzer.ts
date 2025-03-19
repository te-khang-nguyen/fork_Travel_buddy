import OpenAI from "openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";


const getContentAnalysisPrompt = (content: string, model: string) => {

    const systemPrompt = `
                You are an expert analyst specialized in writing style and structural analysis for written contents.

                Execute the following instructions:
                - Analyze the struture of the user inputted content.
                - Analyze the writing intention for each paragraph in the content.
                - Analyze the methods used for transition from one paragraph to the next.
                
                Output format:
                - ONLY USE PLAINTEXT. DO NOT INCLUDE ANY MARKDOWN IN THE RESPONSE!
                - The response must be divided into subsections.
                - Make sure the output is structural so that LLMs can use it to effectively create new stories.
                - Each subsection contains the analysis for each respective paragraph in the content.
                - The overall words limit is 100 words for the analysis.
                - The analysis for each paragraph must be at least 10 words and at most 20 words. 
                - The analysis must be concise and onpoint within the given word limits.
            `
    const userPrompt = content

    const prompt = [
            {
                role: model === 'gemini' ? "system":"developer",
                content: systemPrompt
            },
            {
                role: 'user',
                content: userPrompt
            },
    ];

    return prompt 
}


const contentStructureAnalyzer = async ({
    content,
    model_type
}: {
    content: string;
    model_type: "openai" | "gemini"
}) => {
    const prompt = getContentAnalysisPrompt(content, 'gemini');

    const client = model_type === "openai" ? 
    new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_TOKEN,
        dangerouslyAllowBrowser: true
    })
    : new ChatGoogleGenerativeAI({
            model: "gemini-2.0-flash-lite",
            temperature: 0,
            maxOutputTokens: 4096,
            apiKey: process.env.GOOGLE_API_KEY,
    }); 

    // const ggleClient = new ChatGoogleGenerativeAI({
    //     model: "gemini-2.0-flash-lite",
    //     temperature: 0,
    //     maxOutputTokens: 4096,
    //     apiKey: process.env.GOOGLE_API_KEY,
    // }); 

    try {
        const result = model_type === "openai" ? (await (client as OpenAI).chat.completions.create({
            model: "gpt-4o-mini",
            messages: prompt as any,
            max_tokens: 16384,
        })).choices[0].message.content 
        : (await (client as ChatGoogleGenerativeAI).invoke(prompt)).content

        return result

    } catch (error) {
        console.error("Error calling OpenAI model:", error);
        return { error: "Failed to call OpenAI model" };
    }

    
}


export default contentStructureAnalyzer;