import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { vectorStore } from "./utils";

const documentsPath = process.env.LEGAL_FILES_PATH;
if (!documentsPath) throw new Error(`Expected env var LEGAL_FILES_PATH`);

// Load documents from the specified directory
const directoryLoader = new DirectoryLoader(documentsPath, {
	".pdf": (path: string) =>
		new PDFLoader(path, {
			pdfjs: () => import("pdfjs-dist/legacy/build/pdf.mjs"),
		}),
	".md": (path: string) => new TextLoader(path),
	// add other file types here as needed
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
