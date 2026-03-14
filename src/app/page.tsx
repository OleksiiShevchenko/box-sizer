import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-lg">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Box Sizer</h1>
        <p className="text-lg text-gray-600 mb-8">
          Find the perfect shipping box for your products. Enter dimensions,
          and we&apos;ll calculate the optimal box size for you.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-900 font-medium hover:bg-gray-50"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
