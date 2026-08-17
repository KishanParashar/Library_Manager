"use client";

import { useState } from "react";

export default function ManageOffersModal({
  offers,
  plans,
  onClose,
  onRefresh,
}) {
  const [loadingId, setLoadingId] = useState(null);

  function getPlanName(planId) {
    const plan = plans.find(
      (p) => String(p._id) === String(planId?._id || planId)
    );

    return plan?.name || planId?.name || "Unknown Plan";
  }

  function formatDate(date) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  async function toggleOffer(offer) {
    try {
      setLoadingId(offer._id);

      const res = await fetch(`/api/offers/${offer._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !offer.isActive,
        }),
      });

      const data = await res.json();

      if (data.success) {
        onRefresh();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoadingId(null);
    }
  }

  async function deleteOffer(id) {
    const confirmed = confirm(
      "Are you sure you want to delete this offer?"
    );

    if (!confirmed) return;

    try {
      setLoadingId(id);

      const res = await fetch(`/api/offers/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        onRefresh();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b shrink-0">
          <div>
            <h2 className="text-2xl font-bold">
              Manage Offers
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Create and manage your special offers
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-2xl"
          >
            ×
          </button>
        </div>

        {/* Offers */}
        <div className="overflow-auto p-5">
          {offers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">
                No offers created yet.
              </p>

              <p className="text-sm mt-1">
                Create your first offer to attract students.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offers.map((offer) => (
                <div
                  key={offer._id}
                  className="border rounded-2xl p-5 shadow-sm hover:shadow-md transition"
                >
                  {/* Top */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold">
                        {offer.name}
                      </h3>

                      <p className="text-sm text-gray-500">
                        {getPlanName(offer.planId)}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        offer.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {offer.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 line-through">
                        ₹{offer.regularAmount}
                      </span>

                      <span className="text-2xl font-bold text-green-600">
                        ₹{offer.offerPrice}
                      </span>
                    </div>

                    <p className="text-sm text-green-700 mt-1">
                      Save ₹
                      {offer.regularAmount -
                        offer.offerPrice}
                    </p>
                  </div>

                  {/* Duration */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {offer.durationMonths}{" "}
                      {offer.durationMonths === 1
                        ? "Month"
                        : "Months"}
                    </span>

                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                      Valid till{" "}
                      {formatDate(offer.validUntil)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-5">
                    <button
                      onClick={() =>
                        toggleOffer(offer)
                      }
                      disabled={loadingId === offer._id}
                      className={`flex-1 py-2 rounded-lg text-white ${
                        offer.isActive
                          ? "bg-orange-500 hover:bg-orange-600"
                          : "bg-green-600 hover:bg-green-700"
                      } disabled:opacity-50`}
                    >
                      {loadingId === offer._id
                        ? "Updating..."
                        : offer.isActive
                        ? "Deactivate"
                        : "Activate"}
                    </button>

                    <button
                      onClick={() =>
                        deleteOffer(offer._id)
                      }
                      disabled={loadingId === offer._id}
                      className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="bg-gray-800 text-white px-5 py-2 rounded-lg hover:bg-gray-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}