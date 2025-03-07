import { ChatOpenAI } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import { 
    Annotation, 
    StateGraph, 
    MemorySaver, 
} from "@langchain/langgraph";
import { FaissStore } from "@langchain/community/vectorstores/faiss";



interface AgentPipelineProps {
    vectorStore: FaissStore;
    llmModel: string;
}

const analyzerAgent = ({
    vectorStore,
    llmModel
}: AgentPipelineProps) => {

    const llm = new ChatOpenAI({
        model: llmModel,
        temperature: 0
    });

    const promptTemplate = ({
        question,
        context
    }) => `You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.
    Question: ${question} 
    Context: ${context} 
    Answer:`;

    // Define state for application
    const InputStateAnnotation = Annotation.Root({
        question: Annotation<string>,
    });

    const StateAnnotation = Annotation.Root({
        question: Annotation<string>,
        context: Annotation<Document[]>,
        answer: Annotation<string>,
    });

    // Define application steps
    const retrieve = async (state: typeof InputStateAnnotation.State) => {
        const retrievedDocs = await vectorStore.similaritySearch(state.question)
        return { context: retrievedDocs };
    };


    const generate = async (state: typeof StateAnnotation.State) => {
        const docsContent = state.context.map(doc => doc.pageContent).join("\n");
        const messages = await promptTemplate({ 
            question: state.question, 
            context: docsContent 
        });
        const response = await llm.invoke(messages);
        return { answer: response.content };
    };

    const checkpointer = new MemorySaver();

    // Compile application and test
    const graph = new StateGraph(StateAnnotation)
        .addNode("retrieve", retrieve)
        .addNode("generate", generate)
        .addEdge("__start__", "retrieve")
        .addEdge("retrieve", "generate")
        .addEdge("generate", "__end__")

    const graphWithMemory = graph.compile({ checkpointer });

    return graphWithMemory;
};

export default analyzerAgent;



