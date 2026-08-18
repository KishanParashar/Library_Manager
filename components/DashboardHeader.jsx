"use client";

import { useState } from "react";
import AddSeatsModal from "./AddSeatsModal";
import AddPlanModal from "./AddPlanModal";
import ManagePlansModal from "./ManagePlansModal";
import ManageSeatsModal from "./ManageSeatsModal";
import { useRouter, useSearchParams } from "next/navigation";
import PlanStudentsModal from "./PlanStudentsModal";
import AddOfferModal from "./AddOfferModal";
import ManageOffersModal from "./ManageOffersModal";
import RegistrationListModal from "./RegistrationListModal";

export default function DashboardHeader({
  library,
  plans,
  seats,
  bookings,
  stats,
  selectedMonth,
  activePlanId,
  onPlanChange,
  offers,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleMonthChange(e) {
    const month = e.target.value;

    const params = new URLSearchParams(searchParams.toString());

    if (month) {
      params.set("month", month);
    } else {
      params.delete("month");
    }

    router.push(`/dashboard?${params.toString()}`);
  }

  const [openSeats, setOpenSeats] = useState(false);
  const [openPlan, setOpenPlan] = useState(false);
  const [openManagePlans, setOpenManagePlans] = useState(false);
  const [openManageSeats, setOpenManageSeats] = useState(false);
  const [openPlanStudents, setOpenPlanStudents] = useState(false);
  const [openOffer, setOpenOffer] = useState(false);
  const [openManageOffers, setOpenManageOffers] = useState(false);
  const [openRegistrations, setOpenRegistrations] = useState(false);

  return (
    <>
      <div className="mb-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">{library.name}</h1>
            <p className="text-gray-600">
              Total Seats: {library.totalSeats}
            </p>
            <p className="text-gray-600">
              Payment analytics for selected month
            </p>
          </div>

          {/* Month Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Month
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white border rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-500">Total Students</p>
              <h3 className="text-2xl font-bold">
                {stats.totalStudents}
              </h3>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4 shadow-sm">
              <p className="text-sm text-green-700">Paid</p>
              <h3 className="text-2xl font-bold text-green-700">
                {stats.paidStudents}
              </h3>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
              <p className="text-sm text-red-700">Unpaid</p>
              <h3 className="text-2xl font-bold text-red-700">
                {stats.unpaidStudents}
              </h3>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm">
              <p className="text-sm text-blue-700">Collection</p>
              <h3 className="text-2xl font-bold text-blue-700">
                ₹{stats.totalCollection}
              </h3>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 shadow-sm">
              <p className="text-sm text-orange-700">Pending</p>
              <h3 className="text-2xl font-bold text-orange-700">
                ₹{stats.pendingCollection}
              </h3>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setOpenPlan(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg"
          >
            + Add Plan
          </button>
          <button
            onClick={() => setOpenOffer(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
          >
            + Add Offer
          </button>

          <button
            onClick={() => setOpenSeats(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            + Add Seats
          </button>
          <button
            onClick={() => setOpenManagePlans(true)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            Manage Plans
          </button>
          <button
            onClick={() => setOpenManageOffers(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
          >
            Manage Offers
          </button>



          <button
            onClick={() => setOpenManageSeats(true)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg"
          >
            Manage Seats
          </button>
          <button
            onClick={() => setOpenPlanStudents(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            👥 Students by Plan
          </button>
          <button
            onClick={() => setOpenRegistrations(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
          >
            📋 Registration List
          </button>
        </div>
      </div>

      {/* Plan Selector */}
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

      {/* Add Seats Modal */}
      {openSeats && (
        <AddSeatsModal
          onClose={() => setOpenSeats(false)}
          onSuccess={() => {
            setOpenSeats(false);
            window.location.reload();
          }}
        />
      )}

      {/* Add Plan Modal */}
      {openPlan && (
        <AddPlanModal
          onClose={() => setOpenPlan(false)}
          onSuccess={() => {
            setOpenPlan(false);
            window.location.reload();
          }}
        />
      )}

      {/* Manage Plans Modal */}
      {openManagePlans && (
        <ManagePlansModal
          plans={plans}
          onClose={() => setOpenManagePlans(false)}
          onRefresh={() => {
            setOpenManagePlans(false);
            window.location.reload();
          }}
        />
      )}

      {/* Manage Seats Modal */}
      {openManageSeats && (
        <ManageSeatsModal
          seats={seats}
          onClose={() => setOpenManageSeats(false)}
          onRefresh={() => {
            setOpenManageSeats(false);
            window.location.reload();
          }}
        />
      )}
      {/* Students by Plan Modal */}
      {openPlanStudents && (
        <PlanStudentsModal
          plans={plans}
          bookings={bookings}
          seats={seats}
          onClose={() => setOpenPlanStudents(false)}
        />
      )}
      {openOffer && (
        <AddOfferModal
          plans={plans}
          onClose={() => setOpenOffer(false)}
          onSuccess={() => {
            setOpenOffer(false);
            window.location.reload();
          }}
        />
      )}
      {openManageOffers && (
        <ManageOffersModal
          offers={offers}
          plans={plans}
          onClose={() => setOpenManageOffers(false)}
          onRefresh={() => {
            setOpenManageOffers(false);
            window.location.reload();
          }}
        />
      )}
      {openRegistrations && (
        <RegistrationListModal
          onClose={() => setOpenRegistrations(false)}
        />
      )}
    </>
  );
}