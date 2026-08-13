"use client";

import { useState } from "react";
import StudentModal from "./StudentModal";
import StudentDetailsModal from "./StudentDetailsModal";

export default function SeatGrid({
  seats,
  bookings,
  activePlanId,
}) {
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [viewBooking, setViewBooking] = useState(null);

  // Find booking for a seat in the currently active plan
  function getBookingForSeat(seatId) {
    return bookings.find(
      (booking) =>
        String(booking.seatId) === String(seatId) &&
        String(booking.planId?._id || booking.planId) ===
          String(activePlanId)
    );
  }

  async function handleSeatClick(seat) {
    const booking = getBookingForSeat(seat._id);

    // Available seat
    if (!booking) {
      setSelectedSeat(seat);
      return;
    }

    // Occupied seat
    setViewBooking({
      booking,
      seatNumber: seat.seatNumber,
    });
  }

  async function handleDeleteBooking() {
    const res = await fetch(
      `/api/bookings/${viewBooking.booking._id}`,
      {
        method: "DELETE",
      }
    );

    const data = await res.json();

    if (data.success) {
      setViewBooking(null);
      window.location.reload();
    } else {
      alert(data.message);
    }
  }

  return (
    <>
      <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
        {seats.map((seat) => {
          const booking = getBookingForSeat(seat._id);

          return (
            <div
              key={seat._id}
              onClick={() => handleSeatClick(seat)}
              className={`cursor-pointer h-14 w-14 rounded-lg flex items-center justify-center text-white font-bold transition ${
                booking
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {seat.seatNumber}
            </div>
          );
        })}
      </div>

      {/* Add Booking Modal */}
      {selectedSeat && (
        <StudentModal
          seat={selectedSeat}
          activePlanId={activePlanId}
          onClose={() => setSelectedSeat(null)}
          onSuccess={() => {
            setSelectedSeat(null);
            window.location.reload();
          }}
        />
      )}

      {/* Booking Details Modal */}
      {viewBooking && (
        <StudentDetailsModal
          booking={viewBooking.booking}
          seatNumber={viewBooking.seatNumber}
          onClose={() => setViewBooking(null)}
          onDelete={handleDeleteBooking}
        />
      )}
    </>
  );
}