"use client";

export default function StudentDetailsModal({
  booking,
  seatNumber,
  onClose,
  onDelete,
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
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
            <strong>Join Date:</strong> {new Date(booking.joinDate).toLocaleDateString()}
          </p>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="border cursor-pointer px-4 py-2 rounded"
          >
            Close
          </button>

          <button
            onClick={onDelete}
            className="bg-red-600 cursor-pointer text-white px-4 py-2 rounded"
          >
            Delete Booking
          </button>
        </div>
      </div>
    </div>
  );
}