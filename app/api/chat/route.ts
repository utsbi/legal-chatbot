import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { NextResponse } from "next/server";
import { vectorStore } from "@/lib/rag/utils";

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { message } = body;

		if (!message || typeof message !== "string") {
			return NextResponse.json(
				{ error: "Message is required and must be a string" },
				{ status: 400 },
			);
		}

		// Initialize the model
		const model = new ChatGoogleGenerativeAI({
			model: "gemini-2.5-flash",
			apiKey: process.env.GOOGLE_API_KEY,
		});

		// Retrieve relevant documents from vector store
		const retrievedDocs = await vectorStore.similaritySearch(message, 10);

		const docsContent = retrievedDocs
			.map((doc, index) => `Document ${index + 1}:\n${doc.pageContent}`)
			.join("\n\n---\n\n");

		// Create system prompt with context
		const systemMessage = new SystemMessage(
			`You are a helpful legal assistant specializing in answering questions about legal documents, specifically bylaws and deed restrictions.

Use the following context from the legal documents to answer the user's question. If the answer cannot be found in the context, say so clearly.

Context from legal documents:
${docsContent}

Please provide accurate, helpful answers based on the context above. If you cite specific information, don't mention which document it comes from.`,
		);

		const humanMessage = new HumanMessage(message);

		// Invoke the model with context
		const response = await model.invoke([systemMessage, humanMessage]);

		return NextResponse.json({
			response: response.content,
			sources: retrievedDocs.map((doc) => ({
				content: doc.pageContent,
				metadata: doc.metadata,
			})),
		});
	} catch (error) {
		console.error("Error in chat API:", error);
		return NextResponse.json(
			{
				error: "Failed to process chat request",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
