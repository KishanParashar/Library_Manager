import { connectDB } from "@/lib/mongodb";
import Plan from "@/models/Plan";
import jwt from "jsonwebtoken";

export async function POST(request) {
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

    const { name, startTime, endTime, monthlyFee } =
      await request.json();

    if (!name || !startTime || !endTime) {
      return Response.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    const plan = await Plan.create({
      libraryId: decoded.libraryId,
      name,
      startTime,
      endTime,
      monthlyFee,
    });

    return Response.json({
      success: true,
      message: "Plan created successfully",
      plan,
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

export async function GET(request) {
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

    const plans = await Plan.find({
      libraryId: decoded.libraryId,
    }).sort({ startTime: 1 });

    return Response.json({
      success: true,
      plans,
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