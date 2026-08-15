import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Plan from "@/models/Plan";
import jwt from "jsonwebtoken";

function toMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export async function POST(request) {
  try {
    await connectDB();

    // Get token from cookie
    const cookie = request.headers.get("cookie");

    if (!cookie) {
      return Response.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const token = cookie
      .split(";")
      .find((c) => c.trim().startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return Response.json(
        { success: false, message: "Token missing" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { seatId, planId, studentName, phone } =
      await request.json();

    if (!seatId || !planId || !studentName || !phone) {
      return Response.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // Get selected plan
    const plan = await Plan.findById(planId);

    if (!plan) {
      return Response.json(
        { success: false, message: "Plan not found" },
        { status: 404 }
      );
    }

    const newStart = toMinutes(plan.startTime);
    const newEnd = toMinutes(plan.endTime);

    // Get all bookings for this seat
    const existingBookings = await Booking.find({ seatId });

    // Check overlap
    for (const booking of existingBookings) {
      const existingStart = toMinutes(booking.startTime);
      const existingEnd = toMinutes(booking.endTime);

      if (
        newStart < existingEnd &&
        newEnd > existingStart
      ) {
        return Response.json(
          {
            success: false,
            message: `Seat already booked between ${booking.startTime} and ${booking.endTime}`,
          },
          { status: 400 }
        );
      }
    }

    // Create booking
    const booking = await Booking.create({
      libraryId: decoded.libraryId,
      seatId,
      planId,
      studentName,
      phone,

      monthlyFee: plan.monthlyFee,

      startTime: plan.startTime,
      endTime: plan.endTime,
    });

    return Response.json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}