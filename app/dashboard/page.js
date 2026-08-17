export const dynamic = "force-dynamic";
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
import Payment from "@/models/Payment";
import Offer from "@/models/Offer";

export default async function DashboardPage({ searchParams }) {
    await connectDB();
    const params = await searchParams;
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

    const offers = await Offer.find({
        libraryId: library._id,
    })
        .populate("planId")
        .sort({ createdAt: -1 })
        .lean();

    const now = new Date();
    const defaultMonth = `${now.getFullYear()}-${String(
        now.getMonth() + 1
    ).padStart(2, "0")}`;

    const selectedMonth =
        params?.month || defaultMonth;

    const bookings = await Booking.find({
        libraryId: library._id,
    })
        .populate("planId")
        .populate("seatId")
        .lean();

    // Payments actually received in the selected month
    const receivedPayments = await Payment.find({
        libraryId: library._id,
        month: selectedMonth,
    }).lean();

    // Payments that cover the selected month
    const coveringPayments = await Payment.find({
        libraryId: library._id,
        $or: [
            // Existing + new monthly payments
            {
                $or: [
                    { paymentType: "monthly" },
                    { paymentType: { $exists: false } },
                ],
                month: selectedMonth,
            },

            // Offer payments
            {
                paymentType: "offer",
                startMonth: { $lte: selectedMonth },
                endMonth: { $gte: selectedMonth },
            },
        ],
    }).lean();

    const totalStudents = bookings.length;

    // Students whose selected month is covered
    const paidBookingIds = new Set(
        coveringPayments.map((p) => String(p.bookingId))
    );

    const paidStudents = paidBookingIds.size;

    const unpaidStudents =
        totalStudents - paidStudents;

    // IMPORTANT:
    // Collection only counts money actually received
    // in the selected month.
    const totalCollection = receivedPayments.reduce(
        (sum, p) => sum + (p.amount || 0),
        0
    );
    const pendingCollection = bookings
        .filter(
            (b) =>
                !paidBookingIds.has(String(b._id))
        )
        .reduce(
            (sum, b) =>
                sum + (b.monthlyFee || b.planId?.monthlyFee || 0),
            0
        );

    const stats = {
        totalStudents,
        paidStudents,
        unpaidStudents,
        totalCollection,
        pendingCollection,
    };

    const pendingStudents = bookings
        .filter(
            (b) =>
                !paidBookingIds.has(String(b._id))
        )
        .map((b) => ({
            _id: b._id,
            seatNumber: b.seatId?.seatNumber || "-",
            studentName: b.studentName,
            phone: b.phone,
            planName: b.planId?.name || "Plan",
            monthlyFee: b.monthlyFee || b.planId?.monthlyFee || 0,
            reminderHistory: b.reminderHistory || [],
        }));

    const libraryData = JSON.parse(JSON.stringify(library));
    const plansData = JSON.parse(JSON.stringify(plans));
    const seatsData = JSON.parse(JSON.stringify(seats));
    const bookingsData = JSON.parse(JSON.stringify(bookings));
    const pendingStudentsData = JSON.parse(JSON.stringify(pendingStudents));
    const offersData = JSON.parse(JSON.stringify(offers));


    return (
        <DashboardClient
            library={libraryData}
            plans={plansData}
            seats={seatsData}
            bookings={bookingsData}
            stats={stats}
            pendingStudents={pendingStudentsData}
            selectedMonth={selectedMonth}
            offers={offersData}
        />
    );
}