import { DotLoader } from "react-spinners";

export default function Page() {
	return (
		<div className="flex min-h-svh w-full items-center justify-center">
			<div className="flex flex-row items-center">
				<DotLoader size={40} color="white" />
				<span className="text-white text-lg pl-5">Loading...</span>
			</div>
		</div>
	);
}
