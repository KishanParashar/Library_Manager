"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    ownerName: "",
    email: "",
    password: "",
    totalSeats: "",
  });

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (data.success) {
      alert("Library registered successfully!");
      router.push("/login");
    } else {
      alert(data.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-96 space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">
          Register Library
        </h1>

        <input
          type="text"
          placeholder="Library Name"
          className="border w-full p-2 rounded"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          type="text"
          placeholder="Owner Name"
          className="border w-full p-2 rounded"
          value={form.ownerName}
          onChange={(e) =>
            setForm({ ...form, ownerName: e.target.value })
          }
        />

        <input
          type="email"
          placeholder="Email"
          className="border w-full p-2 rounded"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="border w-full p-2 rounded"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <input
          type="number"
          placeholder="Total Seats"
          className="border w-full p-2 rounded"
          value={form.totalSeats}
          onChange={(e) =>
            setForm({ ...form, totalSeats: e.target.value })
          }
        />

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded"
        >
          Register Library
        </button>
      </form>
    </div>
  );
}