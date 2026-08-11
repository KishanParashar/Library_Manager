"use client";

import { useState } from "react";

export default function AddSeatsModal({ onClose, onSuccess }) {
  const [count, setCount] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch("/api/seats/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        count: Number(count),
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
      <div className="bg-white rounded-xl p-6 w-80">
        <h2 className="text-xl font-bold mb-4">Add New Seats</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="number"
            min="1"
            placeholder="Number of seats"
            className="border w-full p-2 rounded"
            value={count}
            onChange={(e) => setCount(e.target.value)}
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="border cursor-pointer px-4 py-2 rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded"
            >
              Add Seats
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}