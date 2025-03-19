import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import {
    HuggingFaceTransformersEmbeddings
} from "@langchain/community/embeddings/huggingface_transformers";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { VectorDbProps } from "./faissVectorStore";
import { OpenAIEmbeddings } from "@langchain/openai";
import loadersPrep from "./documentLoaders";

const supabaseVectorDb = async ({
    dataPreparation,
    embeddingModel = "gemini-embedding-exp-03-07",
    rawDocs = [],
    chunkSize,
    chunkOverlap,
    withAnalyzer = false
}: VectorDbProps) => {
    // const embeddings = new GoogleGenerativeAIEmbeddings({
    //         model: embeddingModel, // 768 dimensions
    //         taskType: TaskType.RETRIEVAL_DOCUMENT,
    //         title: "Document title",
    // });

    const embeddings = new OpenAIEmbeddings({
        model: "text-embedding-3-small",
    });

    const customSupabaseClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_VECTORSTORE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_VECTORSTORE_ANON_KEY!,
    );

    const vectorStore = new SupabaseVectorStore(embeddings, {
        client: customSupabaseClient,
        tableName: withAnalyzer ? "document_implicit_contents" : "documents",
        queryName: withAnalyzer ? "match_document_implicit_contents" : "match_documents",
    });

    if (dataPreparation) {
        const allSplits = await loadersPrep({
            dataPreparation: dataPreparation,
            rawDocs: rawDocs,
            withAnalyzer: withAnalyzer,
            chunkSize: chunkSize,
            chunkOverlap: chunkOverlap,
        });

        // Index chunks
        await vectorStore.addDocuments(
            allSplits, 
            { 
                ids: allSplits.map((item, index) => `${index}`) 
            }
        );
    }
    
    return vectorStore
    
}

    export default supabaseVectorDb;