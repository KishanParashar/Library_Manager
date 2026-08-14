import { connectDB } from "@/lib/mongodb";
import Plan from "@/models/Plan";
import Booking from "@/models/Booking";
import jwt from "jsonwebtoken";

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

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { id } = await params;

    const plan = await Plan.findById(id);

    if (!plan) {
      return Response.json(
        { success: false, message: "Plan not found" },
        { status: 404 }
      );
    }

    if (String(plan.libraryId) !== String(decoded.libraryId)) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const bookingCount = await Booking.countDocuments({
      planId: id,
    });

    if (bookingCount > 0) {
      return Response.json(
        {
          success: false,
          message: `Cannot delete plan. ${bookingCount} student(s) are currently assigned to this plan.`,
        },
        { status: 400 }
      );
    }

    await Plan.findByIdAndDelete(id);

    return Response.json({
      success: true,
      message: "Plan deleted successfully",
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