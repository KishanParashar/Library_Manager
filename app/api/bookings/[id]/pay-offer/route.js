import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Plan from "@/models/Plan";
import Offer from "@/models/Offer";
import Payment from "@/models/Payment";
import jwt from "jsonwebtoken";

function addMonths(month, months) {
  const [year, monthNumber] = month.split("-").map(Number);

  const date = new Date(
    year,
    monthNumber - 1 + months,
    1
  );

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

export async function POST(request, { params }) {
  try {
    await connectDB();

    const cookie = request.headers.get("cookie");

    if (!cookie) {
      return Response.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    const token = cookie
      .split(";")
      .find((c) => c.trim().startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return Response.json(
        {
          success: false,
          message: "Token missing",
        },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const { id } = await params;

    const body = await request.json();

    const { offerId } = body;

    if (!offerId) {
      return Response.json(
        {
          success: false,
          message: "Offer ID is required",
        },
        { status: 400 }
      );
    }

    const booking = await Booking.findById(id).populate(
      "planId"
    );

    if (!booking) {
      return Response.json(
        {
          success: false,
          message: "Booking not found",
        },
        { status: 404 }
      );
    }

    if (
      String(booking.libraryId) !==
      String(decoded.libraryId)
    ) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 403 }
      );
    }

    const offer = await Offer.findOne({
      _id: offerId,
      libraryId: decoded.libraryId,
      isActive: true,
    });

    if (!offer) {
      return Response.json(
        {
          success: false,
          message: "Offer not found or inactive",
        },
        { status: 404 }
      );
    }

    // Make sure offer belongs to student's plan
    if (
      String(offer.planId) !==
      String(booking.planId._id)
    ) {
      return Response.json(
        {
          success: false,
          message:
            "This offer is not available for this student's plan.",
        },
        { status: 400 }
      );
    }

    // Check offer validity
    const now = new Date();

    const validFrom = new Date(offer.validFrom);
    const validUntil = new Date(offer.validUntil);

    if (now < validFrom || now > validUntil) {
      return Response.json(
        {
          success: false,
          message: "This offer has expired or is not active yet.",
        },
        { status: 400 }
      );
    }

    const currentMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

    const endMonth = addMonths(
      currentMonth,
      offer.durationMonths - 1
    );

    // Check if current month already has payment
    const existingPayment = await Payment.findOne({
      bookingId: booking._id,
      month: currentMonth,
    });

    if (existingPayment) {
      return Response.json(
        {
          success: false,
          message:
            "This student's current month is already paid.",
        },
        { status: 400 }
      );
    }

    // Create ONE payment record.
    // This payment covers multiple months.
    const payment = await Payment.create({
      libraryId: booking.libraryId,
      bookingId: booking._id,
      month: currentMonth,
      amount: offer.offerPrice,
      paymentType: "offer",
      offerId: offer._id,
      startMonth: currentMonth,
      endMonth,
      paidDate: now,
    });

    // Keep current month's status updated
    await Booking.findByIdAndUpdate(
      booking._id,
      {
        lastPaidMonth: currentMonth,
        lastPaidDate: now,
      }
    );

    return Response.json({
      success: true,
      message: "Offer payment applied successfully",
      payment,
      startMonth: currentMonth,
      endMonth,
    });
  } catch (error) {
    console.error("Offer payment error:", error);

    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}