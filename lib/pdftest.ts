import { readFile } from "node:fs/promises";
import { PDFParse } from "pdf-parse";
import { extractText, getDocumentProxy } from "unpdf";

export async function pdfParseTest(path: string) {
	const buffer = await readFile(path);
	const parser = new PDFParse({ data: buffer });
	const textResult = await parser.getText();
	await parser.destroy();
	return textResult;
}

export async function unPDFTest(path: string) {
	const buffer = await readFile(path);

	// Then, load the PDF file into a PDF.js document
	const pdf = await getDocumentProxy(new Uint8Array(buffer));

	// Finally, extract the text from the PDF file
	const { totalPages, text } = await extractText(pdf, { mergePages: false });

	console.log(`Total pages: ${totalPages}`);
	console.log(text);
	return text;
}
