"use client";

import { useState } from "react";
import StudentModal from "./StudentModal";
import StudentDetailsModal from "./StudentDetailsModal";

export default function SeatGrid({
  seats,
  bookings,
  plans,
  activePlanId,
  offers,
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

  function getSeatState(seatId) {
    const seatBookings = bookings.filter(
      (b) => String(b.seatId?._id || b.seatId) === String(seatId)
    );

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
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-5 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span>Available</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>Booked</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span>Overlap</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-400"></div>
          <span>Unavailable</span>
        </div>
      </div>

      {/* Seat Grid */}
      <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
        {seats.map((seat) => {
          const seatState = getSeatState(seat._id);

          return (
            <div
              key={seat._id}
              onClick={() => handleSeatClick(seat)}
              className={`group cursor-pointer h-16 w-16 md:h-20 md:w-20 rounded-xl md:rounded-2xl p-2 md:p-3 flex flex-col justify-between transition-all duration-200 border shadow-md
  ${!seat.isAvailable
                  ? "bg-slate-300 border-slate-400 text-slate-700"
                  : seatState.state === "booked"
                    ? "bg-gradient-to-br from-red-500 to-rose-600 border-red-300 text-white hover:scale-105 hover:shadow-xl"
                    : seatState.state === "blocked"
                      ? "bg-gradient-to-br from-amber-400 to-orange-500 border-amber-300 text-white hover:scale-105 hover:shadow-xl"
                      : "bg-gradient-to-br from-emerald-400 to-green-600 border-emerald-300 text-white hover:scale-105 hover:shadow-xl"
                }`}
            >
              {/* Chair icon */}
              <div className="text-sm md:text-lg">💺</div>

              <div className="text-sm md:text-lg font-bold leading-none">
                {seat.seatNumber}
              </div>
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
          offers={offers}
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