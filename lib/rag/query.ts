import { SystemMessage } from "@langchain/core/messages";
import { createAgent, dynamicSystemPromptMiddleware } from "langchain";
import { vectorStore } from "./utils";

const agent = createAgent({
	model,
	tools: [],
	middleware: [
		dynamicSystemPromptMiddleware(async (state) => {
			const lastQuery = state.messages[state.messages.length - 1].content;

			const retrievedDocs = await vectorStore.similaritySearch(lastQuery, 2);

			const docsContent = retrievedDocs
				.map((doc) => doc.pageContent)
				.join("\n\n");

			// Build system message
			const systemMessage = new SystemMessage(
				`You are a helpful assistant. Use the following context in your response:\n\n${docsContent}`,
			);

			return [systemMessage, ...state.messages];
		}),
	],
});
