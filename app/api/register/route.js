import { connectDB } from "@/lib/mongodb";
import Library from "@/models/Library";
import bcrypt from "bcryptjs";
import Seat from "@/models/Seat";

export async function POST(request) {
    try {
        await connectDB();

        const body = await request.json();

        const { name, ownerName, email, password, totalSeats } = body;

        // Basic validation
        if (!name || !ownerName || !email || !password || !totalSeats) {
            return Response.json(
                { success: false, message: "All fields are required" },
                { status: 400 }
            );
        }

        // Check duplicate email
        const existingEmail = await Library.findOne({ email });
        if (existingEmail) {
            return Response.json(
                { success: false, message: "Email already registered" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 7-day free trial
        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + 7);

        const library = await Library.create({
            name,
            ownerName,
            email,
            password: hashedPassword,
            totalSeats: Number(totalSeats),
            plan: "starter",
            subscriptionStatus: "trial",
            trialEndsAt,
        });

        const seats = [];

        for (let i = 1; i <= Number(totalSeats); i++) {
            seats.push({
                libraryId: library._id,
                seatNumber: i,
            });
        }

        await Seat.insertMany(seats);

        return Response.json(
            {
                success: true,
                message: "Library registered successfully",
                libraryId: library._id,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("REGISTER ERROR:", error);

        return Response.json(
            {
                success: false,
                message: error.message,
            },
            { status: 500 }
        );
    }
}