"use client";

export default function ManagePlansModal({
  plans,
  onClose,
  onRefresh,
}) {
  async function handleDelete(planId) {
    const confirmDelete = confirm(
      "Are you sure you want to delete this plan?"
    );

    if (!confirmDelete) return;

    const res = await fetch(`/api/plans/${planId}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (data.success) {
      alert(data.message);
      onRefresh();
    } else {
      alert(data.message);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[500px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Manage Plans</h2>

          <button
            onClick={onClose}
            className="text-gray-500 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className="border rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <h3 className="font-bold text-lg">
                  {plan.name}
                </h3>

                <p className="text-gray-600">
                  {plan.startTime} - {plan.endTime}
                </p>

                <p className="text-gray-600">
                  ₹{plan.monthlyFee}/month
                </p>
              </div>

              <button
                onClick={() => handleDelete(plan._id)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          ))}

          {plans.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              No plans available
            </p>
          )}
        </div>
      </div>
    </div>
  );
}