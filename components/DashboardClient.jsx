"use client";

import { useState } from "react";
import DashboardHeader from "./DashboardHeader";
import SeatGrid from "./SeatGrid";

export default function DashboardClient({
    library,
    plans,
    seats,
    bookings,
}) {
    const [activePlanId, setActivePlanId] = useState(
        plans.length > 0 ? plans[0]._id : null
    );

    return (
        <div className="p-10">
            <DashboardHeader
                library={library}
                plans={plans}
                activePlanId={activePlanId}
                onPlanChange={setActivePlanId}
            />

            <SeatGrid
                seats={seats}
                bookings={bookings}
                activePlanId={activePlanId}
            />
        </div>
    );
}