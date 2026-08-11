import { connectDB } from "@/lib/mongodb";
import Library from "@/models/Library";
import Seat from "@/models/Seat";
import jwt from "jsonwebtoken";

export async function GET(request) {
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

        const library = await Library.findById(decoded.libraryId);

        if (!library) {
            return Response.json(
                { success: false, message: "Library not found" },
                { status: 404 }
            );
        }

        const seats = await Seat.find({
            libraryId: library._id,
        }).sort({ seatNumber: 1 });

        return Response.json({
            success: true,
            library: {
                id: library._id,
                name: library.name,
                totalSeats: library.totalSeats,
            },
            seats,
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