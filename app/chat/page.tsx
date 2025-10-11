import { redirect } from "next/navigation";
import  { unPDFTest}  from "@/lib/pdftest";
import { createClient } from "@/lib/supabase/server";

export default async function ChatPage() {
	const supabase = await createClient();
  const text = await unPDFTest("/home/wavefire/development/utsbi/legal-rag/Legal/All Site Files/enTouch Preferred Wiring Standard.pdf");

	const { data, error } = await supabase.auth.getClaims();
	if (error || !data?.claims) {
		redirect("/");
	}

	return (
		<div className="flex-1 w-full flex flex-col gap-12">
			<div>{text}</div>
		</div>
	);
}
