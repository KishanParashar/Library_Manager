import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Booking from "@/models/Booking";
import jwt from "jsonwebtoken";

export async function GET(request, { params }) {
  try {
    await connectDB();

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

    const { id } = await params;

    const booking = await Booking.findById(id);

    if (!booking) {
      return Response.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    if (String(booking.libraryId) !== String(decoded.libraryId)) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const payments = await Payment.find({
      bookingId: booking._id,
    }).sort({ paidDate: -1 });

    return Response.json({
      success: true,
      payments,
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