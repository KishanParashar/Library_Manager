"use client";

import { useState } from "react";

export default function AddPlanModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    startTime: "",
    endTime: "",
    monthlyFee: "",
  });

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch("/api/plans", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form.name,
        startTime: form.startTime,
        endTime: form.endTime,
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
        <h2 className="text-xl font-bold mb-4">Create Plan</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Plan Name (Morning, Full Day...)"
            className="border w-full p-2 rounded"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="time"
              className="border w-full p-2 rounded"
              value={form.startTime}
              onChange={(e) =>
                setForm({ ...form, startTime: e.target.value })
              }
            />

            <input
              type="time"
              className="border w-full p-2 rounded"
              value={form.endTime}
              onChange={(e) =>
                setForm({ ...form, endTime: e.target.value })
              }
            />
          </div>

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
              className="border px-4 py-2 rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Save Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}