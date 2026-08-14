"use client";

import { useState } from "react";
import StudentModal from "./StudentModal";
import StudentDetailsModal from "./StudentDetailsModal";

export default function SeatGrid({
  seats,
  bookings,
  plans,
  activePlanId,
}) {
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [viewBooking, setViewBooking] = useState(null);


  function toMinutes(time) {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  }

  const activePlan = plans.find(
    (p) => String(p._id) === String(activePlanId)
  );
  // Find booking for a seat in the currently active plan
  function getSeatState(seatId) {
    const seatBookings = bookings.filter(
      (b) => String(b.seatId) === String(seatId)
    );

    // Exact booking in current plan -> RED
    const exactBooking = seatBookings.find(
      (b) =>
        String(b.planId?._id || b.planId) ===
        String(activePlanId)
    );

    if (exactBooking) {
      return {
        state: "booked",
        booking: exactBooking,
      };
    }

    // Check overlap -> ORANGE
    if (activePlan) {
      const newStart = toMinutes(activePlan.startTime);
      const newEnd = toMinutes(activePlan.endTime);

      const overlappingBooking = seatBookings.find((b) => {
        const existingStart = toMinutes(b.startTime);
        const existingEnd = toMinutes(b.endTime);

        return (
          newStart < existingEnd &&
          newEnd > existingStart
        );
      });

      if (overlappingBooking) {
        return {
          state: "blocked",
          booking: overlappingBooking,
        };
      }
    }

    return {
      state: "available",
      booking: null,
    };
  }

  async function handleSeatClick(seat) {
    // No plan selected / no plans created
    if (!seat.isAvailable) {
      alert("This seat is currently unavailable.");
      return;
    }

    if (!activePlanId) {
      alert("Please create a plan first before adding a student.");
      return;
    }

    const seatState = getSeatState(seat._id);

    if (seatState.state === "available") {
      setSelectedSeat(seat);
      return;
    }

    if (seatState.state === "booked") {
      setViewBooking({
        booking: seatState.booking,
        seatNumber: seat.seatNumber,
      });
      return;
    }

    if (seatState.state === "blocked") {
      alert(
        `Seat ${seat.seatNumber} is blocked because it overlaps with ${seatState.booking.startTime} - ${seatState.booking.endTime}.`
      );
    }
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
          const seatState = getSeatState(seat._id);

          return (
            <div
              key={seat._id}
              onClick={() => handleSeatClick(seat)}
              className={`cursor-pointer h-14 w-14 rounded-lg flex items-center justify-center text-white font-bold transition ${!seat.isAvailable
                ? "bg-gray-500 hover:bg-gray-600"
                : seatState.state === "booked"
                  ? "bg-red-500 hover:bg-red-600"
                  : seatState.state === "blocked"
                    ? "bg-gradient-to-r from-red-500 to-green-500 hover:bg-orange-600"
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
          seats={seats}
          plans={plans}
          onClose={() => setViewBooking(null)}
          onDelete={handleDeleteBooking}
          onRefresh={() => {
            setViewBooking(null);
            window.location.reload();
          }}
        />
      )}
    </>
  );
}