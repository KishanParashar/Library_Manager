import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import Offer from "@/models/Offer";

export async function POST(request) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid session",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      name,
      planId,
      durationMonths,
      regularAmount,
      offerPrice,
      validFrom,
      validUntil,
    } = body;

    if (
      !name ||
      !planId ||
      !durationMonths ||
      regularAmount === undefined ||
      offerPrice === undefined ||
      !validFrom ||
      !validUntil
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    if (Number(offerPrice) >= Number(regularAmount)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Offer price must be less than regular amount",
        },
        { status: 400 }
      );
    }

    if (
      new Date(validUntil) <
      new Date(validFrom)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid offer validity dates",
        },
        { status: 400 }
      );
    }

    const offer = await Offer.create({
      libraryId: decoded.libraryId,
      planId,
      name,
      durationMonths: Number(durationMonths),
      regularAmount: Number(regularAmount),
      offerPrice: Number(offerPrice),
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      message: "Offer created successfully",
      offer,
    });
  } catch (error) {
    console.error("Create offer error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}
export async function GET() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const offers = await Offer.find({
      libraryId: decoded.libraryId,
    })
      .populate("planId")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      offers,
    });
  } catch (error) {
    console.error("Get offers error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}