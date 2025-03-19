import { 
    HuggingFaceTransformersEmbeddings 
} from "@langchain/community/embeddings/huggingface_transformers";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { Document } from "@langchain/core/documents";
import loadersPrep from "./documentLoaders";

const modelOptions = [
    "nvidia/NV-Embed-v2",
    "sentence-transformers/all-mpnet-base-v2",
    "Xenova/all-MiniLM-L6-v2",
]


export interface VectorDbProps {
    dataPreparation?: {
        dataSource?: string;
        dataLoader: string;
        airtableTabId?: string;
        airtableBaseId?: string;
        airtableView?: string;
    }[];
    embeddingModel?: string;
    rawDocs?: Document[];
    chunkSize?: number;
    chunkOverlap?: number;
    withAnalyzer?: boolean;
}

const faissVectorDb = async ({
    dataPreparation,
    embeddingModel = "nvidia/NV-Embed-v2",
    rawDocs = []
}: VectorDbProps) => {

    // const embeddings = new HuggingFaceTransformersEmbeddings({
    //     // apiKey: process.env.HUGGINGFACE_API_KEY,
    //     model: embeddingModel,
    // });

    const embeddings = new GoogleGenerativeAIEmbeddings({
        model: "gemini-embedding-exp-03-07", // 768 dimensions
        taskType: TaskType.RETRIEVAL_DOCUMENT,
        title: "Document title",
    });

    const vectorStore = new FaissStore(embeddings, {});

    if (dataPreparation) {
        const allSplits = await loadersPrep({
            dataPreparation: dataPreparation,
            rawDocs: rawDocs,
        });
        // Index chunks
        await vectorStore.addDocuments(allSplits);
    }
    

    return vectorStore
};

export default faissVectorDb;



