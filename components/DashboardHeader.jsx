"use client";

import { useState } from "react";
import AddSeatsModal from "./AddSeatsModal";
import AddPlanModal from "./AddPlanModal";

export default function DashboardHeader({
  library,
  plans,
  activePlanId,
  onPlanChange,
}) {
  const [openSeats, setOpenSeats] = useState(false);
  const [openPlan, setOpenPlan] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{library.name}</h1>
          <p className="text-gray-600">
            Total Seats: {library.totalSeats}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setOpenPlan(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg"
          >
            + Add Plan
          </button>

          <button
            onClick={() => setOpenSeats(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            + Add Seats
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
        {plans.length === 0 ? (
          <p className="text-gray-500">No plans created yet</p>
        ) : (
          plans.map((plan) => (
            <button
              key={plan._id}
              onClick={() => onPlanChange(plan._id)}
              className={`px-4 py-2 rounded-full border whitespace-nowrap transition ${activePlanId === plan._id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white hover:bg-gray-100"
                }`}
            >
              {plan.name} ({plan.startTime}-{plan.endTime})
            </button>
          ))
        )}
      </div>

      {openSeats && (
        <AddSeatsModal
          onClose={() => setOpenSeats(false)}
          onSuccess={() => {
            setOpenSeats(false);
            window.location.reload();
          }}
        />
      )}

      {openPlan && (
        <AddPlanModal
          onClose={() => setOpenPlan(false)}
          onSuccess={() => {
            setOpenPlan(false);
            window.location.reload();
          }}
        />
      )}
    </>
  );
}