import { ExaSearchResults } from "@langchain/exa";
import Exa from "exa-js";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatAnthropic } from '@langchain/anthropic';
import { createRetrieverTool } from "langchain/tools/retriever";
import { ExaRetriever } from "@langchain/exa";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { WikipediaQueryRun } from "@langchain/community/tools/wikipedia_query_run";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableConfig } from "@langchain/core/runnables";
import { AIMessage } from "@langchain/core/messages";

const GGL_KEY = "AIzaSyCMApTmGGuytaMU__x1g4gP4gFvJYzBSp8";

export const systemPromptTemplate = ({ 
    numerOfWords,
    customPrompt,
}: { 
    numerOfWords?: number;
    customPrompt?: string;
 }) =>
(customPrompt ?? `You are a web researcher who answers user questions by looking up information on the internet and retrieving contents of helpful documents.
 Cite your sources.`) +
 `Summarize the search content in ${numerOfWords || 300} words.
 `;

export const userQueryPromptTemplate = ({
    query,
    searchTopic
}: {
    query: string;
    searchTopic?: string;
}) =>
    `
    I am asking questions about a topic. 
    The topic and questions is provided in the following format:
    [Questions]: ${query}
    [Topic]: ${searchTopic || "Search the contents related to the [Questions]"}
    `;

export const createPromptFromTemplate = ({
    userInputs,
    numerOfWords,
    customSystemPrompt,
    searchTopic,
}:{
    userInputs: string;
    numerOfWords?: number;
    customSystemPrompt?: string;
    searchTopic?: string;
}) => {
    const systemPrompt = systemPromptTemplate({
        numerOfWords: numerOfWords,
        customPrompt: customSystemPrompt,
    });

    const userPrompt = userQueryPromptTemplate({
        query: userInputs,
        searchTopic: searchTopic,
    });

    return ChatPromptTemplate.fromMessages([
        ["system", systemPrompt],
        ["human", userPrompt],  
        ["placeholder", "{message}"]  
    ])
};

interface searchAgentProps {
    llmModel?: string;
    retrieverApiKey?: string;
    numberOfSearchResults?: number;
};

const searchAgent = ({
    llmModel = "gemini-2.0-flash-exp", 
    retrieverApiKey = process.env.EXASEARCH_API_KEY || "447fd489-0e14-4ad1-aaa5-90224799b134",
    numberOfSearchResults = 10
}: searchAgentProps) => {
    const llm = new ChatGoogleGenerativeAI({
        model: llmModel,
        temperature: 0,
        maxOutputTokens: 4096,
        apiKey: GGL_KEY,
    });

    // const llm = new ChatAnthropic({
    //     model: "claude-3-5-sonnet-20240620",
    //     temperature: 0,
    //     maxTokens: undefined,
    //     maxRetries: 2,
    //     apiKey: ANTHROPIC_API_KEY,
    //     // baseUrl: "...",
    //     // other params...
    // });

    const exaClient = new Exa(retrieverApiKey);

    const exaRetrieverForAgent = new ExaRetriever({
        client: exaClient,
        searchArgs: {
            numResults: numberOfSearchResults,
        }
    });

    // const wikiRetrieverForAgent = new WikipediaQueryRun({
    //     topKResults: 3,
    //     maxDocContentLength: 4000,
    // });

    const searchTool = createRetrieverTool(exaRetrieverForAgent,{
        name: "search",
        description: "Get contents from webpages related to the given string search query."
    });

    // const wikiTool = createRetrieverTool(wikiRetrieverForAgent, {
    //     name: "wikiSearch",

    // })

    const agentExecutor = createReactAgent({
        llm: llm,
        tools: [searchTool]
    });

    return agentExecutor;
};


export default searchAgent;




