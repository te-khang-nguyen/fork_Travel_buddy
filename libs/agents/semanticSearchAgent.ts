import { supabase_vector_store } from "@/libs/supabase/supabase_client";

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

async function getEmbedding(text: string) {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      input: text,
      model: "text-embedding-ada-002",
    }),
  });
  const data = await res.json();
  if (data.data && data.data[0] && data.data[0].embedding) {
    return data.data[0].embedding;
  }
  throw new Error(data.error?.message || "OpenAI embedding failed");
}

export async function semanticSearchAgent(query: string, topK = 3) {
  const queryEmbedding = await getEmbedding(query);
  const { data, error } = await supabase_vector_store.rpc("match_documents_test", {
    query_embedding: queryEmbedding,
    match_count: topK,
  });
  if (error) throw error;
  return data; // [{ text, similarity, ... }]
}