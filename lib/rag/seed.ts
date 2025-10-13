import { TaskType } from "@google/generative-ai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { createClient } from "@supabase/supabase-js";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";

const documentsPath = process.env.LEGAL_FILES_PATH;
if (!documentsPath) throw new Error(`Expected env var LEGAL_FILES_PATH`);

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseKey) throw new Error(`Expected env var SUPABASE_SERVICE_ROLE_KEY`);

const url = process.env.SUPABASE_URL;
if (!url) throw new Error(`Expected env var SUPABASE_URL`);

// Embeddings
const embeddings = new GoogleGenerativeAIEmbeddings({
	model: "gemini-embedding-001",
	apiKey: process.env.GOOGLE_API_KEY,
	taskType: TaskType.RETRIEVAL_DOCUMENT,
});

// Vector Store
const supabaseClient = createClient(url, supabaseKey);
const vectorStore = new SupabaseVectorStore(embeddings, {
	client: supabaseClient,
	tableName: "legal_documents",
	queryName: "match_documents",
});

// Load documents from the specified directory
const directoryLoader = new DirectoryLoader(documentsPath, {
	".pdf": (path: string) =>
		new PDFLoader(path, {
			pdfjs: () => import("pdfjs-dist/legacy/build/pdf.mjs"),
		}),
	".md": (path: string) => new TextLoader(path),
});

const docs = await directoryLoader.load();
console.log(`Loaded ${docs.length} documents.`);

// Chunk documents
const splitter = new RecursiveCharacterTextSplitter({
	chunkSize: 1000,
	chunkOverlap: 200,
});
const allSplits = await splitter.splitDocuments(docs);
console.log(`Split into ${allSplits.length} sub-documents.`);

// 100 rpm for Gemini embeddings
const BATCH_SIZE = 100;
const DELAY_MS = 60000;

async function addDocumentsWithRateLimit(documents: typeof allSplits) {
	const totalBatches = Math.ceil(documents.length / BATCH_SIZE);

	for (let i = 0; i < documents.length; i += BATCH_SIZE) {
		const batch = documents.slice(i, i + BATCH_SIZE);
		const batchNum = Math.floor(i / BATCH_SIZE) + 1;

		console.log(
			`Processing batch ${batchNum}/${totalBatches} (${batch.length} documents)...`,
		);

		try {
			await vectorStore.addDocuments(batch);
			console.log(`Successfully added batch ${batchNum}`);
		} catch (e) {
			console.error(`Failed to add batch ${batchNum}:`, e);
		}

		if (i + BATCH_SIZE < documents.length) {
			console.log(`Waiting ${DELAY_MS / 1000} seconds before next batch...`);
			await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
		}
	}

	console.log(`\nCompleted! Added documents to vector store.`);
}

await addDocumentsWithRateLimit(allSplits);
