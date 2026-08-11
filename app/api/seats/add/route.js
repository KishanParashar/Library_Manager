import { connectDB } from "@/lib/mongodb";
import Library from "@/models/Library";
import Seat from "@/models/Seat";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    await connectDB();

    // Cookie se token nikaalo
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

    const { count } = await request.json();

    if (!count || count <= 0) {
      return Response.json(
        { success: false, message: "Invalid seat count" },
        { status: 400 }
      );
    }

    // Library find karo
    const library = await Library.findById(decoded.libraryId);

    if (!library) {
      return Response.json(
        { success: false, message: "Library not found" },
        { status: 404 }
      );
    }

    // Last seat number nikaalo
    const lastSeat = await Seat.findOne({
      libraryId: library._id,
    }).sort({ seatNumber: -1 });

    const start = lastSeat ? lastSeat.seatNumber + 1 : 1;

    const newSeats = [];

    for (let i = start; i < start + Number(count); i++) {
      newSeats.push({
        libraryId: library._id,
        seatNumber: i,
        status: "available",
      });
    }

    await Seat.insertMany(newSeats);

    library.totalSeats += Number(count);

    await library.save();

    return Response.json({
      success: true,
      message: `${count} seats added successfully`,
      totalSeats: library.totalSeats,
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