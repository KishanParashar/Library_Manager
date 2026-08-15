import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import jwt from "jsonwebtoken";
import Plan from "@/models/Plan";

function toMinutes(time) {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
}

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

        const {
            seatId,
            planId,
            studentName,
            phone,
        } = await request.json();

        const plan = await Plan.findById(planId);

        if (!plan) {
            return Response.json(
                { success: false, message: "Plan not found" },
                { status: 404 }
            );
        }

        const newStart = toMinutes(plan.startTime);
        const newEnd = toMinutes(plan.endTime);

        // Same seat ki sab bookings lao, lekin current booking ko ignore karo
        const existingBookings = await Booking.find({
            seatId,
            _id: { $ne: id },
        });

        for (const b of existingBookings) {
            const existingStart = toMinutes(b.startTime);
            const existingEnd = toMinutes(b.endTime);

            if (
                newStart < existingEnd &&
                newEnd > existingStart
            ) {
                return Response.json(
                    {
                        success: false,
                        message: `Seat already booked between ${b.startTime} and ${b.endTime}`,
                    },
                    { status: 400 }
                );
            }
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            id,
            {
                seatId,
                planId,
                studentName,
                phone,
                monthlyFee: plan.monthlyFee,
                startTime: plan.startTime,
                endTime: plan.endTime,
            },
            {
                new: true,
                runValidators: false,
            }
        );

        return Response.json({
            success: true,
            message: "Booking updated successfully",
            booking: updatedBooking,
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

        // Extra security: owner sirf apni library ki booking delete kare
        if (String(booking.libraryId) !== String(decoded.libraryId)) {
            return Response.json(
                { success: false, message: "Unauthorized" },
                { status: 403 }
            );
        }

        await Booking.findByIdAndDelete(id);

        return Response.json({
            success: true,
            message: "Booking deleted successfully",
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