"use client";

import { useState } from "react";
import AddSeatsModal from "./AddSeatsModal";

export default function DashboardHeader({ library }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{library.name}</h1>
          <p className="text-gray-600">
            Total Seats: {library.totalSeats}
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded-lg"
        >
          + Add Seats
        </button>
      </div>

      {open && (
        <AddSeatsModal
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            window.location.reload();
          }}
        />
      )}
    </>
  );
}