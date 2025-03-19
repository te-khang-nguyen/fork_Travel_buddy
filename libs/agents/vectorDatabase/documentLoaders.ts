import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { AirtableLoader } from "@langchain/community/document_loaders/web/airtable";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import contentStructureAnalyzer from "../story/analyzer";

export interface LoaderProps {
    dataPreparation: {
        dataSource?: string;
        dataLoader: string;
        airtableTabId?: string;
        airtableBaseId?: string;
        airtableView?: string;
    }[];
    rawDocs?: Document[];
    chunkSize?: number;
    chunkOverlap?: number;
    withAnalyzer?: boolean;
}

export const onlineLoadersHandler = ({
    loaderName,
    source,
    airtableView
}: {
    loaderName: string;
    source: string;
    airtableView?: {
        tableId: string;
        baseId: string;
        view?: string
    };
}) => {
    switch (loaderName) {
        case "web":
            return new CheerioWebBaseLoader(source);

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
                tableId: airtableView!.tableId,
                baseId: airtableView!.baseId,
                kwargs: { view: airtableView?.view },
            });

        default:
            return;
    }
};

const loadersPrep = async ({
    dataPreparation,
    rawDocs = [],
    chunkSize,
    chunkOverlap,
    withAnalyzer
}: LoaderProps) => {
    const loaders = dataPreparation.map(
        (item) => onlineLoadersHandler({
            loaderName: item.dataLoader,
            source: item.dataSource || '',
            airtableView: item.dataLoader === "airtable" ? {
                tableId: item.airtableTabId || "",
                baseId: item.airtableBaseId || "",
                view: item?.airtableView
            } : undefined
        })
    )

    const docsFromLoader: Document[] = (await Promise.all(loaders.map(
        async (loader) => {
                const subDocs: Document[] = await loader!.load();
                const modDocs: Document[] = (await Promise.all(subDocs.map(async (record)=>{
                    const extractedContent = JSON.parse(record.pageContent)['fields']['Blog Post'] ?? "";
                    const processedContent = withAnalyzer && extractedContent !== ""? 
                         await contentStructureAnalyzer({content: extractedContent, model_type: "gemini"})
                         : extractedContent
                    return {
                        pageContent: processedContent,
                        metadata: record.metadata
                    }
                })))
                return modDocs.filter((item)=>item.pageContent !== "");
        }))).flat();

    const docs = [...docsFromLoader, ...rawDocs];

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: chunkSize ?? 1000, chunkOverlap: chunkOverlap ?? 200
    });

    const allSplits = await splitter.splitDocuments(docs);

    return allSplits
};

export default loadersPrep;

