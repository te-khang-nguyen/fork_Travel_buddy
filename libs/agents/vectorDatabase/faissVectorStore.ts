import { 
    HuggingFaceTransformersEmbeddings 
} from "@langchain/community/embeddings/huggingface_transformers";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import {
    PlaywrightWebBaseLoader,
    Page,
    Browser,
} from "@langchain/community/document_loaders/web/playwright";
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { AirtableLoader } from "@langchain/community/document_loaders/web/airtable";
import { SearchApiLoader } from "@langchain/community/document_loaders/web/searchapi";


const dataLoadersHandler = ({
    loaderName,
    source,
    airtableView
}: {
    loaderName: string,
    source: string,
    airtableView?: { view: string };
}) => {
    switch (loaderName) {
        case "placwright":
            return new PlaywrightWebBaseLoader(`${source}`, {
                launchOptions: {
                    headless: true,
                },
                gotoOptions: {
                    waitUntil: "domcontentloaded",
                },
                /** Pass custom evaluate, in this case you get page and browser instances */
                async evaluate(page: Page, browser: Browser, response: any) {
                    await page.waitForResponse(`${source}`);

                    const result = await page.evaluate(() => document.body.innerHTML);
                    return result;
                },
            });


        case "puppeteer":
            return new PuppeteerWebBaseLoader(
                `${source}`,
                {
                    launchOptions: {
                        headless: true,
                    },
                    gotoOptions: {
                        waitUntil: "domcontentloaded",
                    },
                }
            );

        case "github":
            return new GithubRepoLoader(
                `${source}`,
                {
                    branch: "main",
                    recursive: true,
                    processSubmodules: true,
                    unknown: "warn",
                }
            );

        case "airtable":
            return new AirtableLoader({
                tableId: "YOUR_TABLE_ID",
                baseId: "YOUR_BASE_ID",
                kwargs: airtableView,
            });

        default:
            return;
    }
}


const modelOptions = [
    "nvidia/NV-Embed-v2",
    "sentence-transformers/all-mpnet-base-v2",
    "Xenova/all-MiniLM-L6-v2",
]


interface AgentPipelineProps {
    dataPreparation: {
        dataSource: string;
        dataLoader: string;
        airtableView?: string;
    }[];
    embeddingModel?: string;
    rawDocs?: Document[]
}

const genericVectorDb = async ({
    dataPreparation,
    embeddingModel = "nvidia/NV-Embed-v2",
    rawDocs = []
}: AgentPipelineProps) => {

    const embeddings = new HuggingFaceTransformersEmbeddings({
        model: embeddingModel,
    });

    const vectorStore = new FaissStore(embeddings, {});

    const loaders = dataPreparation.map(
        (item) => dataLoadersHandler({
            loaderName: item.dataLoader,
            source: item.dataSource,
            airtableView: {
                view: item.airtableView || ""
            }
        })
    )

    const docsFromLoader: Document[] = (await Promise.all(loaders.map(
        async (loader) => {
            const subDocs: Document[] = await loader!.load();
            return subDocs
                ;
    }))).flat();
    
    const docs = [...docsFromLoader, ...rawDocs];

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000, chunkOverlap: 200
    });

    const allSplits = await splitter.splitDocuments(docs);

    // Index chunks
    await vectorStore.addDocuments(allSplits);

    return vectorStore
};

export default genericVectorDb;



