"use client";

import { useState } from "react";
import DashboardHeader from "./DashboardHeader";
import SeatGrid from "./SeatGrid";

export default function DashboardClient({
    library,
    plans,
    seats,
    bookings,
    stats,
    pendingStudents,
    selectedMonth,
}) {
    const [activePlanId, setActivePlanId] = useState(
        plans.length > 0 ? plans[0]._id : null
    );
    const [currentReminderIndex, setCurrentReminderIndex] = useState(0);

    const unsentReminders = pendingStudents.filter(
        (student) =>
            !student.reminderHistory?.includes(selectedMonth)
    );

    async function sendNextReminder() {
        if (unsentReminders.length === 0) {
            alert("All reminders have already been sent for this month.");
            return;
        }

        const student = unsentReminders[0];
        const phone = String(student.phone).replace(/\D/g, "");

        const message = `Hello ${student.studentName},

This is a reminder from ${library.name}.

Your library fee for ${selectedMonth} is pending.

Plan: ${student.planName}
Amount: ₹${student.monthlyFee}

Please pay at your earliest convenience.

Thank you.`;

        window.open(
            `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`,
            "_blank"
        );

        await fetch(`/api/bookings/${student._id}/reminder`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ month: selectedMonth }),
        });

        window.location.reload();
    }
    return (
        <div className="p-10">
            <DashboardHeader
                library={library}
                plans={plans}
                seats={seats}
                stats={stats}
                selectedMonth={selectedMonth}
                activePlanId={activePlanId}
                onPlanChange={setActivePlanId}
            />

            <SeatGrid
                seats={seats}
                bookings={bookings}
                plans={plans}
                activePlanId={activePlanId}
            />

            <div className="mt-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">
                        Pending Fee Students
                    </h2>

                    {pendingStudents.length > 0 && (
                        <button
                            onClick={sendNextReminder}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                        >
                            {unsentReminders.length === 0
                                ? "All Reminders Sent"
                                : `Send Next Reminder (${unsentReminders.length} left)`}
                        </button>
                    )}
                </div>

                <div className="bg-white border rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="text-left p-3">Seat</th>
                                    <th className="text-left p-3">Student</th>
                                    <th className="text-left p-3">Phone</th>
                                    <th className="text-left p-3">Plan</th>
                                    <th className="text-left p-3">Fee</th>
                                </tr>
                            </thead>

                            <tbody>
                                {pendingStudents.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="p-6 text-center text-gray-500"
                                        >
                                            All students have paid for this month 🎉
                                        </td>
                                    </tr>
                                ) : (
                                    pendingStudents.map((student) => (
                                        <tr
                                            key={student._id}
                                            className="border-t hover:bg-gray-50"
                                        >
                                            <td className="p-3">{student.seatNumber}</td>
                                            <td className="p-3 font-medium">
                                                {student.studentName}
                                            </td>
                                            <td className="p-3">{student.phone}</td>
                                            <td className="p-3">{student.planName}</td>
                                            <td className="p-3 font-semibold">
                                                ₹{student.monthlyFee}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}