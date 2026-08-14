import { connectDB } from "@/lib/mongodb";
import Seat from "@/models/Seat";
import Booking from "@/models/Booking";
import Library from "@/models/Library";
import jwt from "jsonwebtoken";

// Toggle Available / Unavailable
export async function PUT(request, { params }) {
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

        const { id } = await params;
        const { isAvailable } = await request.json();

        const seat = await Seat.findById(id);

        if (!seat) {
            return Response.json(
                { success: false, message: "Seat not found" },
                { status: 404 }
            );
        }

        if (String(seat.libraryId) !== String(decoded.libraryId)) {
            return Response.json(
                { success: false, message: "Unauthorized" },
                { status: 403 }
            );
        }

        // Agar seat ko unavailable mark kar rahe hain
        if (!isAvailable) {
            const bookingCount = await Booking.countDocuments({
                seatId: seat._id,
            });

            if (bookingCount > 0) {
                return Response.json(
                    {
                        success: false,
                        message:
                            "Cannot mark this seat unavailable because students are assigned to it. Please shift them first.",
                    },
                    { status: 400 }
                );
            }
        }

        seat.isAvailable = isAvailable;
        await seat.save();

        return Response.json({
            success: true,
            message: isAvailable
                ? "Seat marked available"
                : "Seat marked unavailable",
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

// Delete only last seat
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

        const { id } = await params;

        const seat = await Seat.findById(id);

        if (!seat) {
            return Response.json(
                { success: false, message: "Seat not found" },
                { status: 404 }
            );
        }

        if (String(seat.libraryId) !== String(decoded.libraryId)) {
            return Response.json(
                { success: false, message: "Unauthorized" },
                { status: 403 }
            );
        }

        // Last seat check
        const lastSeat = await Seat.findOne({
            libraryId: seat.libraryId,
        }).sort({ seatNumber: -1 });

        if (String(lastSeat._id) !== String(seat._id)) {
            return Response.json(
                {
                    success: false,
                    message: "Only the last seat can be deleted.",
                },
                { status: 400 }
            );
        }

        // Booking check
        const bookingCount = await Booking.countDocuments({
            seatId: seat._id,
        });

        if (bookingCount > 0) {
            return Response.json(
                {
                    success: false,
                    message:
                        "Cannot delete seat. This seat has bookings in one or more plans.",
                },
                { status: 400 }
            );
        }

        await Seat.findByIdAndDelete(seat._id);

        await Library.findByIdAndUpdate(seat.libraryId, {
            $inc: { totalSeats: -1 },
        });

        return Response.json({
            success: true,
            message: "Seat deleted successfully",
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