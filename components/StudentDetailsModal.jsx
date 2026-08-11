"use client";

export default function StudentDetailsModal({ seat, onClose, onDelete }) {
  const student = seat.studentId;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96">
        <h2 className="text-xl font-bold mb-4">
          Seat {seat.seatNumber} Details
        </h2>

        <div className="space-y-2">
          <p>
            <strong>Name:</strong> {student?.name}
          </p>
          <p>
            <strong>Phone:</strong> {student?.phone}
          </p>
          <p>
            <strong>Monthly Fee:</strong> ₹{student?.monthlyFee}
          </p>
          <p>
            <strong>Join Date:</strong> {new Date(student?.joinDate).toLocaleDateString()}
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
            Delete Student
          </button>
        </div>
      </div>
    </div>
  );
}