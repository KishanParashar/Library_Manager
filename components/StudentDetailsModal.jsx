"use client";

import { useEffect, useMemo, useState } from "react";
import EditBookingModal from "./EditBookingModal";

export default function StudentDetailsModal({
  booking,
  seatNumber,
  seats,
  plans,
  offers,
  onClose,
  onDelete,
  onRefresh,
}) {
  const [openEdit, setOpenEdit] = useState(false);

  const [payments, setPayments] = useState([]);

  const [showHistory, setShowHistory] = useState(false);

  const [showOffers, setShowOffers] = useState(false);
  const [offerLoading, setOfferLoading] = useState(false);

  useEffect(() => {
    async function loadPayments() {
      const res = await fetch(
        `/api/bookings/${booking._id}/payments`
      );

      const data = await res.json();

      if (data.success) {
        setPayments(data.payments);
      }
    }

    loadPayments();
  }, [booking._id]);

  async function handleToggleHistory() {
    setShowHistory(!showHistory);
  }

  const availableOffers = useMemo(() => {
    const today = new Date();

    return offers.filter((offer) => {
      const samePlan =
        String(offer.planId?._id || offer.planId) ===
        String(booking.planId?._id || booking.planId);

      const validFrom = new Date(offer.validFrom);
      const validUntil = new Date(offer.validUntil);

      return (
        samePlan &&
        offer.isActive &&
        today >= validFrom &&
        today <= validUntil
      );
    });
  }, [offers, booking.planId]);

  async function handleOfferPayment(offer) {
    const confirmed = confirm(
      `Apply "${offer.name}" for ₹${offer.offerPrice} for ${offer.durationMonths} months?`
    );

    if (!confirmed) return;

    try {
      setOfferLoading(true);

      const res = await fetch(
        `/api/bookings/${booking._id}/pay-offer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            offerId: offer._id,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert(
          `Offer payment successful!\nCovered: ${data.startMonth} to ${data.endMonth}`
        );

        onRefresh();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setOfferLoading(false);
    }
  }

  const currentMonth = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
  }, []);

  const isPaid = useMemo(() => {
    return payments.some((payment) => {
      // Normal monthly payment
      if (
        payment.paymentType === "monthly" ||
        !payment.paymentType
      ) {
        return payment.month === currentMonth;
      }

      // Offer payment
      if (payment.paymentType === "offer") {
        return (
          payment.startMonth <= currentMonth &&
          payment.endMonth >= currentMonth
        );
      }

      return false;
    });
  }, [payments, currentMonth]);

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
      <div className="fixed inset-0 bg-black/50 overflow-y-auto z-50 p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-md mx-auto my-8">
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
                        className="p-3 border-b last:border-b-0"
                      >
                        <div className="flex justify-between items-start gap-3">

                          <div>
                            {payment.paymentType === "offer" ? (
                              <>
                                <p className="font-semibold text-purple-700">
                                  {payment.offerId?.name ||
                                    "Offer Payment"}
                                </p>

                                <p className="text-sm text-gray-600 mt-1">
                                  Covers:{" "}
                                  <span className="font-medium">
                                    {payment.startMonth} →{" "}
                                    {payment.endMonth}
                                  </span>
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="font-medium">
                                  Monthly Fee
                                </p>

                                <p className="text-sm text-gray-500">
                                  Month: {payment.month}
                                </p>
                              </>
                            )}

                            <p className="text-xs text-gray-400 mt-1">
                              Paid on{" "}
                              {new Date(
                                payment.paidDate
                              ).toLocaleDateString("en-IN")}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="font-bold text-green-600">
                              ₹{payment.amount}
                            </p>

                            {payment.paymentType === "offer" && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                Offer
                              </span>
                            )}
                          </div>

                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-4">
            <button
              onClick={() => setShowOffers(!showOffers)}
              className="w-full bg-purple-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-purple-700"
            >
              {showOffers ? "Hide Offers" : "View Available Offers"}
            </button>

            {showOffers && (
              <div className="mt-3 space-y-3">
                {availableOffers.length === 0 ? (
                  <p className="text-sm text-gray-500 border rounded-lg p-3">
                    No active offers available for this plan.
                  </p>
                ) : (
                  availableOffers.map((offer) => (
                    <div
                      key={offer._id}
                      className="border border-purple-200 bg-purple-50 rounded-xl p-4"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <h3 className="font-bold">
                            {offer.name}
                          </h3>

                          <p className="text-sm text-gray-500">
                            {offer.durationMonths}{" "}
                            {offer.durationMonths === 1
                              ? "Month"
                              : "Months"}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-gray-400 line-through">
                            ₹{offer.regularAmount}
                          </p>

                          <p className="text-xl font-bold text-green-600">
                            ₹{offer.offerPrice}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-green-700 mt-2">
                        Save ₹
                        {offer.regularAmount - offer.offerPrice}
                      </p>

                      <button
                        onClick={() => handleOfferPayment(offer)}
                        disabled={offerLoading}
                        className="w-full mt-3 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                      >
                        {offerLoading
                          ? "Processing..."
                          : "Pay & Apply Offer"}
                      </button>
                    </div>
                  ))
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