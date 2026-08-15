import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import jwt from "jsonwebtoken";

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
        const { month } = await request.json();

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

        if (!booking.reminderHistory) {
            booking.reminderHistory = [];
        }

        if (!booking.reminderHistory.includes(month)) {
            booking.reminderHistory.push(month);
            await booking.save();
        }

        return Response.json({
            success: true,
            message: "Reminder marked as sent",
        });
    } catch (error) {
        console.error(error);

        return Response.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}