"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (data.success) {
      router.push("/dashboard");
    } else {
      alert(data.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <form
        onSubmit={handleSubmit}
        className="bg-white border p-6 rounded-xl shadow-md w-80 space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full rounded"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full rounded"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        <button
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
          type="submit"
        >
          Login
        </button>
      </form>
    </div>
  );
}