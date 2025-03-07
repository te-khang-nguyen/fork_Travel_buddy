import { OpenAIEmbeddings } from "@langchain/openai";
import { VectorStore } from "@langchain/core/vectorstores";
import type { EmbeddingsInterface } from "@langchain/core/embeddings";
import { Document } from "@langchain/core/documents";

import { similarity as ml_distance_similarity } from "ml-distance";

interface InMemoryVector {
  content: string;
  embedding: number[];
  metadata: Record<string, any>;
}

export interface CustomVectorStoreArgs {}

export class CustomVectorStore extends VectorStore {
  declare FilterType: (doc: Document) => boolean;

  memoryVectors: InMemoryVector[] = [];

  _vectorstoreType(): string {
    return "custom";
  }

  constructor(
    embeddings: EmbeddingsInterface,
    fields: CustomVectorStoreArgs = {}
  ) {
    super(embeddings, fields);
  }

  async addDocuments(documents: Document[]): Promise<void> {
    const texts = documents.map(({ pageContent }) => pageContent);
    return this.addVectors(
      await this.embeddings.embedDocuments(texts),
      documents
    );
  }

  async addVectors(vectors: number[][], documents: Document[]): Promise<void> {
    const memoryVectors = vectors.map((embedding, idx) => ({
      content: documents[idx].pageContent,
      embedding,
      metadata: documents[idx].metadata,
    }));

    this.memoryVectors = this.memoryVectors.concat(memoryVectors);
  }

  async similaritySearchVectorWithScore(
    query: number[],
    k: number,
    filter?: this["FilterType"]
  ): Promise<[Document, number][]> {
    const filterFunction = (memoryVector: InMemoryVector) => {
      if (!filter) {
        return true;
      }

      const doc = new Document({
        metadata: memoryVector.metadata,
        pageContent: memoryVector.content,
      });
      return filter(doc);
    };
    const filteredMemoryVectors = this.memoryVectors.filter(filterFunction);
    const searches = filteredMemoryVectors
      .map((vector, index) => ({
        similarity: ml_distance_similarity.cosine(query, vector.embedding),
        index,
      }))
      .sort((a, b) => (a.similarity > b.similarity ? -1 : 0))
      .slice(0, k);

    const result: [Document, number][] = searches.map((search) => [
      new Document({
        metadata: filteredMemoryVectors[search.index].metadata,
        pageContent: filteredMemoryVectors[search.index].content,
      }),
      search.similarity,
    ]);

    return result;
  }

  static async fromTexts(
    texts: string[],
    metadatas: object[] | object,
    embeddings: EmbeddingsInterface,
    dbConfig?: CustomVectorStoreArgs
  ): Promise<CustomVectorStore> {
    const docs: Document[] = [];
    for (let i = 0; i < texts.length; i += 1) {
      const metadata = Array.isArray(metadatas) ? metadatas[i] : metadatas;
      const newDoc = new Document({
        pageContent: texts[i],
        metadata,
      });
      docs.push(newDoc);
    }
    return this.fromDocuments(docs, embeddings, dbConfig);
  }

  static async fromDocuments(
    docs: Document[],
    embeddings: EmbeddingsInterface,
    dbConfig?: CustomVectorStoreArgs
  ): Promise<CustomVectorStore> {
    const instance = new this(embeddings, dbConfig);
    await instance.addDocuments(docs);
    return instance;
  }
};


interface VectorDbInitializerProps {
  documents: Document[]
};

export const VectorDbInitializer = async ({documents}: VectorDbInitializerProps ) => {

  const vectorstore = new CustomVectorStore(new OpenAIEmbeddings());

  await vectorstore.addDocuments(documents);

  return vectorstore;
};
