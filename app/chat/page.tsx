"use client";

import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

type Message = {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: Date;
};

export default function ChatPage() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Auto-scroll to bottom when new messages arrive or loading state changes
	// biome-ignore lint/correctness/useExhaustiveDependencies: We want to scroll on messages/isLoading change
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, isLoading]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || isLoading) return;

		const userMessage: Message = {
			id: Date.now().toString(),
			role: "user",
			content: input.trim(),
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);
		const userInput = input.trim();
		setInput("");
		setIsLoading(true);

		try {
			const response = await fetch("/api/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					message: userInput,
					history: messages,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to get response from API");
			}

			const data = await response.json();

			const assistantMessage: Message = {
				id: (Date.now() + 1).toString(),
				role: "assistant",
				content:
					typeof data.response === "string"
						? data.response
						: JSON.stringify(data.response),
				timestamp: new Date(),
			};

			setMessages((prev) => [...prev, assistantMessage]);
		} catch (error) {
			console.error("Error sending message:", error);
			const errorMessage: Message = {
				id: (Date.now() + 1).toString(),
				role: "assistant",
				content:
					"Sorry, I encountered an error processing your request. Please try again.",
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="h-full w-full flex flex-col">
			<div className="h-full w-full max-w-4xl mx-auto flex flex-col px-2 sm:px-4">
				{/* Header */}
				<div className="text-center pt-2 sm:pt-4">
					<h1 className="text-xl sm:text-2xl font-bold">Legal Documents Q&A</h1>
					<p className="text-muted-foreground text-xs sm:text-sm">
						Ask questions about your legal documents
					</p>
				</div>

				{/* Messages Area */}
				<div className="flex-1 overflow-hidden py-2 sm:py-4">
					<Card className="h-full py-2 pl-2 sm:pl-4 pr-1">
						<ScrollArea className="h-full pr-2 sm:pr-4">
							{messages.length === 0 ? (
								<div className="flex items-center justify-center h-full text-muted-foreground">
									<div className="text-center space-y-2 px-4">
										<p className="text-base sm:text-lg">No messages yet</p>
										<p className="text-xs sm:text-sm">
											Start a conversation by asking a question below
										</p>
									</div>
								</div>
							) : (
								<div className="space-y-3 sm:space-y-4">
									{messages.map((message) => (
										<div
											key={message.id}
											className={`flex gap-2 sm:gap-3 ${
												message.role === "user"
													? "justify-end"
													: "justify-start"
											}`}
										>
											{message.role === "assistant" && (
												<Avatar className="h-6 w-6 sm:h-8 sm:w-8 shrink-0">
													<AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
														AI
													</AvatarFallback>
												</Avatar>
											)}
											<div
												className={`max-w-[85%] sm:max-w-[70%] rounded-lg px-3 sm:px-4 py-2 ${
													message.role === "user"
														? "bg-primary text-primary-foreground"
														: "bg-muted"
												}`}
											>
												{message.role === "user" ? (
													<p className="whitespace-pre-wrap text-sm sm:text-base">
														{message.content}
													</p>
												) : (
													<div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-pre:p-0">
														<ReactMarkdown
															remarkPlugins={[remarkGfm]}
															components={{
																p: ({ children }) => (
																	<p className="mb-2 last:mb-0 text-sm sm:text-base">
																		{children}
																	</p>
																),
																ul: ({ children }) => (
																	<ul className="my-2 list-disc list-inside text-sm sm:text-base">
																		{children}
																	</ul>
																),
																ol: ({ children }) => (
																	<ol className="my-2 list-decimal list-inside text-sm sm:text-base">
																		{children}
																	</ol>
																),
																li: ({ children }) => (
																	<li className="mb-1">{children}</li>
																),
																code: ({ className, children }) => {
																	const match = /language-(\w+)/.exec(
																		className || "",
																	);
																	return match ? (
																		<code
																			className={`${className} block bg-black/10 dark:bg-white/10 p-2 rounded text-xs overflow-x-auto`}
																		>
																			{children}
																		</code>
																	) : (
																		<code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-xs">
																			{children}
																		</code>
																	);
																},
																strong: ({ children }) => (
																	<strong className="font-bold">
																		{children}
																	</strong>
																),
																em: ({ children }) => (
																	<em className="italic">{children}</em>
																),
															}}
														>
															{message.content}
														</ReactMarkdown>
													</div>
												)}
											</div>
											{message.role === "user" && (
												<Avatar className="h-6 w-6 sm:h-8 sm:w-8 shrink-0">
													<AvatarFallback className="bg-secondary text-xs sm:text-sm">
														You
													</AvatarFallback>
												</Avatar>
											)}
										</div>
									))}
									{isLoading && (
										<div className="flex gap-2 sm:gap-3 justify-start">
											<Avatar className="h-6 w-6 sm:h-8 sm:w-8 shrink-0">
												<AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
													AI
												</AvatarFallback>
											</Avatar>
											<div className="bg-muted rounded-lg px-3 sm:px-4 py-2">
												<p className="text-muted-foreground text-sm">
													Thinking...
												</p>
											</div>
										</div>
									)}
									<div ref={messagesEndRef} />
								</div>
							)}
						</ScrollArea>
					</Card>
				</div>

				{/* Input Area */}
				<div className="pb-2 sm:pb-4 space-y-2">
					<form onSubmit={handleSubmit} className="flex gap-2">
						<Textarea
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Ask a question about your legal documents..."
							className="min-h-[55px] sm:min-h-[55px] max-h-[200px] resize-none text-sm sm:text-base"
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									handleSubmit(e);
								}
							}}
						/>
						<Button
							type="submit"
							size="icon"
							disabled={!input.trim() || isLoading}
							className="h-[55px] w-[55px] sm:h-[55px] sm:w-[55px] shrink-0"
						>
							<Send className="h-4 w-4 sm:h-5 sm:w-5" />
						</Button>
					</form>
				</div>
			</div>
		</div>
	);
}
