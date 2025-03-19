import {
    getStoryPrompt,
    getSeoPrompt,
    getStoryWithSeoPrompt,
    getImageAnalysisPrompt,
    channelsDescription
} from "./promptTemplate";
import OpenAI from "openai";
import supabaseVectorDb from "../vectorDatabase/supabaseVectorStore";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";


const client = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_TOKEN,
    dangerouslyAllowBrowser: true
});

const ggleClient = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash-lite",
    temperature: 0,
    maxOutputTokens: 4096,
    apiKey: process.env.GOOGLE_API_KEY,
}); 

const airTableDataPrep = [{
    dataLoader: "airtable",
    airtableBaseId: "appllamFSF6QA0wC4",
    airtableTabId: "tblBCyaOdACXioEdA",
    airtableView: "Content"
}];


async function generateLocationStories(
    experience: string,
    locations: string,
    notes: string,
    media: string[],
    brandVoice: string,
    channelType: string,
    storyLength: number = 70
): Promise<any> {
    let chatInitialCompletion: string | null
    let chatSeoCompletion: string | null;

    const supabaseVectorStoreRaw = await supabaseVectorDb({
        // dataPreparation: airTableDataPrep,
        chunkSize: 2000,
        chunkOverlap: 20
    });

    const supabaseVectorStoreImplicit = await supabaseVectorDb({
        // dataPreparation: airTableDataPrep,
        withAnalyzer: true,
        chunkSize: 2000,
        chunkOverlap: 20
    });

    const numberOfKeywords = "TWO";

    const prompt = [
        {
            role:"system",
            content: `
                You are an expert in content summarization and RAG agent optimization, specialzied in generating concise questions from ideas. 
                
                Input format:
                - [Writing Ideas]: user's idea for writing a piece of content
                - [Pillar]: the main context that the piece of content is 
                - [Additional information]: list of addition contexts related to [Pillar]. It could be a list of ativities, locations, etc.
                
                Analyze the user's input contents and generate ${numberOfKeywords} non-overlapping questions relevant to user's inputs that are powerful for vector searching.
                Output format must be a JSON object of ${numberOfKeywords} questions.
                
                Example output: 
                questions: [
                    {
                        id: 1,
                        question: [Question 1 here]
                    },
                    {
                        id: 2,
                        question: [Question 2 here]
                    },
                    ...
                ]
            `
        },
        {
            role: 'user',
            content: `Keywords are required to be generated for the following contents:
            - [Writing Ideas]: ${notes}
            - [Pillar]: ${experience}
            - [Additional information]: ${locations}
            `
        },
    ];

    const result = (await ggleClient.invoke(prompt)).content

    const keywordsArray = JSON.parse((result as string)?.replace("```json", "")
                                                        .replace("```", "")).questions;
        
        // .split(',');

    const vectorSearchedDocs = (await Promise.all(
        keywordsArray.map( async (keyword)=>{
            const output = await supabaseVectorStoreRaw
                .similaritySearch(keyword.question, 1);
            return output.map((item) => item.pageContent);
    }))).flat();
    
    const vectorSearchedAnalysis = (await Promise.all(
        keywordsArray.map(async (keyword) => {
            const output = await supabaseVectorStoreImplicit
                .similaritySearch(keyword.question, 1);
            return output.map((item) => item.pageContent);
    }))).flat();

    const mediaSummary = (await Promise.all(media.map(async (item, index) => {
        const prompt = getImageAnalysisPrompt({
            url: item,
            relatedQueries: {
                experience: experience,
                locations: locations
            }
        });

        const result = (await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: prompt as any,
            max_tokens: 16384,
        })).choices[0].message.content;

        return `Photo No.${index + 1}: ${result}`;
    }))).join("\n\n");

    const messages = getStoryPrompt({
        experience: experience,
        locations: locations,
        brandVoice: brandVoice,
        notes: notes,
        mediaSummary: mediaSummary,
        channelType: channelType,
        storySamples: vectorSearchedDocs,
        storyStructure: vectorSearchedAnalysis,
        storyLength: storyLength
    });

    try {

        chatInitialCompletion = (await client.chat.completions.create({
            model: "gpt-4o",
            messages: messages as any,
            max_tokens: 16384,
        })).choices[0].message.content;

    } catch (error) {
        console.error("Error calling OpenAI model:", error);
        return { error: "Failed to call OpenAI model" };
    }

    const seoMessages = getSeoPrompt({
        chatInitialCompletion: chatInitialCompletion,
        channelType
    })


    try {
        chatSeoCompletion = (await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: seoMessages as any,
            max_tokens: 16384,
        })).choices[0].message.content;
        
        const processedOuput = chatSeoCompletion?.replace("```json", "")
                                                 .replace("```", "")
        const output = JSON.parse(processedOuput as string)

        return { data: output };
    } catch (error) {
        console.error("Error calling OpenAI model:", error);
        return { error: "Failed to call OpenAI model" };
    }

    // const [finalMessages, seoElements] = getStoryWithSeoPrompt({
    //     chatInitialCompletion: chatInitialCompletion,
    //     chatSeoCompletion: chatSeoCompletion
    // });

    // try {
    //     const chatCompletion = await client.chat.completions.create({
    //         model: "gpt-4o-mini",
    //         messages: finalMessages as any,
    //         max_tokens: 16384,
    //     });

    //     const output = {
    //         ...seoElements,
    //         story_content: chatCompletion.choices[0].message.content || ""
    //     }

    //     return { data: output };
    // } catch (error) {
    //     console.error("Error calling OpenAI model:", error);
    //     return { error: "Failed to call OpenAI model" };
    // }
}

export { generateLocationStories };
