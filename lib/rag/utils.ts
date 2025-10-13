import { TaskType } from "@google/generative-ai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { createClient } from "@supabase/supabase-js";

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseKey) throw new Error(`Expected env var SUPABASE_SERVICE_ROLE_KEY`);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!url) throw new Error(`Expected env var NEXT_PUBLIC_SUPABASE_URL`);

const embeddings = new GoogleGenerativeAIEmbeddings({
	model: "gemini-embedding-001",
	apiKey: process.env.GOOGLE_API_KEY,
	taskType: TaskType.RETRIEVAL_DOCUMENT,
});

const supabaseClient = createClient(url, supabaseKey);
export const vectorStore = new SupabaseVectorStore(embeddings, {
	client: supabaseClient,
	tableName: "legal_documents",
	queryName: "match_documents",
});
