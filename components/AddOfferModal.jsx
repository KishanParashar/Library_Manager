"use client";

import { useState } from "react";

export default function AddOfferModal({
  plans,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState({
    name: "",
    planId: "",
    durationMonths: "3",
    regularAmount: "",
    offerPrice: "",
    validFrom: "",
    validUntil: "",
  });

  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (
      !form.name ||
      !form.planId ||
      !form.durationMonths ||
      !form.regularAmount ||
      !form.offerPrice ||
      !form.validFrom ||
      !form.validUntil
    ) {
      alert("Please fill all fields");
      return;
    }

    if (Number(form.offerPrice) >= Number(form.regularAmount)) {
      alert("Offer price should be less than regular price");
      return;
    }

    if (new Date(form.validUntil) < new Date(form.validFrom)) {
      alert("Offer expiry date cannot be before start date");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/offers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          planId: form.planId,
          durationMonths: Number(form.durationMonths),
          regularAmount: Number(form.regularAmount),
          offerPrice: Number(form.offerPrice),
          validFrom: form.validFrom,
          validUntil: form.validUntil,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Offer created successfully");
        onSuccess();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 mt-14">

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">
              Create Offer
            </h2>
            <p className="text-sm text-gray-500">
              Create a special price for your students
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Offer Name */}
          <input
            type="text"
            name="name"
            placeholder="Offer Name (e.g. 3 Month Special)"
            value={form.name}
            onChange={handleChange}
            className="border w-full p-3 rounded-lg"
          />

          {/* Plan */}
          <select
            name="planId"
            value={form.planId}
            onChange={handleChange}
            className="border w-full p-3 rounded-lg"
          >
            <option value="">Select Plan</option>

            {plans.map((plan) => (
              <option key={plan._id} value={plan._id}>
                {plan.name} ({plan.startTime} - {plan.endTime})
              </option>
            ))}
          </select>

          {/* Duration */}
          <select
            name="durationMonths"
            value={form.durationMonths}
            onChange={handleChange}
            className="border w-full p-3 rounded-lg"
          >
            <option value="1">1 Month</option>
            <option value="2">2 Months</option>
            <option value="3">3 Months</option>
            <option value="6">6 Months</option>
            <option value="12">12 Months</option>
          </select>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-3">

            <input
              type="number"
              name="regularAmount"
              placeholder="Regular Amount"
              min="0"
              value={form.regularAmount}
              onChange={handleChange}
              className="border w-full p-3 rounded-lg"
            />

            <input
              type="number"
              name="offerPrice"
              placeholder="Offer Price"
              min="0"
              value={form.offerPrice}
              onChange={handleChange}
              className="border w-full p-3 rounded-lg"
            />

          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">

            <div>
              <label className="text-sm text-gray-600">
                Valid From
              </label>

              <input
                type="date"
                name="validFrom"
                value={form.validFrom}
                onChange={handleChange}
                className="border w-full p-3 rounded-lg mt-1"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">
                Valid Until
              </label>

              <input
                type="date"
                name="validUntil"
                value={form.validUntil}
                onChange={handleChange}
                className="border w-full p-3 rounded-lg mt-1"
              />
            </div>

          </div>

          {/* Preview */}
          {form.regularAmount && form.offerPrice && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-gray-600">
                Student will pay
              </p>

              <div className="flex items-center gap-2">
                <span className="text-gray-400 line-through">
                  ₹{form.regularAmount}
                </span>

                <span className="text-2xl font-bold text-green-700">
                  ₹{form.offerPrice}
                </span>
              </div>

              <p className="text-sm text-green-700">
                Save ₹
                {Math.max(
                  0,
                  Number(form.regularAmount) -
                    Number(form.offerPrice)
                )}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">

            <button
              type="button"
              onClick={onClose}
              className="flex-1 border py-3 rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Offer"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}