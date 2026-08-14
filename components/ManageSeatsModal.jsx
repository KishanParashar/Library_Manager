"use client";

export default function ManageSeatsModal({
  seats,
  onClose,
  onRefresh,
}) {
  async function toggleAvailability(seat) {
    const currentAvailability = seat.isAvailable !== false;

    const res = await fetch(`/api/seats/${seat._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isAvailable: !currentAvailability,
      }),
    });

    const data = await res.json();

    if (data.success) {
      onRefresh();
    } else {
      alert(data.message);
    }
  }

  async function deleteSeat(seat) {
    const confirmDelete = confirm(
      `Delete Seat ${seat.seatNumber}?`
    );

    if (!confirmDelete) return;

    const res = await fetch(`/api/seats/${seat._id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (data.success) {
      onRefresh();
    } else {
      alert(data.message);
    }
  }

  const lastSeatNumber =
    seats.length > 0
      ? Math.max(...seats.map((s) => s.seatNumber))
      : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[500px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Manage Seats</h2>

          <button
            onClick={onClose}
            className="text-gray-500 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {seats.map((seat) => {
            const isAvailable = seat.isAvailable !== false;

            return (
              <div
                key={seat._id}
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-bold text-lg">
                    Seat {seat.seatNumber}
                  </h3>

                  <p className="text-gray-600">
                    {isAvailable
                      ? "Available"
                      : "Unavailable"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAvailability(seat)}
                    className={`px-4 py-2 rounded-lg text-white ${
                      isAvailable
                        ? "bg-gray-600 hover:bg-gray-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {isAvailable
                      ? "Mark Unavailable"
                      : "Mark Available"}
                  </button>

                  {seat.seatNumber === lastSeatNumber && (
                    <button
                      onClick={() => deleteSeat(seat)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {seats.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              No seats available
            </p>
          )}
        </div>
      </div>
    </div>
  );
}