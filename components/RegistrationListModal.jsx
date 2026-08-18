"use client";

import { useEffect, useState } from "react";
import RegisterStudentModal from "./RegisterStudentModal";

export default function RegistrationListModal({
  onClose,
}) {
  const [registrations, setRegistrations] =
    useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [openRegister, setOpenRegister] =
    useState(false);

  async function fetchRegistrations(
    searchValue = ""
  ) {
    try {
      setLoading(true);

      const url = searchValue
        ? `/api/registrations?search=${encodeURIComponent(
            searchValue
          )}`
        : "/api/registrations";

      const res = await fetch(url);

      const data = await res.json();

      if (data.success) {
        setRegistrations(data.registrations);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to load registrations.");
    } finally {
      setLoading(false);
    }
  }

  // Initial load
  useEffect(() => {
    fetchRegistrations();
  }, []);

  // Search with small delay
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRegistrations(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  function formatDate(date) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function maskAadhaar(aadhaar) {
    if (!aadhaar) return "-";

    const value = String(aadhaar);

    if (value.length !== 12) {
      return value;
    }

    return `XXXX XXXX ${value.slice(-4)}`;
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 p-4 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-full max-w-7xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="p-5 border-b">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <h2 className="text-2xl font-bold">
                Student Registrations
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Complete registration records
              </p>
            </div>

            <div className="flex gap-2">

              <button
                onClick={() =>
                  setOpenRegister(true)
                }
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                + Register Student
              </button>

              <button
                onClick={onClose}
                className="border px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>

            </div>

          </div>

          {/* Search */}
          <div className="mt-5">

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search by student name or Aadhaar number..."
              className="border w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

        </div>

        {/* Table */}
        <div className="p-5 flex-1 min-h-0 overflow-y-auto">

          {loading ? (
            <div className="py-10 text-center text-gray-500">
              Loading registrations...
            </div>
          ) : registrations.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              No registrations found.
            </div>
          ) : (
            <div className="border rounded-xl overflow-x-auto">

              <table className="w-full min-w-[950px]">

                <thead className="bg-gray-100">

                  <tr>

                    <th className="text-left p-3">
                      Reg. No.
                    </th>

                    <th className="text-left p-3">
                      Student
                    </th>

                    <th className="text-left p-3">
                      Father's Name
                    </th>

                    <th className="text-left p-3">
                      Joining History
                    </th>

                    <th className="text-left p-3">
                      Aadhaar
                    </th>

                    <th className="text-left p-3">
                      Mobile
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {registrations.map(
                    (registration) => (
                      <tr
                        key={registration._id}
                        className="border-t hover:bg-gray-50"
                      >

                        {/* Registration Number */}
                        <td className="p-3 font-bold text-blue-600">
                          #{registration.registrationNo}
                        </td>

                        {/* Student */}
                        <td className="p-3">
                          <div className="font-medium">
                            {registration.studentName}
                          </div>
                        </td>

                        {/* Father */}
                        <td className="p-3">
                          {registration.fatherName}
                        </td>

                        {/* Joining History */}
                        <td className="p-3">

                          <div className="space-y-1">

                            {registration.joiningHistory
                              ?.slice()
                              .reverse()
                              .map(
                                (
                                  entry,
                                  index
                                ) => (
                                  <div
                                    key={index}
                                    className="text-sm"
                                  >
                                    {formatDate(
                                      entry.date
                                    )}
                                  </div>
                                )
                              )}

                          </div>

                        </td>

                        {/* Aadhaar */}
                        <td className="p-3 font-mono">
                          {maskAadhaar(
                            registration.aadhaarNo
                          )}
                        </td>

                        {/* Mobile */}
                        <td className="p-3">
                          {registration.mobileNo}
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

      {/* Register Student Modal */}
      {openRegister && (
        <RegisterStudentModal
          onClose={() =>
            setOpenRegister(false)
          }
          onSuccess={() => {
            setOpenRegister(false);

            fetchRegistrations(search);
          }}
        />
      )}

    </div>
  );
}