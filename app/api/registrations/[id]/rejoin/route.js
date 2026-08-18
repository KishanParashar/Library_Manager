import { connectDB } from "@/lib/mongodb";
import Registration from "@/models/Registration";
import jwt from "jsonwebtoken";

export async function PUT(request, { params }) {
  try {
    await connectDB();

    // -----------------------------
    // Authentication
    // -----------------------------

    const cookie = request.headers.get("cookie");

    if (!cookie) {
      return Response.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    const token = cookie
      .split(";")
      .find((c) =>
        c.trim().startsWith("token=")
      )
      ?.split("=")[1];

    if (!token) {
      return Response.json(
        {
          success: false,
          message: "Token missing",
        },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const libraryId = decoded.libraryId;

    // -----------------------------
    // Get registration ID
    // -----------------------------

    const { id } = await params;

    const body = await request.json();

    const { date } = body;

    if (!date) {
      return Response.json(
        {
          success: false,
          message: "Rejoin date is required",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // Find student
    // -----------------------------

    const registration =
      await Registration.findOne({
        _id: id,
        libraryId,
      });

    if (!registration) {
      return Response.json(
        {
          success: false,
          message: "Registration not found",
        },
        { status: 404 }
      );
    }

    // -----------------------------
    // Validate date
    // -----------------------------

    const rejoinDate = new Date(date);

    if (isNaN(rejoinDate.getTime())) {
      return Response.json(
        {
          success: false,
          message: "Invalid rejoin date",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // Prevent duplicate same-day
    // rejoin entry
    // -----------------------------

    const alreadyJoined =
      registration.joiningHistory.some(
        (entry) => {
          const existingDate =
            new Date(entry.date);

          return (
            existingDate.toISOString().split("T")[0] ===
            rejoinDate.toISOString().split("T")[0]
          );
        }
      );

    if (alreadyJoined) {
      return Response.json(
        {
          success: false,
          message:
            "This date is already present in joining history.",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // Add new joining date
    // -----------------------------

    registration.joiningHistory.push({
      date: rejoinDate,
    });

    await registration.save();

    return Response.json({
      success: true,
      message: "Student rejoined successfully",
      registration,
    });
  } catch (error) {
    console.error(
      "Rejoin error:",
      error
    );

    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}