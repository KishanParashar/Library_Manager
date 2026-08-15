"use client";

import { useEffect, useMemo, useState } from "react";
import EditBookingModal from "./EditBookingModal";

export default function StudentDetailsModal({
  booking,
  seatNumber,
  seats,
  plans,
  onClose,
  onDelete,
  onRefresh,
}) {
  const [openEdit, setOpenEdit] = useState(false);

  const [payments, setPayments] = useState([]);

  const [showHistory, setShowHistory] = useState(false);

  async function handleToggleHistory() {
    if (!showHistory && payments.length === 0) {
      const res = await fetch(
        `/api/bookings/${booking._id}/payments`
      );

      const data = await res.json();

      if (data.success) {
        setPayments(data.payments);
      }
    }

    setShowHistory(!showHistory);
  }

  const currentMonth = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
  }, []);

  const isPaid = booking.lastPaidMonth === currentMonth;

  async function handleMarkPaid() {
    const res = await fetch(
      `/api/bookings/${booking._id}/pay`,
      {
        method: "PUT",
      }
    );
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Response:", data);
    if (data.success) {
      onRefresh();
    } else {
      alert(data.message);
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 overflow-auto  flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-96">
          <h2 className="text-xl font-bold mb-4">
            Seat {seatNumber} Details
          </h2>

          <div className="space-y-2">
            <p>
              <strong>Student:</strong> {booking.studentName}
            </p>

            <p>
              <strong>Phone:</strong> {booking.phone}
            </p>

            <p>
              <strong>Plan:</strong> {booking.planId.name}
            </p>

            <p>
              <strong>Time:</strong> {booking.planId.startTime} - {booking.planId.endTime}
            </p>

            <p>
              <strong>Monthly Fee:</strong> ₹{booking.planId.monthlyFee}
            </p>

            <p>
              <strong>Payment Status:</strong> {isPaid ? "Paid" : "Unpaid"}
            </p>

            <p>
              <strong>Last Paid Month:</strong> {booking.lastPaidMonth || "Never"}
            </p>

            <p>
              <strong>Last Paid Date:</strong> {booking.lastPaidDate
                ? new Date(booking.lastPaidDate).toLocaleDateString()
                : "Never"}
            </p>

            <p>
              <strong>Join Date:</strong> {new Date(booking.joinDate).toLocaleDateString()}
            </p>
          </div>

          <div className="mt-6">
            <button
              onClick={handleToggleHistory}
              className="w-full border rounded-lg px-4 py-2 font-medium hover:bg-gray-50"
            >
              {showHistory
                ? "Hide Payment History"
                : "View Payment History"}
            </button>

            {showHistory && (
              <div className="mt-3">
                {payments.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No payment history available.
                  </p>
                ) : (
                  <div className="border rounded-lg divide-y">
                    {payments.map((payment) => (
                      <div
                        key={payment._id}
                        className="p-3 flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium">
                            {payment.month}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(
                              payment.paidDate
                            ).toLocaleDateString()}
                          </p>
                        </div>

                        <p className="font-bold text-green-600">
                          ₹{payment.amount}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onClose}
              className="border cursor-pointer px-4 py-2 rounded"
            >
              Close
            </button>

            <button
              onClick={() => setOpenEdit(true)}
              className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded"
            >
              Edit
            </button>

            <button
              onClick={handleMarkPaid}
              className="bg-green-600 cursor-pointer text-white px-4 py-2 rounded"
            >
              Mark Current Month Paid
            </button>

            <button
              onClick={onDelete}
              className="bg-red-600 cursor-pointer text-white px-4 py-2 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {openEdit && (
        <EditBookingModal
          booking={booking}
          seatNumber={seatNumber}
          seats={seats}
          plans={plans}
          onClose={() => setOpenEdit(false)}
          onSuccess={() => {
            setOpenEdit(false);
            onRefresh();
          }}
        />
      )}
    </>
  );
}