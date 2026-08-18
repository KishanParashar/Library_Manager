"use client";

import { useState } from "react";

export default function RegisterStudentModal({
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState({
    studentName: "",
    fatherName: "",
    dateOfJoining: "",
    aadhaarNo: "",
    mobileNo: "",
  });

  const [loading, setLoading] = useState(false);

  const [existingStudent, setExistingStudent] =
    useState(null);

  const [rejoinDate, setRejoinDate] = useState("");

  const [rejoinLoading, setRejoinLoading] =
    useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleRegister(e) {
    e.preventDefault();

    setLoading(true);
    setExistingStudent(null);

    try {
      const res = await fetch(
        "/api/registrations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      // Student already exists
      if (data.alreadyExists) {
        setExistingStudent(data.registration);
        setRejoinDate(form.dateOfJoining);
        return;
      }

      if (!data.success) {
        alert(data.message);
        return;
      }

      alert(
        `Student registered successfully!\nRegistration No: ${data.registration.registrationNo}`
      );

      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRejoin() {
    if (!existingStudent) return;

    if (!rejoinDate) {
      alert("Please select rejoin date.");
      return;
    }

    const confirmed = confirm(
      `Rejoin ${existingStudent.studentName}?\n\nRegistration No: ${existingStudent.registrationNo}`
    );

    if (!confirmed) return;

    setRejoinLoading(true);

    try {
      const res = await fetch(
        `/api/registrations/${existingStudent._id}/rejoin`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: rejoinDate,
          }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        alert(data.message);
        return;
      }

      alert(
        `Student rejoined successfully!\nRegistration No: ${data.registration.registrationNo}`
      );

      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setRejoinLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-auto my-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            Register Student
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-xl"
          >
            ✕
          </button>
        </div>

        {/* Existing Student */}
        {existingStudent ? (
          <div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-5">

              <h3 className="font-bold text-orange-700 text-lg">
                ⚠️ Student Already Registered
              </h3>

              <div className="mt-3 space-y-1 text-sm">
                <p>
                  <strong>Registration No:</strong>{" "}
                  {existingStudent.registrationNo}
                </p>

                <p>
                  <strong>Name:</strong>{" "}
                  {existingStudent.studentName}
                </p>

                <p>
                  <strong>Father's Name:</strong>{" "}
                  {existingStudent.fatherName}
                </p>

                <p>
                  <strong>Mobile:</strong>{" "}
                  {existingStudent.mobileNo}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Rejoin Date
              </label>

              <input
                type="date"
                value={rejoinDate}
                onChange={(e) =>
                  setRejoinDate(e.target.value)
                }
                className="border w-full p-3 rounded-lg"
              />
            </div>

            <p className="text-sm text-gray-500 mb-5">
              Rejoining will keep the same registration
              number and only add a new date to the
              joining history.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setExistingStudent(null);
                  setRejoinDate("");
                }}
                className="border px-4 py-2 rounded-lg flex-1"
              >
                Back
              </button>

              <button
                onClick={handleRejoin}
                disabled={rejoinLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex-1 disabled:opacity-50"
              >
                {rejoinLoading
                  ? "Rejoining..."
                  : "Rejoin Student"}
              </button>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <form
            onSubmit={handleRegister}
            className="space-y-4"
          >

            {/* Student Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Student Name
              </label>

              <input
                type="text"
                name="studentName"
                value={form.studentName}
                onChange={handleChange}
                placeholder="Student Name"
                required
                className="border w-full p-3 rounded-lg"
              />
            </div>

            {/* Father's Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Father's Name
              </label>

              <input
                type="text"
                name="fatherName"
                value={form.fatherName}
                onChange={handleChange}
                placeholder="Father's Name"
                required
                className="border w-full p-3 rounded-lg"
              />
            </div>

            {/* Joining Date */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Date of Joining
              </label>

              <input
                type="date"
                name="dateOfJoining"
                value={form.dateOfJoining}
                onChange={handleChange}
                required
                className="border w-full p-3 rounded-lg"
              />
            </div>

            {/* Aadhaar */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Aadhaar Number
              </label>

              <input
                type="text"
                name="aadhaarNo"
                value={form.aadhaarNo}
                onChange={(e) => {
                  const value =
                    e.target.value.replace(
                      /\D/g,
                      ""
                    );

                  if (value.length <= 12) {
                    setForm((prev) => ({
                      ...prev,
                      aadhaarNo: value,
                    }));
                  }
                }}
                placeholder="12 digit Aadhaar number"
                inputMode="numeric"
                maxLength={12}
                required
                className="border w-full p-3 rounded-lg"
              />
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Mobile Number
              </label>

              <input
                type="text"
                name="mobileNo"
                value={form.mobileNo}
                onChange={(e) => {
                  const value =
                    e.target.value.replace(
                      /\D/g,
                      ""
                    );

                  if (value.length <= 10) {
                    setForm((prev) => ({
                      ...prev,
                      mobileNo: value,
                    }));
                  }
                }}
                placeholder="10 digit mobile number"
                inputMode="numeric"
                maxLength={10}
                required
                className="border w-full p-3 rounded-lg"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2">

              <button
                type="button"
                onClick={onClose}
                className="border px-4 py-2 rounded-lg flex-1"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex-1 disabled:opacity-50"
              >
                {loading
                  ? "Registering..."
                  : "Register Student"}
              </button>

            </div>
          </form>
        )}
      </div>
    </div>
  );
}