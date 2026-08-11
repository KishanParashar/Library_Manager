import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import Seat from "@/models/Seat";
import jwt from "jsonwebtoken";

export async function POST(request) {
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

    const { seatId, name, phone, monthlyFee } = await request.json();

    const seat = await Seat.findById(seatId);

    if (!seat) {
      return Response.json(
        { success: false, message: "Seat not found" },
        { status: 404 }
      );
    }

    if (seat.status === "occupied") {
      return Response.json(
        { success: false, message: "Seat already occupied" },
        { status: 400 }
      );
    }

    const student = await Student.create({
      libraryId: decoded.libraryId,
      seatId,
      name,
      phone,
      monthlyFee,
    });

    seat.status = "occupied";
    seat.studentId = student._id;

    await seat.save();

    return Response.json({
      success: true,
      message: "Student assigned successfully",
      student,
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