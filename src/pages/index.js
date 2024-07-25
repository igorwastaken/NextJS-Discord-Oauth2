import Link from "next/link";
import { parseUser } from "@/utils/parse-user";

export async function getServerSideProps(context) {
	const user = parseUser(context);
	return {
		props: {
			user: user ? { ...user, logged: true } : { logged: false },
		},
	};
}
export default function Home({
	user
}) {
	return (
		<div className="w-full h-dvh flex flex-col justify-center items-center">
			{user.logged ? (<div className="flex">
				<p>Welcome {user.username}!</p>
			</div>) : (<div>
				<button className="p-3 bg-blue-700 rounded-lg text-center font-black text-xl hover:scale-[0.9] hover:opacity-[0.9] transition-all">
					<Link href="/api/auth/discord">
						Login
					</Link>
				</button>
			</div>)}
		</div>
	)
}
