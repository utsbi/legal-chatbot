"use client";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import { DotLoader } from "react-spinners";
import { LoginForm } from "@/components/login-form";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const checkAuth = async () => {
			const supabase = createClient();
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (session) {
				router.replace("/chat");
			} else {
				setIsLoading(false);
			}
		};

		checkAuth();
	}, [router]);

	if (isLoading) {
		return (
			<div className="flex min-h-svh w-full items-center justify-center">
				<div className="flex flex-col items-center">
					<DotLoader size={40} color="#4B5563" />
					<span className="text-gray-600 text-lg">Loading...</span>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm">
				<LoginForm />
			</div>
		</div>
	);
}
