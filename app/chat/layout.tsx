import Link from "next/link";
import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";

export default function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<main className="h-screen flex flex-col items-center overflow-hidden">
			<nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
				<div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
					<div className="flex gap-5 items-center font-semibold">
						<Link href={"/"}>SBI Legal Chatbot</Link>
						<ThemeSwitcher />
					</div>
					{!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
				</div>
			</nav>
			<div className="flex-1 w-full overflow-hidden">{children}</div>
		</main>
	);
}
