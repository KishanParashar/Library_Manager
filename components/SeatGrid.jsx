"use client";

import { useState } from "react";
import StudentModal from "./StudentModal";
import StudentDetailsModal from "./StudentDetailsModal";
export default function SeatGrid({ seats }) {
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [viewSeat, setViewSeat] = useState(null);

    async function handleSeatClick(seat) {
        console.log(seat);

        // Available seat
        if (seat.status === "available") {
            setSelectedSeat(seat);
            return;
        }

        // Occupied seat
        if (seat.status === "occupied") {
            setViewSeat(seat);
            return;
        }
    }

    async function handleDeleteStudent() {
        const res = await fetch(`/api/student/${viewSeat._id}`, {
            method: "DELETE",
        });

        const data = await res.json();

        if (data.success) {
            setViewSeat(null);
            window.location.reload();
        } else {
            alert(data.message);
        }
    }

    return (
        <>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                {seats.map((seat) => (
                    <div
                        key={seat._id}
                        onClick={() => handleSeatClick(seat)}
                        className={`cursor-pointer h-14 w-14 rounded-lg flex items-center justify-center text-white font-bold transition ${seat.status === "available"
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-red-500 hover:bg-red-600"
                            }`}
                    >
                        {seat.seatNumber}
                    </div>
                ))}
            </div>

            {selectedSeat && (
                <StudentModal
                    seat={selectedSeat}
                    onClose={() => setSelectedSeat(null)}
                    onSuccess={() => {
                        setSelectedSeat(null);
                        window.location.reload();
                    }}
                />
            )}

            {viewSeat && (
                <StudentDetailsModal
                    seat={viewSeat}
                    onClose={() => setViewSeat(null)}
                    onDelete={handleDeleteStudent}
                />
            )}
        </>
    );
}