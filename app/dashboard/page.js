import SeatGrid from "@/components/SeatGrid";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import Library from "@/models/Library";
import Seat from "@/models/Seat";
import AddSeatsModal from "@/components/AddSeatsModal";
import DashboardHeader from "@/components/DashboardHeader";

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

    return (
        <div className="p-10">
            <DashboardHeader library={JSON.parse(JSON.stringify(library))} />

            <SeatGrid seats={JSON.parse(JSON.stringify(seats))} />
        </div>
    );
}