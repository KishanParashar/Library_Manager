import SeatGrid from "@/components/SeatGrid";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import Library from "@/models/Library";
import Seat from "@/models/Seat";
import AddSeatsModal from "@/components/AddSeatsModal";
import Student from "@/models/Student";
import DashboardHeader from "@/components/DashboardHeader";
import Plan from "@/models/Plan";
import DashboardClient from "@/components/DashboardClient";
import Booking from "@/models/Booking";

export default async function DashboardPage() {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;


    if (!token) {
        return (
            <div className="p-10">
                <h1 className="text-2xl font-bold">Please login first</h1>
            </div>
        );
    }

    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return (
            <div className="p-10">
                <h1 className="text-2xl font-bold">Invalid session</h1>
            </div>
        );
    }



    const library = await Library.findById(decoded.libraryId);
    const seats = await Seat.find({
        libraryId: library._id,
    })
        .populate("studentId")
        .sort({ seatNumber: 1 })
        .lean();
    console.log("Seats count:", seats.length);


    const plans = await Plan.find({
        libraryId: library._id,
    }).sort({ startTime: 1 }).lean();

    const bookings = await Booking.find({
        libraryId: library._id,
    }).populate("planId").lean();


    const libraryData = JSON.parse(JSON.stringify(library));
    const plansData = JSON.parse(JSON.stringify(plans));
    const seatsData = JSON.parse(JSON.stringify(seats));
    const bookingsData = JSON.parse(JSON.stringify(bookings));


    return (
        <DashboardClient
            library={libraryData}
            plans={plansData}
            seats={seatsData}
            bookings={bookingsData}
        />
    );
}