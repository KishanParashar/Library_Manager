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
                <h2 className="text-2xl font-bold mb-4">
                    Pending Fee Students
                </h2>

                <div className="bg-white border rounded-xl overflow-hidden">
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
    );
}