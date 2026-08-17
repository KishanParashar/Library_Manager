import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import Offer from "@/models/Offer";

async function authenticate() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Unauthorized");
  }

  return jwt.verify(
    token,
    process.env.JWT_SECRET
  );
}

export async function PUT(request, { params }) {
  try {
    await connectDB();

    const decoded = await authenticate();
    const { id } = await params;

    const body = await request.json();

    const offer = await Offer.findOne({
      _id: id,
      libraryId: decoded.libraryId,
    });

    if (!offer) {
      return NextResponse.json(
        {
          success: false,
          message: "Offer not found",
        },
        { status: 404 }
      );
    }

    if (body.isActive !== undefined) {
      offer.isActive = body.isActive;
    }

    await offer.save();

    return NextResponse.json({
      success: true,
      message: "Offer updated successfully",
      offer,
    });
  } catch (error) {
    console.error("Update offer error:", error);

    return NextResponse.json(
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

    const decoded = await authenticate();
    const { id } = await params;

    const offer = await Offer.findOneAndDelete({
      _id: id,
      libraryId: decoded.libraryId,
    });

    if (!offer) {
      return NextResponse.json(
        {
          success: false,
          message: "Offer not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Offer deleted successfully",
    });
  } catch (error) {
    console.error("Delete offer error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}