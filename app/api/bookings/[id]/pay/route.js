import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import jwt from "jsonwebtoken";
import Payment from "@/models/Payment";

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

        const booking = await Booking.findById(id).populate("planId");

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

        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(
            now.getMonth() + 1
        ).padStart(2, "0")}`;

        // Duplicate payment check
        const existingPayment = await Payment.findOne({
            bookingId: booking._id,
            month: currentMonth,
        });

        if (existingPayment) {
            return Response.json(
                {
                    success: false,
                    message: "Fee for this month is already marked as paid.",
                },
                { status: 400 }
            );
        }

        // Update booking
        const updatedBooking = await Booking.findByIdAndUpdate(
            id,
            {
                lastPaidMonth: currentMonth,
                lastPaidDate: now,
                monthlyFee: booking.monthlyFee || booking.planId?.monthlyFee || 0,
            },
            { new: true }
        );

        // Create payment history record
        await Payment.create({
            libraryId: booking.libraryId,
            bookingId: booking._id,
            month: currentMonth,
            amount: booking.monthlyFee || booking.planId?.monthlyFee || 0,
            paidDate: now,
        });

        return Response.json({
            success: true,
            message: "Payment marked successfully",
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