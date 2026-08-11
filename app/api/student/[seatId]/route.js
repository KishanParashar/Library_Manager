import { connectDB } from "@/lib/mongodb";
import Seat from "@/models/Seat";
import Student from "@/models/Student";
import jwt from "jsonwebtoken";

export async function DELETE(request, { params }) {
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { seatId } = await params;

    const seat = await Seat.findById(seatId);

    if (!seat) {
      return Response.json(
        { success: false, message: "Seat not found" },
        { status: 404 }
      );
    }

    if (seat.libraryId.toString() !== decoded.libraryId) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    if (seat.studentId) {
      await Student.findByIdAndDelete(seat.studentId);
    }

    seat.status = "available";
    seat.studentId = null;

    await seat.save();

    return Response.json({
      success: true,
      message: "Seat is now available",
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