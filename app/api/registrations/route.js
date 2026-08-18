import { connectDB } from "@/lib/mongodb";
import Registration from "@/models/Registration";
import RegistrationCounter from "@/models/RegistrationCounter";
import jwt from "jsonwebtoken";

export async function POST(request) {
    try {
        await connectDB();

        // -----------------------------
        // Authentication
        // -----------------------------

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
            .find((c) =>
                c.trim().startsWith("token=")
            )
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

        const libraryId = decoded.libraryId;

        // -----------------------------
        // Get request data
        // -----------------------------

        const body = await request.json();

        const {
            studentName,
            fatherName,
            dateOfJoining,
            aadhaarNo,
            mobileNo,
        } = body;

        // -----------------------------
        // Basic validation
        // -----------------------------

        if (
            !studentName ||
            !fatherName ||
            !dateOfJoining ||
            !aadhaarNo ||
            !mobileNo
        ) {
            return Response.json(
                {
                    success: false,
                    message: "All fields are required",
                },
                { status: 400 }
            );
        }

        // -----------------------------
        // Aadhaar validation
        // -----------------------------

        const cleanAadhaar = String(
            aadhaarNo
        ).replace(/\s/g, "");

        if (!/^\d{12}$/.test(cleanAadhaar)) {
            return Response.json(
                {
                    success: false,
                    message:
                        "Aadhaar number must contain exactly 12 digits",
                },
                { status: 400 }
            );
        }

        // -----------------------------
        // Mobile validation
        // -----------------------------

        const cleanMobile = String(
            mobileNo
        ).replace(/\s/g, "");

        if (!/^\d{10}$/.test(cleanMobile)) {
            return Response.json(
                {
                    success: false,
                    message:
                        "Mobile number must contain exactly 10 digits",
                },
                { status: 400 }
            );
        }

        // -----------------------------
        // Check existing Aadhaar
        // -----------------------------

        const existingStudent =
            await Registration.findOne({
                libraryId,
                aadhaarNo: cleanAadhaar,
            });

        if (existingStudent) {
            return Response.json(
                {
                    success: false,
                    alreadyExists: true,
                    message:
                        "Student with this Aadhaar is already registered",
                    registration: existingStudent,
                },
                { status: 409 }
            );
        }

        // -----------------------------
        // Generate Registration Number
        // -----------------------------

        const counter =
            await RegistrationCounter.findOneAndUpdate(
                { libraryId },
                {
                    $inc: {
                        sequence: 1,
                    },
                },
                {
                    new: true,
                    upsert: true,
                    setDefaultsOnInsert: true,
                }
            );

        const registrationNo =
            counter.sequence;

        // -----------------------------
        // Create Registration
        // -----------------------------

        const registration =
            await Registration.create({
                libraryId,
                registrationNo,
                studentName: studentName.trim(),
                fatherName: fatherName.trim(),
                aadhaarNo: cleanAadhaar,
                mobileNo: cleanMobile,
                joiningHistory: [
                    {
                        date: new Date(dateOfJoining),
                    },
                ],
            });

        return Response.json(
            {
                success: true,
                message:
                    "Student registered successfully",
                registration,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error(
            "Registration error:",
            error
        );

        // MongoDB duplicate key protection
        if (error.code === 11000) {
            return Response.json(
                {
                    success: false,
                    alreadyExists: true,
                    message:
                        "This Aadhaar or registration number already exists.",
                },
                { status: 409 }
            );
        }

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

        // -----------------------------
        // Authentication
        // -----------------------------

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
            .find((c) =>
                c.trim().startsWith("token=")
            )
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

        const libraryId = decoded.libraryId;

        // -----------------------------
        // Search
        // -----------------------------

        const { searchParams } =
            new URL(request.url);

        const search =
            searchParams.get("search")?.trim() || "";

        // -----------------------------
        // Build query
        // -----------------------------

        const query = {
            libraryId,
        };

        if (search) {
            query.$or = [
                {
                    studentName: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    aadhaarNo: {
                        $regex: search,
                        $options: "i",
                    },
                },
            ];
        }

        // -----------------------------
        // Fetch registrations
        // -----------------------------

        const registrations =
            await Registration.find(query)
                .sort({ createdAt: -1 })
                .lean();

        return Response.json({
            success: true,
            registrations,
        });
    } catch (error) {
        console.error(
            "Fetch registrations error:",
            error
        );

        return Response.json(
            {
                success: false,
                message: error.message,
            },
            { status: 500 }
        );
    }
}