import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">Library Seat Manager</h1>
      <p className="text-gray-600">
        Manage library seats, students, and subscriptions
      </p>

      <div className="flex gap-4">
        <Link
          href="/register"
          className="px-5 py-3 rounded-lg bg-black text-white"
        >
          Register Library
        </Link>

        <Link
          href="/login"
          className="px-5 py-3 rounded-lg border"
        >
          Login
        </Link>
      </div>
    </main>
  );
}