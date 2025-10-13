import Link from "next/link";
import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { hasEnvVars } from "@/lib/utils";

export default function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<main className="h-screen flex flex-col items-center overflow-hidden">
			<nav className="w-full flex justify-center border-b border-b-foreground/10 h-14 sm:h-16">
				<div className="w-full max-w-5xl flex justify-between items-center p-2 px-3 sm:p-3 sm:px-5 text-xs sm:text-sm">
					<div className="flex items-center font-semibold">
						<Link href={"/"} className="text-sm sm:text-base pr-5 md:pr-0">
							SBI Legal Chatbot
						</Link>
					</div>
					{!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
				</div>
			</nav>
			<div className="flex-1 w-full overflow-hidden">{children}</div>
		</main>
	);
}
