"use client";

import { useState } from "react";

export default function PlanStudentsModal({
  plans,
  bookings,
  seats,
  onClose,
}) {
  const [selectedPlanId, setSelectedPlanId] = useState("all");

  const filteredBookings =
    selectedPlanId === "all"
      ? bookings
      : bookings.filter(
          (booking) =>
            String(booking.planId?._id || booking.planId) ===
            String(selectedPlanId)
        );

  function getSeatNumber(booking) {
    // If seatId is populated
    if (booking.seatId?.seatNumber) {
      return booking.seatId.seatNumber;
    }

    // Fallback if only seatId is available
    const seat = seats.find(
      (s) => String(s._id) === String(booking.seatId)
    );

    return seat?.seatNumber || "-";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-2xl font-bold">
              Students by Plan
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              View students and their assigned seats
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-2xl"
          >
            ×
          </button>
        </div>

        {/* Plan Filters */}
        <div className="flex gap-2 overflow-x-auto p-4 border-b shrink-0">
          <button
            onClick={() => setSelectedPlanId("all")}
            className={`px-4 py-2 rounded-full whitespace-nowrap border ${
              selectedPlanId === "all"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            All Plans
          </button>

          {plans.map((plan) => (
            <button
              key={plan._id}
              onClick={() => setSelectedPlanId(plan._id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap border ${
                String(selectedPlanId) === String(plan._id)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              {plan.name}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1 min-h-0">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="text-left p-3">Seat</th>
                <th className="text-left p-3">Student</th>
                <th className="text-left p-3">Phone</th>
                <th className="text-left p-3">Plan</th>
                <th className="text-left p-3">Time</th>
                <th className="text-left p-3">Monthly Fee</th>
              </tr>
            </thead>

            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-10 text-center text-gray-500"
                  >
                    No students found for this plan.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr
                    key={booking._id}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="p-3">
                      <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 font-bold rounded-lg px-3 py-1">
                        {getSeatNumber(booking)}
                      </span>
                    </td>

                    <td className="p-3 font-semibold">
                      {booking.studentName}
                    </td>

                    <td className="p-3">
                      {booking.phone}
                    </td>

                    <td className="p-3">
                      {booking.planId?.name || "-"}
                    </td>

                    <td className="p-3">
                      {booking.startTime} - {booking.endTime}
                    </td>

                    <td className="p-3 font-semibold">
                      ₹{booking.monthlyFee || booking.planId?.monthlyFee || 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-800">
              {filteredBookings.length}
            </span>{" "}
            student
            {filteredBookings.length !== 1 ? "s" : ""}
          </p>

          <button
            onClick={onClose}
            className="bg-gray-800 text-white px-5 py-2 rounded-lg hover:bg-gray-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}