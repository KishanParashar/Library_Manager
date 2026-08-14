"use client";

import { useState } from "react";

export default function EditBookingModal({
  booking,
  seatNumber,
  seats,
  plans,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState({
    studentName: booking.studentName,
    phone: booking.phone,
    seatId: String(booking.seatId),
    planId: String(booking.planId._id),
  });

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch(`/api/bookings/${booking._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
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
      <div className="bg-white rounded-xl p-6 w-[450px]">
        <h2 className="text-2xl font-bold mb-4">
          Edit Booking - Seat {seatNumber}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">
              Student Name
            </label>

            <input
              type="text"
              className="border w-full p-2 rounded"
              value={form.studentName}
              onChange={(e) =>
                setForm({
                  ...form,
                  studentName: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Phone Number
            </label>

            <input
              type="text"
              className="border w-full p-2 rounded"
              value={form.phone}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Seat
            </label>

            <select
              className="border w-full p-2 rounded"
              value={form.seatId}
              onChange={(e) =>
                setForm({
                  ...form,
                  seatId: e.target.value,
                })
              }
            >
              {seats.map((seat) => (
                <option
                  key={seat._id}
                  value={seat._id}
                >
                  Seat {seat.seatNumber}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Plan
            </label>

            <select
              className="border w-full p-2 rounded"
              value={form.planId}
              onChange={(e) =>
                setForm({
                  ...form,
                  planId: e.target.value,
                })
              }
            >
              {plans.map((plan) => (
                <option
                  key={plan._id}
                  value={plan._id}
                >
                  {plan.name} ({plan.startTime} - {plan.endTime})
                </option>
              ))}
            </select>
          </div>

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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}