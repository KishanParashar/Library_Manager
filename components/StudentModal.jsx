"use client";

import { useState } from "react";

export default function StudentModal({ seat, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    monthlyFee: "",
  });

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch("/api/student", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        seatId: seat._id,
        name: form.name,
        phone: form.phone,
        monthlyFee: Number(form.monthlyFee),
      }),
    });

    const data = await res.json();

    if (data.success) {
      onSuccess();
    } else {
      alert(data.message);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96">
        <h2 className="text-xl font-bold mb-4">
          Add Student - Seat {seat.seatNumber}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Student Name"
            className="border w-full p-2 rounded"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Phone Number"
            className="border w-full p-2 rounded"
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Monthly Fee"
            className="border w-full p-2 rounded"
            value={form.monthlyFee}
            onChange={(e) =>
              setForm({ ...form, monthlyFee: e.target.value })
            }
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="border cursor-pointer px-4 py-2 rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-green-600 cursor-pointer text-white px-4 py-2 rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}